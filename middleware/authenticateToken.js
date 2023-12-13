import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import throwError from "#utilities/throwError";

const authenticateToken = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        throwError(res, 401, "User is not authorized");
      }

      req.user = decoded;
      next();
    });
  } else {
    throwError(res, 400, "Kindly Login");
  }
});

export default authenticateToken;
