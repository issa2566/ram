/**
 * Order Controller
 * Handles order CRUD operations
 */

const Order = require('../models/Order');

class OrderController {
  /**
   * GET /api/orders
   * Get all orders (admin only)
   */
  static async getAll(req, res) {
    try {
      const orders = await Order.findAll();
      
      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      console.error('❌ Error in getAll orders:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders'
      });
    }
  }

  /**
   * POST /api/orders
   * Create a new order
   */
  static async create(req, res) {
    try {
      // Debug: Log incoming request body
      console.log('📥 Backend: Received order request body:', JSON.stringify(req.body, null, 2));

      const {
        product_id,
        product_name,
        product_image,
        product_price,
        product_references,
        quantity,
        customer_nom,
        customer_prenom,
        customer_phone,
        customer_wilaya,
        customer_delegation
      } = req.body;

      // Validate required fields with detailed error messages
      const missingFields = [];
      if (!product_name) missingFields.push('product_name');
      if (!customer_nom || !customer_nom.trim()) missingFields.push('customer_nom');
      if (!customer_prenom || !customer_prenom.trim()) missingFields.push('customer_prenom');
      if (!customer_phone || !customer_phone.trim()) missingFields.push('customer_phone');
      if (!customer_wilaya || !customer_wilaya.trim()) missingFields.push('customer_wilaya');
      if (!customer_delegation || !customer_delegation.trim()) missingFields.push('customer_delegation');

      if (missingFields.length > 0) {
        console.error('❌ Backend: Missing required fields:', missingFields);
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
          received: {
            customer_nom: customer_nom || null,
            customer_prenom: customer_prenom || null,
            customer_phone: customer_phone || null,
            customer_wilaya: customer_wilaya || null,
            customer_delegation: customer_delegation || null
          }
        });
      }

      // Validate quantity
      const orderQuantity = quantity || 1;
      if (orderQuantity < 1) {
        return res.status(400).json({
          success: false,
          error: 'Quantity must be at least 1'
        });
      }

      // Create order
      const order = await Order.create({
        product_id,
        product_name,
        product_image,
        product_price: product_price ? parseFloat(product_price) : 0,
        product_references: Array.isArray(product_references) ? product_references : [],
        quantity: orderQuantity,
        customer_nom,
        customer_prenom,
        customer_phone,
        customer_wilaya,
        customer_delegation
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (error) {
      console.error('❌ Error in create order:', error.message);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create order'
      });
    }
  }

  /**
   * DELETE /api/orders/:id
   * Delete an order (admin only)
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Valid order ID is required'
        });
      }

      const deleted = await Order.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Order deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error in delete order:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to delete order'
      });
    }
  }
}

module.exports = OrderController;

