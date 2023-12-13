import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const getCurrentUser = asyncHandler(async (req, res) => {});

export default {
  getCurrentUser,
};
