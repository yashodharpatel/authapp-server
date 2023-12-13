import express from "express";
import userController from "#controllers/user";

const router = express.Router();

router.get("/user-profile", userController.getCurrentUser);
// router.get("/get-users", userController.getAllUsers);
// router.put("/update-user", userController.updateUser);
// router.put("/change-password", userController.changePassword);
// router.delete("/delete-user", userController.deleteUser);

export default router;