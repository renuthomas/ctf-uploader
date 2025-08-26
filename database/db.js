import mongoose from "mongoose";
import { DB_URI } from "../config/env.js";

if (!DB_URI) {
  throw new Error("Please define the DB_URI environment variable inside .env");
}

const connecttoDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log(`MongoDB connected successfully`);
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
};

export default connecttoDB;
