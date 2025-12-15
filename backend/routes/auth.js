/**
 * Auth Routes
 * Authentication endpoints
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const asyncHandler = require('../middlewares/asyncHandler');

router.post('/register', asyncHandler(AuthController.register));
router.post('/login', asyncHandler(AuthController.login));
router.get('/check-email/:email', asyncHandler(AuthController.checkEmail));

module.exports = router;
