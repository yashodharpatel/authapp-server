import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import User from "#models/user";
import ActiveToken from "#models/activetoken";
import userExists from "#utilities/userExists";
import throwError from "#utilities/throwError";
import checkMandatory from "#utilities/checkMandatory";
import validation from "#utilities/validation";

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email } = req.user;
  const user = await User.findOne({ email }).select("-password");
  res.status(200).json(user);
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { email, role } = req.user;

  // check if current user is admin
  if (role !== "admin") {
    throwError(res, 403, "Only admin can access all the users");
  }

  const users = await User.find({ email: { $ne: email } }).select("-password");
  res.status(200).json(users);
});

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

const deleteUser = asyncHandler(async (req, res) => {
  const { role, id } = req.user;

  // check if current user is admin
  if (role !== "admin") {
    throwError(res, 403, "Only admin can delete the user");
  }

  // check if user exists
  const user = await userExists.login(req.params.username);
  if (user === -1) {
    throwError(res, 400, "User does not exists");
  }

  const token = await ActiveToken.findOne({
    user_id: id,
  });
  
  if (!token) {
    throwError(res, 400, "Kindly Login");
  }

  await ActiveToken.deleteOne(token);
  await User.deleteOne({ username: req.params.username });
  res.status(200).json({ message: "User deleted successfully" });
});

export default {
  getCurrentUser,
  getAllUsers,
  changePassword,
  deleteUser,
};
