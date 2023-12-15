import express from "express";
import userController from "#controllers/user";
import authenticateToken from "#middleware/authenticateToken";
import emailVerified from "#middleware/emailVerified";

const router = express.Router();

router.use(authenticateToken);
router.use(emailVerified);

router.get("/user-profile", userController.getCurrentUser);
router.get("/get-users", userController.getAllUsers);
router.put("/update-user/:username", userController.updateUser);
router.put("/change-role/:username", userController.changeRole)
router.put("/change-password", userController.changePassword);
router.delete("/delete-user/:username", userController.deleteUser);

export default router;