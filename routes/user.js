import express from "express";
import userController from "#controllers/user";
import authenticateToken from "#middleware/authenticateToken";

const router = express.Router();

router.use(authenticateToken); // will be used for all routes
router.get("/user-profile", userController.getCurrentUser);
router.get("/get-users", userController.getAllUsers);
// router.put("/update-user", userController.updateUser);
// router.put("/change-password", userController.changePassword);
router.delete("/delete-user/:username", userController.deleteUser);

export default router;