import mongoose from "mongoose";

const pendingBorrowerSchema = new mongoose.Schema(
  {
    borrowerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    item: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    interest: {
      type: Number,
      required: true,
    },
    months: {
      type: Number,
      required: true,
    },
    buyerWalletAddress: {
      type: String, // Changed from ObjectId to String
      required: true,
    },
    isClaimed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const PendingBorrower = mongoose.model(
  "PendingBorrower",
  pendingBorrowerSchema
);

export default PendingBorrower;
