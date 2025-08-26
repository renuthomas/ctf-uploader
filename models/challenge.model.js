import mongoose from "mongoose";

const challengeSchema = mongoose.Schema(
  {
    uuid: {
      type: String,
      unique: true,
      required: [true, "Challenge should have a id"],
    },
    title: {
      type: String,
      required: [true, "Challenge should have a name"],
    },
    category: {
      type: String,
      required: [true, "Challenge should have a category"],
    },
    description: {
      type: String,
      required: [true, "Challenge should have a description"],
    },
    s3_prefix: {
      type: String,
    },
  },
  { timestamps: true }
);

const challenge = mongoose.model("Challenge", challengeSchema);
export default challenge;
