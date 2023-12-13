import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";

import indexRouter from "#routes/index";
import authRouter from "#routes/auth";
import userRouter from "#routes/user";

import errorHandler from "#middleware/errorHandler";

import connectDB from "#config/dbConnection";

connectDB();

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(morgan("dev"));

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/user", userRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server successfully started on PORT", PORT);
});