import mongoose from "mongoose";

const cerditScoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    interestRate: {
        type: Number,
        required: true
    },
    riskIndex: {
        type: Number,
        required: true
    },
    maxLoanAmount: {
        type: Number,
        required: true
    },
    creditScore: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export const Payment = mongoose.model('Payment', cerditScoreSchema);