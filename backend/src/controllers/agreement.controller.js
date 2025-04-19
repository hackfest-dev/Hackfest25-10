import { ethers } from "ethers";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { extractWalletAddressandPrivateKey } from "../helpers/extractWallet.js";
import { Payment } from "../models/payment.model.js";
import { EMIMANAGER_ABI } from "../constants/EMIManagerABI.js";
import { TOKEN_ABI } from "../constants/tokenABI.js";
import PendingBorrower from "../models/pendingBorrowers.model.js";
import mongoose from "mongoose";

// Configuration (should move to environment variables)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PROVIDER_URL = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;
const tokenAddress = process.env.TOKEN_ADDRESS;

const initiateAgreement = asyncHandler(async (req, res) => {
  const {
    lenderId,
    borrowerId,
    sellerAddress,
    totalAmount,
    interestRate,
    months,
  } = req.body;
  await PendingBorrower.findOneAndUpdate(
    { borrowerId, lenderId: { $exists: true, $ne: null } },
    { isClaimed: true }
  );

  // Validate required fields
  if (
    !lenderId ||
    !borrowerId ||
    !sellerAddress ||
    !totalAmount ||
    !interestRate ||
    !months
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Extract wallet details
  const { walletAddress: lenderAddress, privateKey: lenderPrivateKey } =
    await extractWalletAddressandPrivateKey(lenderId);
  const { walletAddress: borrowerAddress } =
    await extractWalletAddressandPrivateKey(borrowerId);
  console.log(lenderAddress, lenderPrivateKey, borrowerAddress);
  if (!lenderAddress || !lenderPrivateKey || !borrowerAddress) {
    throw new ApiError(400, "Wallet details not found");
  }

  try {
    // Setup provider and signer
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const lenderWallet = new ethers.Wallet(lenderPrivateKey, provider);

    // Create contract instances
    const tokenContract = new ethers.Contract(
      tokenAddress,
      TOKEN_ABI,
      lenderWallet
    );
    const emiManagerContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      EMIMANAGER_ABI,
      lenderWallet
    );

    // Convert amount to BigNumber
    const parsedAmount = ethers.parseUnits(totalAmount.toString(), 18);
    const startTime = Math.floor(Date.now() / 1000) + 120;

    // Step 1: Transfer tokens to borrower
    const transferTx = await tokenContract.transfer(
      sellerAddress,
      parsedAmount
    );
    await transferTx.wait();

    // Step 2: Create EMI Agreement
    const createTx = await emiManagerContract.createAgreement(
      lenderAddress,
      borrowerAddress,
      tokenAddress,
      parsedAmount,
      interestRate * 100,
      months,
      startTime
    );

    const receipt = await createTx.wait();

    // Extract agreement ID from event logs
    const agreementId = parseInt(receipt.logs[0].data, 16);

    // Create response data
    const responseData = {
      agreementId,
      lender: lenderAddress,
      borrower: borrowerAddress,
      token: tokenAddress,
      totalAmount: totalAmount,
      interestRate,
      months,
      startTime: new Date(startTime * 1000).toISOString(),
      transactionHash: receipt.hash,
    };

    await Payment.create({
      borrowerId,
      lenderId,
      agreementId: agreementId.toString(),
      transactionHashes: [],
      isActive: true,
    });
    return res
      .status(201)
      .json(
        new ApiResponse(201, responseData, "Agreement created successfully")
      );
  } catch (error) {
    console.error("Agreement creation error:", error);
    throw new ApiError(500, `Agreement creation failed: ${error.message}`);
  }
});

