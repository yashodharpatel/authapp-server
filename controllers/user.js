import asyncHandler from "express-async-handler";
import User from "#models/user";
import userExists from "#utilities/userExists";

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email } = req.user;
  const user = await User.findOne({ email }).select("-password");
  res.status(200).json(user);
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { email, role } = req.user;

  // check if current user is admin
  if (role !== "admin") {
    res.status(403);
    throw new Error("Only admin can access all the users");
  }

  const users = await User.find({ email: { $ne: email } }).select("-password");
  res.status(200).json(users);
});

const deleteUser = asyncHandler(async (req, res) => {
  const { role } = req.user;

  // check if current user is admin
  if (role !== "admin") {
    res.status(403);
    throw new Error("Only admin can delete the user");
  }

  // check if user exists
  const user = await userExists.login(req.params.username);
  if (user === -1) {
    res.status(400);
    throw new Error("User does not exists");
  }

  await User.deleteOne({ username: req.params.username });
  res.status(200).json({ message: "User deleted successfully" });
});

export default {
  getCurrentUser,
  getAllUsers,
  deleteUser,
};
