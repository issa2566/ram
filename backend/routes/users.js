/**
 * User Routes
 * User CRUD endpoints
 */

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const asyncHandler = require('../middlewares/asyncHandler');

router.get('/', asyncHandler(UserController.getAll));
router.get('/:id', asyncHandler(UserController.getById));
router.post('/', asyncHandler(UserController.create));
router.put('/:id', asyncHandler(UserController.update));
router.delete('/:id', asyncHandler(UserController.delete));

module.exports = router;
