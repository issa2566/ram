/**
 * Product Routes
 * Product CRUD endpoints
 */

const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const asyncHandler = require('../middlewares/asyncHandler');

router.get('/', asyncHandler(ProductController.getAll));
router.get('/:id', asyncHandler(ProductController.getById));
router.post('/', asyncHandler(ProductController.create));
router.put('/:id', asyncHandler(ProductController.update));
router.delete('/:id', asyncHandler(ProductController.delete));

module.exports = router;
