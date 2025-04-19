

import { ethers } from "ethers";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {extractWalletAddressandPrivateKey} from "../helpers/extractWallet.js";
import {Payment} from "../models/payment.model.js";
import { EMIMANAGER_ABI } from "../constants/EMIManagerABI.js";
import { TOKEN_ABI } from "../constants/tokenABI.js";

// Configuration (should move to environment variables)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PROVIDER_URL = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;

const tokenAddress = process.env.TOKEN_ADDRESS;

const initiateAgreement = asyncHandler(async (req, res) => {
    const { lenderId, borrowerId, sellerAddress, totalAmount, interestRate, months } = req.body;
    
    // Validate required fields
    if (!lenderId || !borrowerId || !sellerAddress || !totalAmount || !interestRate || !months) {
        throw new ApiError(400, "All fields are required");
    }

    // Extract wallet details
    const {walletAddress : lenderAddress , privateKey : lenderPrivateKey} = await extractWalletAddressandPrivateKey(lenderId);
    const { walletAddress : borrowerAddress } = await extractWalletAddressandPrivateKey(borrowerId);
    console.log(lenderAddress , lenderPrivateKey, borrowerAddress);
    if (!lenderAddress || !lenderPrivateKey || !borrowerAddress) {
        throw new ApiError(400, "Wallet details not found");
    }

    try {
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
        const lenderWallet = new ethers.Wallet(lenderPrivateKey, provider);

        // Create contract instances
        const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, lenderWallet);
        const emiManagerContract = new ethers.Contract(CONTRACT_ADDRESS, EMIMANAGER_ABI, lenderWallet);

        // Convert amount to BigNumber
        const parsedAmount = ethers.parseUnits(totalAmount.toString(), 18);
        const startTime = Math.floor(Date.now() / 1000) + 120; 

        // Step 1: Transfer tokens to borrower
        const transferTx = await tokenContract.transfer(sellerAddress, parsedAmount);
        await transferTx.wait();

        // Step 2: Create EMI Agreement
        const createTx = await emiManagerContract.createAgreement(
            lenderAddress,
            borrowerAddress,
            tokenAddress,
            parsedAmount,
            interestRate*100,
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
            transactionHash: receipt.hash
        };

        await Payment.create({
            borrowerId,
            lenderId,
            agreementId: agreementId.toString(),
            transactionHashes: [],
            isActive: true
        });
        return res.status(201).json(
            new ApiResponse(201, responseData, "Agreement created successfully")
        );

    } catch (error) {
        console.error("Agreement creation error:", error);
        throw new ApiError(500, `Agreement creation failed: ${error.message}`);
    }
});

export { initiateAgreement };