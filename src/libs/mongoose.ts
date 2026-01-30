import mongoose from "mongoose";
import { log } from "../utils/logger.js";

/**
 * Connect to MongoDB using Mongoose.
 * Reads the connection string from the DATABASE_URL environment variable.
 **/

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL!);
    log("MongoDB connected successfully", "success");
  } catch (error) {
    log("Error connecting to MongoDB:", "error");
    process.exit(1);
  }
}
