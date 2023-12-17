import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import throwError from "#utilities/throwError";
import User from "#models/user";

const emailVerified = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ username: req.user.username });

  if (!user) {
    throwError(res, 401, "User does not exists");
  }

  if (!user.isVerified) {
    throwError(res, 403, "Please verify your email to proceed");
  }
  // User is verified, proceed to the next middleware or route handler
  next();
});

export default emailVerified;