const payEmi = asyncHandler(async (req, res) => {
  try {
    const { borrowerId } = req.body;

    // Find active payment agreement
    const borrowerPayment = await Payment.findOne({
      borrowerId,
      isActive: true,
    });

    if (!borrowerPayment) {
      throw new ApiError(404, "No active payment agreement found");
    }

    // Extract borrower wallet details
    const { walletAddress: borrowerAddress, privateKey: borrowerPrivateKey } =
      await extractWalletAddressandPrivateKey(borrowerId);

    if (!borrowerAddress || !borrowerPrivateKey) {
      throw new ApiError(400, "Borrower wallet details not found");
    }

    // Setup blockchain connections
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const borrowerWallet = new ethers.Wallet(borrowerPrivateKey, provider);

    const emiManagerContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      EMIMANAGER_ABI,
      borrowerWallet
    );

    const tokenContract = new ethers.Contract(
      tokenAddress,
      TOKEN_ABI,
      borrowerWallet
    );

    const agreementId = parseInt(borrowerPayment.agreementId);

    // Get agreement details
    const [nextDueDate, nextEMIAmount, agreement, remainingMonths] =
      await Promise.all([
        emiManagerContract.getNextDueDate(agreementId),
        emiManagerContract.getCurrentEMIAmount(agreementId),
        emiManagerContract.getAgreementDetails(agreementId),
        emiManagerContract.getRemainingEMIs(agreementId),
      ]);

    // Validate payment timing
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime <= Number(nextDueDate) - 60) {
      throw new ApiError(
        400,
        `Payment not due yet. Next payment due: ${new Date(
          Number(nextDueDate) * 1000
        ).toLocaleString()}`
      );
    }

    // Calculate required approval (remaining EMIs * EMI amount + buffer)
    const totalApprovalNeeded = nextEMIAmount * BigInt(remainingMonths) + 1n;

    // Check current allowance
    const currentAllowance = await tokenContract.allowance(
      borrowerAddress,
      CONTRACT_ADDRESS
    );

    // Approve if insufficient allowance
    if (currentAllowance < totalApprovalNeeded) {
      const approveTx = await tokenContract.approve(
        CONTRACT_ADDRESS,
        totalApprovalNeeded
      );
      await approveTx.wait();
    }

    // Execute payment transactions
    const transferTx = await tokenContract.transfer(
      agreement.lender,
      nextEMIAmount
    );
    await transferTx.wait();

    const updateTx = await emiManagerContract.updatePaymentStatus(agreementId);
    const updateReceipt = await updateTx.wait();

    // Update database record
    const newRemainingEMIs = await emiManagerContract.getRemainingEMIs(
      agreementId
    );

    borrowerPayment.transactionHashes.push(transferTx.hash, updateTx.hash);
    borrowerPayment.isActive = newRemainingEMIs > 0;
    await borrowerPayment.save();

    // Prepare response
    const responseData = {
      agreementId: agreementId.toString(),
      amountPaid: ethers.formatEther(nextEMIAmount),
      remainingEMIs: newRemainingEMIs.toString(),
      nextDueDate: new Date(
        Number(await emiManagerContract.getNextDueDate(agreementId)) * 1000
      ).toISOString(),
      transactionHashes: [transferTx.hash, updateTx.hash],
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, responseData, "EMI payment processed successfully")
      );
  } catch (error) {
    console.error("EMI Payment Error:", error);
    throw new ApiError(
      500,
      error.message.includes("reverted")
        ? "Contract operation failed. Check payment conditions."
        : `EMI payment failed: ${error.message}`
    );
  }
});

