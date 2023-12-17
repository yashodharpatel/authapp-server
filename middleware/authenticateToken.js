import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import throwError from "#utilities/throwError";
import User from "#models/user";
import { redisClient } from "#config/redisConnection";

const authenticateToken = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    let decodedUser;

    // check if token is available in black list
    const inBlackList = await redisClient.get(`bl_${token}`);
    if (inBlackList) {
      throwError(res, 401, "User is not authorized");
    }

    // check if token is valid or not
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        throwError(res, 401, "User is not authorized");
      }

      decodedUser = decoded;
    });

    const user = await User.findOne({ username: decodedUser.username });

    if (!user) {
      throwError(res, 401, "User does not exists");
    }

    req.user = decodedUser;
    req.token = token;
    next();
  } else {
    throwError(res, 401, "Kindly Login");
  }
});

export default authenticateToken;
