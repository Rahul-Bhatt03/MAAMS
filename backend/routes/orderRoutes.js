import express from 'express';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  deleteOrder
} from '../controllers/orderController.js';
import { protect } from '../middlewares/roleMiddleware.js';
import { admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', createOrder);

// @route   GET /api/orders/:id
// @desc    Get a single order by ID
// @access  Private
router.get('/:id', getOrderById);

// @route   GET /api/orders
// @desc    Get all orders (admin only)
// @access  Admin
router.get('/', protect,admin, getAllOrders);

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Admin
router.patch('/:id/status', protect,admin, updateOrderStatus);

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Admin
router.delete('/:id', protect,admin, deleteOrder);

export default router;
