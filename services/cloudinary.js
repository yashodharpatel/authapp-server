import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("File not found");
      return null;
    }

    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // remove the locally saved file as the file has been successfully uploaded to cloudinary
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // remove the locally saved file as the upload operation got failed
    fs.unlinkSync(localFilePath);
    console.log("Error occured while uploading file to cloudinary", error);
    return null;
  }
};

export default uploadOnCloudinary;