const getBorrowerAgreementDetails = asyncHandler(async (req, res) => {
  try {
    const { borrowerId } = req.params;

    const borrowerPayments = await Payment.find({ borrowerId });

    if (!borrowerPayments || borrowerPayments.length === 0) {
      throw new ApiError(404, "No agreements found for this borrower");
    }

    const { walletAddress: borrowerAddress, privateKey: borrowerPrivateKey } =
      await extractWalletAddressandPrivateKey(borrowerId);

    if (!borrowerAddress || !borrowerPrivateKey) {
      throw new ApiError(400, "Borrower wallet details not found");
    }

    // Setup blockchain connections
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const borrowerWallet = new ethers.Wallet(borrowerPrivateKey, provider);

    const emiManagerContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      EMIMANAGER_ABI,
      borrowerWallet
    );

    const agreementDetails = await Promise.all(
      borrowerPayments.map(async (payment) => {
        const agreementId = parseInt(payment.agreementId);

        try {
          const [
            agreementData,
            remainingEMIs,
            nextDueDate,
            currentEMIAmount,
            totalPaid,
            totalRemaining,
          ] = await Promise.all([
            emiManagerContract.getAgreementDetails(agreementId),
            emiManagerContract.getRemainingEMIs(agreementId),
            emiManagerContract.getNextDueDate(agreementId),
            emiManagerContract.getCurrentEMIAmount(agreementId),
            emiManagerContract.getTotalAmountPaid(agreementId),
            emiManagerContract.getTotalAmountRemaining(agreementId),
          ]);

          const formatToken = (amount) => ethers.formatEther(amount);

          const pendingBorrower = await PendingBorrower.findOne({ borrowerId });
          const itemName = pendingBorrower?.item || "N/A";

          return {
            agreementId: agreementId.toString(),
            lender: agreementData.lender,
            borrower: agreementData.borrower,
            token: agreementData.token,
            isActive: agreementData.isActive,
            totalAmount: formatToken(agreementData.totalAmount),
            interestRate: Number(agreementData.interestRate) / 100,
            months: agreementData.months.toString(),
            paymentsMade: agreementData.paymentsMade.toString(),
            nextPaymentDue: new Date(Number(nextDueDate) * 1000).toISOString(),
            emiAmount: formatToken(currentEMIAmount),
            remainingEMIs: remainingEMIs.toString(),
            totalPaid: formatToken(totalPaid),
            totalRemaining: formatToken(totalRemaining),
            itemName,
            startTime: new Date(
              Number(agreementData.startTime) * 1000
            ).toISOString(),
            databaseRecord: {
              isActive: payment.isActive,
              transactionHashes: payment.transactionHashes,
            },
          };
        } catch (error) {
          console.error(`Error fetching agreement ${agreementId}:`, error);
          return {
            agreementId: agreementId.toString(),
            error: error.message,
          };
        }
      })
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          agreementDetails,
          "Agreement details fetched successfully"
        )
      );
  } catch (error) {
    console.error("Get agreement details error:", error);
    throw new ApiError(
      500,
      `Failed to fetch agreement details: ${error.message}`
    );
  }
});

// ─────────────────────────────────────────────────────────────────────────────
const getLenderAgreementDetails = asyncHandler(async (req, res) => {
  try {
    const { lenderId } = req.params;

    if (!lenderId) {
      throw new ApiError(400, "Lender ID is required");
    }

    const paymentRecords = await Payment.find({ lenderId });

    if (!paymentRecords || paymentRecords.length === 0) {
      throw new ApiError(404, "No agreements found for this lender");
    }

    const { walletAddress: borrowerAddress, privateKey: borrowerPrivateKey } =
      await extractWalletAddressandPrivateKey(lenderId);

    if (!borrowerAddress || !borrowerPrivateKey) {
      throw new ApiError(400, "Borrower wallet details not found");
    }

    // Setup blockchain connections
    const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    const borrowerWallet = new ethers.Wallet(borrowerPrivateKey, provider);

    const emiManagerContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      EMIMANAGER_ABI,
      borrowerWallet
    );

    const agreementDetails = await Promise.all(
      paymentRecords.map(async (record) => {
        try {
          const agreementId = parseInt(record.agreementId);

          const pendingEntry = await PendingBorrower.findOne({
            borrowerId: record.borrowerId,
          });

          console.log("PENDING ENTRY", pendingEntry);

          const itemName = pendingEntry?.item || "N/A";

          const [totalPaid, totalRemaining, remainingMonths] =
            await Promise.all([
              emiManagerContract.getLenderTotalAmountPaid(agreementId),
              emiManagerContract.getLenderTotalAmountRemaining(agreementId),
              emiManagerContract.getLenderRemainingMonths(agreementId),
            ]);

          return {
            agreementId: record.agreementId,
            borrowerId: record.borrowerId,
            totalPaid: ethers.formatEther(totalPaid),
            totalRemaining: ethers.formatEther(totalRemaining),
            remainingMonths: remainingMonths.toString(),
            itemName,
            isActive: record.isActive,
            transactionCount: record.transactionHashes.length,
            lastPaymentDate: record.updatedAt,
          };
        } catch (error) {
          console.error(
            `Error processing agreement ${record.agreementId}:`,
            error
          );
          return {
            agreementId: record.agreementId,
            error: error.message,
          };
        }
      })
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          agreementDetails,
          "Lender agreements fetched successfully"
        )
      );
  } catch (error) {
    console.error("Get lender details error:", error);
    throw new ApiError(500, `Failed to fetch lender details: ${error.message}`);
  }
});

export {
  initiateAgreement,
  payEmi,
  getBorrowerAgreementDetails,
  getLenderAgreementDetails,
};
