import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(
      `${process.env.DB_URI}/${process.env.DB_NAME}`
    );

    console.log(
      "MongoDB connected successfully -",
      connect.connection.host,
      connect.connection.name
    );
  } catch (error) {
    console.log("Error occured while connecting to Database", error);
    process.exit(1);
  }
};

export default connectDB;