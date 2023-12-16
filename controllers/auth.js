import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "#models/user";
import ActiveToken from "#models/activetoken";
import sendMail from "#services/mailer";
import uploadOnCloudinary from "#services/cloudinary";
import checkMandatory from "#utilities/checkMandatory";
import validation from "#utilities/validation";
import userExists from "#utilities/userExists";
import throwError from "#utilities/throwError";
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

  // work with files
  let profileLocalPath;
  try {
    profileLocalPath = req?.files?.profile[0]?.path;
  } catch (error) {
    throwError(res, 400, "Profile cannot be blank");
  }

  const profile = await uploadOnCloudinary(profileLocalPath);

  // check if the user already exists
  if (await userExists.register(email, username)) {
    throwError(res, 400, "User already exists");
  }

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

  if (newUser) {
    res.status(201).json({
      message: "User created",
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } else {
    throwError(res, 400, "User data is not valid");
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

  await ActiveToken.findOneAndUpdate(
    { user_id: user._id },
    { token, user_id: user._id },
    { upsert: true }
  );

  res.status(200).json({ token });
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

  res.status(200).json({ message: "Email verified successfully" });
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

    res.status(200).json({ message: `Mail sent successfully to ${email}` });
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

  res.status(200).json({ message: "Password reset successfully" });
});

// @desc Logout
// @route POST /auth/logout
// @access PRIVATE
const logout = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const token = await ActiveToken.findOne({
    user_id: id,
  });

  if (!token) {
    throwError(res, 400, "Kindly Login");
  }

  await ActiveToken.deleteOne(token);

  res.status(204).json({ message: "Logged Out" });
});

export default {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
};
