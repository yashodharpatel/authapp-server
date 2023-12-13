import asyncHandler from "express-async-handler";
import User from "#models/user";

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email } = req.user;
  const user = await User.findOne({ email }).select("-password");
  res.status(200).json(user);
});

export default {
  getCurrentUser,
};
