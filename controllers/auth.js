import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = asyncHandler(async (req, res) => {});
const login = asyncHandler(async (req, res) => {});

export default {
  register,
  login,
};