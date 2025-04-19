import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    borrowerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    agreementId: {
        type:String,
        required: true
    },
    transactionHashes: {
        type: [String],
        default: []
    },
    isActive : {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);