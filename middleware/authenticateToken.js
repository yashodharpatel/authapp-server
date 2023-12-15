import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import throwError from "#utilities/throwError";
import ActiveToken from "#models/activetoken";

const authenticateToken = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization || req.headers.Authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    let decodedUser;
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        throwError(res, 401, "User is not authorized");
      }

      decodedUser = decoded;
    });

    const activeToken = await ActiveToken.findOne({
      user_id: decodedUser.id,
      token,
    });

    if (!activeToken) {
      throwError(res, 401, "User is not authorized");
    }
    
    req.user = decodedUser;
    next();
  } else {
    throwError(res, 400, "Kindly Login");
  }
});

export default authenticateToken;
