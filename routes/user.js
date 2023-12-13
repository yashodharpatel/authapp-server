import express from "express";
import userController from "#controllers/user";
import authenticateToken from "#middleware/authenticateToken";

const router = express.Router();

router.get("/user-profile", authenticateToken, userController.getCurrentUser);
router.get("/get-users", authenticateToken, userController.getAllUsers);
// router.put("/update-user", userController.updateUser);
// router.put("/change-password", userController.changePassword);
router.delete("/delete-user/:username", authenticateToken, userController.deleteUser);

export default router;