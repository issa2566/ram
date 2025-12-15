/**
 * User Controller
 * Handles user CRUD operations
 */

const User = require('../models/User');
const bcrypt = require('bcrypt');

class UserController {
  static async getAll(req, res) {
    const users = await User.findAll();
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  }

  static async getById(req, res) {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Valid user ID is required'
      });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  }

  static async create(req, res) {
    const { name, email, password, phone, address } = req.body;
    
    // Input validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Check if email already exists
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  }

  static async update(req, res) {
    const { id } = req.params;
    const { name, email, phone, address, is_admin } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Valid user ID is required'
      });
    }
    
    // Check if user exists
    const userExists = await User.findById(id);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
      
      // Check if email is already used by another user
      const emailExists = await User.emailExists(email, id);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }
    
    const user = await User.update(id, { name, email, phone, address, is_admin });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  }

  static async delete(req, res) {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: 'Valid user ID is required'
      });
    }
    
    const user = await User.delete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: user
    });
  }
}

module.exports = UserController;

