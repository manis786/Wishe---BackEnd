import express from 'express';
import { 
  createOrder, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder 
} from '../controller/order.controller.js';

const router = express.Router();

// Public routes for checkout
router.post('/', createOrder);

// Admin routes for managing orders
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;
