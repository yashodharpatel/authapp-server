import express from "express";
import authController from "#controllers/auth";
import authenticateToken from "#middleware/authenticateToken";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-email", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authenticateToken, authController.logout);

export default router;
