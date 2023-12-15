import mongoose from "mongoose";

const activetokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Please provide a token"],
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Please provide a valid user ID"],
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ActiveToken", activetokenSchema);