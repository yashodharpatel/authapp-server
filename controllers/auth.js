import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import checkMandatory from "#utilities/checkMandatory";
import validation from "#utilities/validation";
import userExists from "#utilities/userExists";
import User from "#models/user";

const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // check for mandatory fields
  checkMandatory(username, "Username", res);
  checkMandatory(email, "Email", res);
  checkMandatory(password, "Password", res);
  checkMandatory(role, "Role", res);

  // validate the email
  validation.validateEmail(email, res);

  // check if the user already exists
  if (await userExists.register(email, username)) {
    res.status(400);
    throw new Error("User already exists");
  }

  // hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create new user
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    role,
  });

  if (newUser) {
    res.status(201).json({
      message: "User created",
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
});

const login = asyncHandler(async (req, res) => {
  const { value, password } = req.body;

  // check for mandatory fields
  checkMandatory(value, "Email or username", res);
  checkMandatory(password, "Password", res);

  // check if user exists
  const user = await userExists.login(value);
  if (user === -1) {
    res.status(400);
    throw new Error("User does not exists");
  }

  // check if password is correct
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    res.status(400);
    throw new Error("Invalid Password");
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
    { expiresIn: "30m" }
  );

  res.status(200).json({ token });
});

export default {
  register,
  login,
};
