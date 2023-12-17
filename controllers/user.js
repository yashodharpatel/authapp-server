import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import User from "#models/user";
import { redisClient } from "#config/redisConnection";
import userExists from "#utilities/userExists";
import throwError from "#utilities/throwError";
import checkMandatory from "#utilities/checkMandatory";
import validation from "#utilities/validation";

// @desc Get current user
// @route GET /user/user-profile
// @access PRIVATE
const getCurrentUser = asyncHandler(async (req, res) => {
  const { email } = req.user;
  const user = await User.findOne({ email }).select("-password");
  res.status(200).json(user);
});

// @desc Get all users
// @route GET /user/get-users
// @access PRIVATE
const getAllUsers = asyncHandler(async (req, res) => {
  const { email, role } = req.user;

  // check if current user is admin
  if (role !== "admin") {
    throwError(res, 403, "Only admin can access all the users");
  }

  const users = await User.find({ email: { $ne: email } }).select("-password");
  res.status(200).json(users);
});

// @desc Update the user information
// @route PUT /user/update-user/:username
// @access PRIVATE
const updateUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { role, id } = req.user;

  // check if user exists
  const user = await userExists.login(req.params.username);
  if (user === -1) {
    throwError(res, 400, "User does not exists");
  }

  // check for mandatory fields
  checkMandatory(email, "Email", res);

  // validate the email
  validation.validateEmail(email, res);

  // code to be run while updating the email
  const userWithSameEmail = await User.findOne({
    email: email,
    username: {
      $ne: req.params.username,
    },
  });

  if (userWithSameEmail) {
    throwError(res, 400, "Email Id already taken");
  }

  // Only admin or the user itself can update the user
  if (role !== "admin" && user.id !== id) {
    throwError(res, 401, "You are not authorized to update this user");
  }

  user.email = email;

  await user.save();

  res.status(200).json({ message: "User details updated successfully" });
});

// @desc Change the role of user (only admin can perform this operation)
// @route PUT /user/change-role/:username
// @access PRIVATE
const changeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  // check if user exists
  const user = await userExists.login(req.params.username);
  if (user === -1) {
    throwError(res, 400, "User does not exists");
  }

  // check for mandatory fields
  checkMandatory(role, "Role", res);

  // Only admin can change the role
  if (req.user.role !== "admin") {
    throwError(res, 403, "You are not authorized to change the role");
  }

  user.role = role;

  await user.save();

  res.status(200).json({
    message: `User ${req.params.username} role changed to ${role} successfully`,
  });
});

// @desc Change the password
// @route PUT /user/change-password
// @access PRIVATE
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { email } = req.user;

  // check for mandatory fields
  checkMandatory(oldPassword, "Old Password", res);
  checkMandatory(newPassword, "New Password", res);

  // old and new password should not be same
  if (oldPassword === newPassword) {
    throwError(res, 400, "Old and new password cannot be same");
  }

  // validate the new password
  validation.validatePassword(newPassword, res);

  const user = await User.findOne({ email });
  if (!user) {
    throwError(res, 400, "Kindly Login");
  }

  // check if old password is correct
  const validPassword = await bcrypt.compare(oldPassword, user.password);
  if (!validPassword) {
    throwError(res, 400, "Old password is not correct");
  }

  // hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // update the password
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
});

// @desc Delete the user
// @route DEL /user/delete-user/:username
// @access PRIVATE
const deleteUser = asyncHandler(async (req, res) => {
  const { token } = req;
  const { role } = req.user;
  const tokenExp = req.user.exp;

  // check if user exists
  const user = await userExists.login(req.params.username);
  if (user === -1) {
    throwError(res, 400, "User does not exists");
  }

  // check if current user is admin
  if (role !== "admin") {
    throwError(res, 403, "Only admin can delete the user");
  }

  const token_key = `bl_${token}`;
  await redisClient.set(token_key, token);
  redisClient.expireAt(token_key, tokenExp);

  await User.deleteOne({ username: req.params.username });
  res.status(200).json({ message: "User deleted successfully" });
});

export default {
  getCurrentUser,
  getAllUsers,
  updateUser,
  changeRole,
  changePassword,
  deleteUser,
};
