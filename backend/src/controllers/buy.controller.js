import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import PendingBorrower from "../models/pendingBorrowers.model.js";

const createPendingRequest = asyncHandler(async (req, res) => {
  const { borrowerId, item, amount, interest, months, buyerWalletAddress } =
    req.body;
  console.log("Request body:", req.body);
  if (
    !borrowerId ||
    !item ||
    !amount ||
    !interest ||
    !months ||
    !buyerWalletAddress
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingRequest = await PendingBorrower.findOne({
    borrowerId,
    isClaimed: false,
  });

  if (existingRequest) {
    throw new ApiError(409, "User already has an active pending request");
  }

  try {
    const newRequest = await PendingBorrower.create({
      borrowerId,
      item,
      amount,
      interest,
      months,
      buyerWalletAddress,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          request: {
            id: newRequest._id,
            item: newRequest.item,
            amount: newRequest.amount,
            interest: newRequest.interest,
            months: newRequest.months,
            isClaimed: newRequest.isClaimed,
            buyerWalletAddress: newRequest.buyerWalletAddress,
          },
        },
        "Pending request created successfully"
      )
    );
  } catch (error) {
    console.error("Create pending request error:", error);
    throw new ApiError(
      500,
      `Failed to create pending request: ${error.message}`
    );
  }
});

const getPendingBorrower = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  // Check if requestId is provided
  if (!requestId) {
    throw new ApiError(400, "Request ID is required");
  }

  try {
    // Find the pending borrower by ID
    const pendingRequest = await PendingBorrower.findById(requestId)
      .populate("borrowerId", "username email")
      .populate("lenderId", "username email");

    if (!pendingRequest) {
      throw new ApiError(404, "Pending request not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          request: {
            id: pendingRequest._id,
            borrower: pendingRequest.borrowerId,
            lender: pendingRequest.lenderId,
            item: pendingRequest.item,
            amount: pendingRequest.amount,
            interest: pendingRequest.interest,
            months: pendingRequest.months,
            isClaimed: pendingRequest.isClaimed,
            buyerWalletAddress: pendingRequest.buyerWalletAddress,
          },
        },
        "Pending request retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Get pending request error:", error);
    throw new ApiError(
      500,
      `Failed to retrieve pending request: ${error.message}`
    );
  }
});

// Get all pending borrower requests
const getAllPendingRequests = asyncHandler(async (req, res) => {
  // Default to finding unclaimed requests
  let filter = { isClaimed: false };

  // Allow override through query param if explicitly provided
  if (req.query.isClaimed !== undefined) {
    filter.isClaimed = req.query.isClaimed === "true";
  }

  try {
    const pendingRequests = await PendingBorrower.find(filter)
      .populate("borrowerId", "username email")
      .populate("lenderId", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          count: pendingRequests.length,
          requests: pendingRequests.map((request) => ({
            id: request._id,
            borrower: request.borrowerId,
            lender: request.lenderId,
            item: request.item,
            amount: request.amount,
            interest: request.interest,
            months: request.months,
            isClaimed: request.isClaimed,
            buyerWalletAddress: request.buyerWalletAddress,
          })),
        },
        "Pending requests retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Get all pending requests error:", error);
    throw new ApiError(
      500,
      `Failed to retrieve pending requests: ${error.message}`
    );
  }
});

export { createPendingRequest, getPendingBorrower, getAllPendingRequests };
