/**
 * Orders Router
 * Handles order creation and management
 */

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const asyncHandler = require('../middlewares/asyncHandler');
const requireAdmin = require('../middlewares/requireAdmin');

/**
 * GET /api/orders
 * Get all orders (admin only)
 */
router.get('/', requireAdmin, asyncHandler(OrderController.getAll));

/**
 * POST /api/orders
 * Create a new order (public - anyone can place an order)
 */
router.post('/', asyncHandler(OrderController.create));

/**
 * DELETE /api/orders/:id
 * Delete an order (admin only)
 */
router.delete('/:id', requireAdmin, asyncHandler(OrderController.delete));

module.exports = router;
