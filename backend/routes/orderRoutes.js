import express from 'express';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  // deleteOrder
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createOrder);

router.get('/:id', getOrderById);

router.get('/', protect,admin, getAllOrders);

router.patch('/:id/status', protect,admin, updateOrderStatus);

// router.delete('/:id', protect,admin, deleteOrder);

export default router;
