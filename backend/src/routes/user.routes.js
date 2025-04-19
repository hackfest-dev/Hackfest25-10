import { Router } from "express";
import { loginUser, logoutUser, registerUser, getCurrentUser, verifyKyc, verifyEmail } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"; // Import multer
import { verifyJwt } from "../middlewares/auth.middleware.js"; // Import JWT middleware

const router = Router();

// Register and login routes
router.route("/register").post(registerUser); //done
router.route("/login").post(loginUser); //done

// Secure routes (KYC, logout, current user)
router.route("/verifyEmail").post(verifyEmail); //done
router.route("/logout").post(verifyJwt, logoutUser); //done
router.route("/currentUser").get(verifyJwt, getCurrentUser); //done

// New route for KYC verification
router.route("/verifyKyc").post(upload.fields([
    { name: 'selfieImage', maxCount: 1 },
    { name: 'documentImage', maxCount: 1 }
]), verifyKyc); //done

export default router;
