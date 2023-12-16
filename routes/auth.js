import express from "express";
import authController from "#controllers/auth";
import authenticateToken from "#middleware/authenticateToken";
import upload from "#middleware/multer";

const router = express.Router();

router.post(
  "/register",
  upload.fields([
    {
      name: "profile",
      maxCount: 1,
    },
  ]),
  authController.register
);
router.post("/login", authController.login);
router.post("/verify-email", authController.verifyEmail);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authenticateToken, authController.logout);

export default router;
