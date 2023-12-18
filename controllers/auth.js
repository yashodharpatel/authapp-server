import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "#models/user";
import { redisClient } from "#config/redisConnection";
import sendMail from "#services/mailer";
import uploadOnCloudinary from "#services/cloudinary";
import checkMandatory from "#utilities/checkMandatory";
import validation from "#utilities/validation";
import userExists from "#utilities/userExists";
import throwError from "#utilities/throwError";
import ApiResponse from "#utilities/apiResponse";
import constants from "#constants";

// @desc Register new user
// @route POST /auth/register
// @access PUBLIC
const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // check for mandatory fields
  checkMandatory(username, "Username", res);
  checkMandatory(email, "Email", res);
  checkMandatory(password, "Password", res);
  checkMandatory(role, "Role", res);

  // validate the email
  validation.validateEmail(email, res);

  // validate the password
  validation.validatePassword(password, res);

  // check if the user already exists
  if (await userExists.register(email, username)) {
    throwError(res, 400, "User already exists");
  }

  // work with files
  let profileLocalPath;
  try {
    profileLocalPath = req?.files?.profile[0]?.path;
  } catch (error) {
    throwError(res, 400, "Profile cannot be blank");
  }

  const profile = await uploadOnCloudinary(profileLocalPath);

  // hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create new user
  const newUser = await User.create({
    username,
    email,
    profile: profile.url,
    password: hashedPassword,
    role,
  });

  // send verification email
  try {
    await sendMail({
      email,
      emailType: constants.EmailTypes.VERIFY,
      userID: newUser.id,
    });
  } catch (e) {
    console.log(e);
  }

  const createdUser = await User.findById(newUser._id).select(
    "-password -verifyToken -verifyTokenExpiry"
  );

  if (createdUser) {
    res
      .status(201)
      .json(ApiResponse.success(200, "User created successfully", createdUser));
  } else {
    throwError(res, 500, "Something went wrong while registering the user");
  }
});

// @desc Login
// @route POST /auth/login
// @access PUBLIC
const login = asyncHandler(async (req, res) => {
  const { value, password } = req.body;

  // check for mandatory fields
  checkMandatory(value, "Email or username", res);
  checkMandatory(password, "Password", res);

  // check if user exists
  const user = await userExists.login(value);
  if (user === -1) {
    throwError(res, 404, "User does not exists");
  }

  // check if password is correct
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throwError(res, 400, "Invalid Password");
  }

  // create token
  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRY }
  );

  res
    .status(200)
    .json(ApiResponse.success(200, "Logged In successfully", { token }));
});

// @desc Verify the email of new user
// @route POST /auth/verify-email
// @access PUBLIC
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body;

  checkMandatory(token, "Token", res);

  const user = await User.findOne({
    verifyToken: token,
    verifyTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throwError(res, 400, "Invalid Token");
  }

  user.isVerified = true;
  user.verifyToken = undefined;
  user.verifyTokenExpiry = undefined;

  await user.save();

  res
    .status(200)
    .json(ApiResponse.success(200, "Email verified successfully", null));
});

// @desc Send mail to reset the password
// @route POST /auth/forgot-password
// @access PUBLIC
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  checkMandatory(email, "Email", res);

  // validate the email
  validation.validateEmail(email, res);

  // check if user exists
  const user = await userExists.login(email);
  if (user === -1) {
    throwError(res, 404, "User does not exists");
  }

  // send email
  try {
    await sendMail({
      email,
      emailType: constants.EmailTypes.RESET,
      userID: user.id,
    });

    res
      .status(200)
      .json(
        ApiResponse.success(200, `Mail sent successfully to ${email}`, null)
      );
  } catch (e) {
    console.log(e);
  }
});

// @desc Reset the password from the mail
// @route POST /auth/reset-password
// @access PUBLIC
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // check for mandatory fields
  checkMandatory(token, "Token", res);
  checkMandatory(password, "Password", res);

  // validate the password
  validation.validatePassword(password, res);

  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throwError(res, 400, "Invalid Token");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordTokenExpiry = undefined;

  await user.save();

  res
    .status(200)
    .json(ApiResponse.success(200, "Password reset successfully", null));
});

// @desc Logout
// @route POST /auth/logout
// @access PRIVATE
const logout = asyncHandler(async (req, res) => {
  const { token, user } = req;
  const tokenExp = user.exp;

  const token_key = `bl_${token}`;
  await redisClient.set(token_key, token);
  redisClient.expireAt(token_key, tokenExp);

  res.status(200).json(ApiResponse.success(200, "Logged Out", null));
});

export default {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
};
