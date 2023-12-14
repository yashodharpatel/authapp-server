import express from "express";
import authController from "#controllers/auth";

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
// router.get("/logout", authController.logout);
router.post("/verify-email", authController.verifyEmail);
// router.post("/forgot-password", authController.forgotPassword);
// router.post("/reset-password", authController.resetPassword);

export default router;
