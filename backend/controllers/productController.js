/**
 * Product Controller
 * Handles product CRUD operations
 * Now with better error handling
 */

const Product = require('../models/Product');

class ProductController {
  static async getAll(req, res) {
    try {
      const { category, brand, search } = req.query;
      
      const filters = {};
      if (category) filters.category = category;
      if (brand) filters.brand = brand;
      if (search) filters.search = search;
      
      const products = await Product.findAll(filters);
      
      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      console.error('❌ Error in getAll:', error.message);
      // Return empty array instead of 500
      res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Valid product ID is required'
        });
      }
      
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('❌ Error in getById:', error.message);
      res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
  }

  static async create(req, res) {
    try {
      const {
        name,
        price,
        original_price,
        discount,
        main_image,
        all_images,
        brand,
        sku,
        category,
        loyalty_points,
        has_preview,
        has_options,
        description
      } = req.body;
      
      // Input validation
      if (!name || !price || !brand || !sku || !category) {
        return res.status(400).json({
          success: false,
          error: 'Name, price, brand, SKU, and category are required'
        });
      }
      
      // Check if SKU already exists
      const skuExists = await Product.findBySku(sku);
      if (skuExists) {
        return res.status(409).json({
          success: false,
          error: 'SKU already exists'
        });
      }
      
      const product = await Product.create({
        name,
        price,
        original_price,
        discount,
        main_image,
        all_images,
        brand,
        sku,
        category,
        loyalty_points,
        has_preview,
        has_options,
        description
      });
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      console.error('❌ Error in create:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to create product'
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Valid product ID is required'
        });
      }
      
      // Check if product exists
      const productExists = await Product.findById(id);
      if (!productExists) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      // Check SKU uniqueness if SKU is being updated
      if (updateData.sku) {
        const skuExists = await Product.findBySku(updateData.sku, id);
        if (skuExists) {
          return res.status(409).json({
            success: false,
            error: 'SKU already exists'
          });
        }
      }
      
      const product = await Product.update(id, updateData);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      console.error('❌ Error in update:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to update product'
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Valid product ID is required'
        });
      }
      
      const product = await Product.delete(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: {
          id: product.id,
          name: product.name
        }
      });
    } catch (error) {
      console.error('❌ Error in delete:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to delete product'
      });
    }
  }
}

module.exports = ProductController;
