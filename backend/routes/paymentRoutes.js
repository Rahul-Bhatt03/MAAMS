import express from "express";
import { initiatePayment, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// 🟢 Initiate Esewa Payment (User side)
router.post("/initiate", initiatePayment);

// 🟢 Verify Esewa Payment (after success/failure redirect)
router.post("/verify", verifyPayment);

export default router;
