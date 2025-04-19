import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";

export async function extractWalletAddressandPrivateKey(userId) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }

        console.log("User:", user);

        const walletAddress = user.walletAddress; 
        const privateKey = user.privateKey;

        if (!walletAddress || !privateKey) {
            throw new Error("Wallet address or private key not found");
        }

        return { walletAddress, privateKey };
    } catch (error) {
        console.error("Error extracting wallet address and private key:", error);
        throw error; // rethrow to handle it at higher level if needed
    }
}
