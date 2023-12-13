import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

const authenticateToken = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("User is not authorized");
      }

      req.user = decoded;
      next();
    });
  } else {
    res.status(400);
    throw new Error("Kindly Login");
  }
});

export default authenticateToken;
