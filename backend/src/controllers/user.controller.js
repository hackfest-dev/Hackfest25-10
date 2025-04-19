import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import transporter from "../utils/nodeMailer.js";
import path from "path";
import { upload } from "../middlewares/multer.middleware.js";  // Import file upload helper
import { verifyKycML } from "../utils/verifyKyc.js"; 

const options = {
    httpOnly: true,
    secure: true 
};

const generateToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        const accessToken = await user.generateToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { refreshToken, accessToken };
    } catch (error) {
        throw new ApiError(500, "Error generating token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    try {
        const {
            email,
            password,
            fullName,
            city,
            state,
            country
        } = req.body;

        if (
            !email ||
            !password ||
            !fullName ||
            !city ||
            !state ||
            !country
        ) {
            throw new ApiError(400, "Please fill in all required fields");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) throw new ApiError(400, "User already exists");

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        const newUser = await User.create({
            fullName,
            email,
            password,
            Address: { city, state, country },
            isVerified: false,
            otp,
            otpExpiresAt,
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Verify your account - OTP",
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`
        };

        await transporter.sendMail(mailOptions);

        const userCreated = await User.findById(newUser._id).select("-password -refreshToken");
        if (!userCreated) throw new ApiError(500, "Error creating user");

        return res
            .status(201)
            .json(new ApiResponse(200, "User created successfully. OTP sent to email.", userCreated));
    } catch (err) {
        throw new ApiError(500, err.message || "Registration failed");
    }
});


const loginUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) throw new ApiError(400, "Please fill in all fields");

        const user = await User.findOne({ email });
        if (!user) throw new ApiError(400, "User does not exist");

        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) throw new ApiError(400, "Invalid Credentials");

        const { refreshToken, accessToken } = await generateToken(user._id);

        return res
            .status(200)
            .cookie("refreshToken", refreshToken, options)
            .cookie("accessToken", accessToken, options)
            .json(new ApiResponse(200, { userTokens: { accessToken, refreshToken } }, "User logged in successfully"));
    } catch (err) {
        throw new ApiError(500, err.message || "Login failed");
    }
});

const logoutUser = asyncHandler(async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            $unset: { refreshToken: 1 }
        }, { new: true });

        return res
            .status(200)
            .clearCookie("refreshToken", options)
            .clearCookie("accessToken", options)
            .json(new ApiResponse(200, "User logged out successfully"));
    } catch (err) {
        throw new ApiError(500, "Logout failed");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        return res.status(200).json(new ApiResponse(200, req.user, "User found"));
    } catch (err) {
        throw new ApiError(500, "Failed to get user");
    }
});

const verifyEmail = asyncHandler(async (req, res) => {
    try {
        const { otp, email} = req.body;

        if (!email) throw new ApiError(400, "Email not provided");
        if (!otp) throw new ApiError(400, "OTP is required");

        const user = await User.findOne({email});
        if (!user) throw new ApiError(404, "User not found");

        if (user.isVerified) throw new ApiError(400, "User is already verified");

        if (!user.otp || user.otp !== otp) throw new ApiError(401, "Invalid OTP");
        if (user.otpExpiresAt < Date.now()) throw new ApiError(400, "OTP has expired");

        user.isVerified = true;
        user.otp = '';
        user.otpExpiresAt = null;
        await user.save();

        return res.status(200).json(new ApiResponse(200, null, "Account verified successfully"));
    } catch (err) {
        throw new ApiError(500, err.message || "Email verification failed");
    }
});

const verifyKyc = asyncHandler(async (req, res) => {
    try {
        const userId = req.headers["id"];
        if (!userId) throw new ApiError(401, "Unauthorized");

        const user = await User.findById(userId);
        if (!user) throw new ApiError(404, "User not found");

        // Extract file paths from uploaded files
        const selfiePath = req.files?.selfieImage?.[0]?.path;
        const documentPath = req.files?.documentImage?.[0]?.path;
        if (!selfiePath || !documentPath) throw new ApiError(400, "Please upload both images");

        const selfieAbsPath = path.resolve(selfiePath);
        const docAbsPath = path.resolve(documentPath);

        // Call your KYC verification ML function
        const kycResult = await verifyKycML(selfieAbsPath, docAbsPath);

        console.log("KYC verification result: ", kycResult);
        if (!kycResult) throw new ApiError(400, "KYC verification failed. Faces do not match");

        user.isKycVerified = true;
        await user.save();

        return res.status(200).json(new ApiResponse(200, null, "KYC verified successfully"));
    } catch (err) {
        throw new ApiError(500, err.message || "KYC verification failed");
    }
});


export {
    generateToken,
    logoutUser,
    registerUser,
    loginUser,
    getCurrentUser,
    verifyEmail,
    verifyKyc
};
