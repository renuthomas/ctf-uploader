import { config } from "dotenv";
config();
export const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION,
  AWS_BUCKET_NAME,
  PORT,
  DB_URI,
} = process.env;
