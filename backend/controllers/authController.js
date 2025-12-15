/**
 * Auth Controller
 * Handles authentication logic
 */

const bcrypt = require('bcrypt');
const User = require('../models/User');

class AuthController {
  static async register(req, res) {
    const { name, email, password, phone, address } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required'
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
    
    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if email already exists
    const emailExists = await User.emailExists(email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address
    });
    
    // Add role field based on is_admin
    const userResponse = {
      ...user,
      role: user.is_admin ? 'admin' : 'user'
    };
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userResponse
    });
  }

  static async login(req, res) {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Remove password from response and add role field
    const { password: _, ...userWithoutPassword } = user;
    
    // Add role field based on is_admin
    const userResponse = {
      ...userWithoutPassword,
      role: user.is_admin ? 'admin' : 'user'
    };
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: userResponse
    });
  }

  static async checkEmail(req, res) {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }
    
    const emailExists = await User.emailExists(email);
    
    res.status(200).json({
      success: true,
      data: {
        available: !emailExists
      }
    });
  }
}

module.exports = AuthController;

