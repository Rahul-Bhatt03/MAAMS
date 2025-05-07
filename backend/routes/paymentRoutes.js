import express from 'express';
import {
  verifyPayment,
  getPaymentStatus,
  processRefund
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js'; // handles authentication & role check
import { admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/payments/verify
// @desc    Verify payment from a payment gateway
// @access  Public (or protect, if required)
router.post('/verify', verifyPayment);

// @route   GET /api/payments/status/:orderId
// @desc    Get payment status for a specific order
// @access  Protected
router.get('/status/:orderId', protect, getPaymentStatus);

// @route   POST /api/payments/refund
// @desc    Process a refund (admin only)
// @access  Protected + Admin (handled by protect middleware)
router.post('/refund', protect,admin, processRefund);

export default router;
