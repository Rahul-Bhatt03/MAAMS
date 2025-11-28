// config/esewa.js
import dotenv from "dotenv";
dotenv.config(); 

export const ESEWA_CONFIG = {
  MERCHANT_CODE: process.env.ESEWA_MERCHANT_CODE,
  SECRET_KEY: process.env.ESEWA_SECRET_KEY,
  CLIENT_ID: process.env.ESEWA_CLIENT_ID,
  CLIENT_SECRET: process.env.ESEWA_CLIENT_SECRET,
  PAYMENT_URL: process.env.ESEWA_PAYMENT_URL,
  VERIFY_URL: process.env.ESEWA_VERIFY_URL,
  SUCCESS_URL: process.env.ESEWA_SUCCESS_URL,
  FAILURE_URL: process.env.ESEWA_FAILURE_URL,
};
