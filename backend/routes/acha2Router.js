/**
 * Acha2 Router
 * Dedicated endpoints for Acha2 page products
 * Uses acha2_products table (separate from acha_products)
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const createAcha2ProductsTable = require('../migrations/create_acha2_products_table');

/**
 * GET /api/acha2?name=xxxx
 * Load product by name
 * Returns: { success: true, data: {...} } or { success: true, data: null }
 */
router.get('/', async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required'
      });
    }

    // Ensure table exists
    await createAcha2ProductsTable();

    // Query the database
    const result = await pool.query(
      'SELECT * FROM acha2_products WHERE name = $1',
      [name]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    const product = result.rows[0];

    // Parse JSONB fields if they're strings
    let references2 = product.references2;
    if (typeof references2 === 'string') {
      try {
        references2 = JSON.parse(references2);
      } catch (e) {
        references2 = [];
      }
    }
    if (!Array.isArray(references2)) {
      references2 = [];
    }

    let images2 = product.images2;
    if (typeof images2 === 'string') {
      try {
        images2 = JSON.parse(images2);
      } catch (e) {
        images2 = [];
      }
    }
    if (!Array.isArray(images2)) {
      images2 = [];
    }

    let modele2 = product.modele2;
    if (typeof modele2 === 'string') {
      try {
        modele2 = JSON.parse(modele2);
      } catch (e) {
        modele2 = [];
      }
    }
    if (!Array.isArray(modele2)) {
      modele2 = [];
    }

    return res.json({
      success: true,
      data: {
        name: product.name,
        quantity2: product.quantity2 || 0,
        price2: product.price2 ? parseFloat(product.price2) : 0,
        description2: product.description2 || '',
        references2: references2,
        images2: images2,
        modele2: modele2
      }
    });

  } catch (error) {
    console.error('❌ Error in GET /api/acha2:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * PUT /api/acha2/:name
 * Save or update product by name
 * Uses UPSERT: INSERT ... ON CONFLICT (name) DO UPDATE ...
 */
  router.put('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { quantity2, price2, description2, references2, images2, modele2 } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required'
      });
    }

    // Ensure table exists
    await createAcha2ProductsTable();

    // Prepare values
    const quantity = quantity2 !== undefined ? parseInt(quantity2) || 0 : 0;
    const price = price2 !== undefined ? parseFloat(price2) || 0 : 0;
    const description = description2 !== undefined ? (description2 || '') : '';
    const references = Array.isArray(references2) ? references2 : [];
    const images = Array.isArray(images2) ? images2 : [];
    const modeles = Array.isArray(modele2) ? modele2 : [];

    // UPSERT: Insert or update
    const result = await pool.query(
      `INSERT INTO acha2_products (name, quantity2, price2, description2, references2, images2, modele2, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, NOW())
       ON CONFLICT (name) 
       DO UPDATE SET 
         quantity2 = EXCLUDED.quantity2,
         price2 = EXCLUDED.price2,
         description2 = EXCLUDED.description2,
         references2 = EXCLUDED.references2,
         images2 = EXCLUDED.images2,
         modele2 = EXCLUDED.modele2,
         updated_at = NOW()
       RETURNING *`,
      [name, quantity, price, description, JSON.stringify(references), JSON.stringify(images), JSON.stringify(modeles)]
    );

    const product = result.rows[0];

    // Parse JSONB fields for response
    let parsedReferences = product.references2;
    if (typeof parsedReferences === 'string') {
      try {
        parsedReferences = JSON.parse(parsedReferences);
      } catch (e) {
        parsedReferences = [];
      }
    }
    if (!Array.isArray(parsedReferences)) {
      parsedReferences = [];
    }

    let parsedImages = product.images2;
    if (typeof parsedImages === 'string') {
      try {
        parsedImages = JSON.parse(parsedImages);
      } catch (e) {
        parsedImages = [];
      }
    }
    if (!Array.isArray(parsedImages)) {
      parsedImages = [];
    }

    let parsedModeles = product.modele2;
    if (typeof parsedModeles === 'string') {
      try {
        parsedModeles = JSON.parse(parsedModeles);
      } catch (e) {
        parsedModeles = [];
      }
    }
    if (!Array.isArray(parsedModeles)) {
      parsedModeles = [];
    }

    return res.json({
      success: true,
      data: {
        name: product.name,
        quantity2: product.quantity2 || 0,
        price2: product.price2 ? parseFloat(product.price2) : 0,
        description2: product.description2 || '',
        references2: parsedReferences,
        images2: parsedImages,
        modele2: parsedModeles
      }
    });

  } catch (error) {
    console.error('❌ Error in PUT /api/acha2/:name:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * GET /api/acha2/all
 * Get all acha2 products
 * Returns: { success: true, data: [...] }
 */
router.get('/all', async (req, res) => {
  try {
    // Ensure table exists
    await createAcha2ProductsTable();

    // Query all products
    const result = await pool.query(
      'SELECT * FROM acha2_products ORDER BY updated_at DESC, created_at DESC'
    );

    // Parse JSONB fields for each product
    const products = result.rows.map(product => {
      let references2 = product.references2;
      if (typeof references2 === 'string') {
        try {
          references2 = JSON.parse(references2);
        } catch (e) {
          references2 = [];
        }
      }
      if (!Array.isArray(references2)) {
        references2 = [];
      }

      let images2 = product.images2;
      if (typeof images2 === 'string') {
        try {
          images2 = JSON.parse(images2);
        } catch (e) {
          images2 = [];
        }
      }
      if (!Array.isArray(images2)) {
        images2 = [];
      }

      let modele2 = product.modele2;
      if (typeof modele2 === 'string') {
        try {
          modele2 = JSON.parse(modele2);
        } catch (e) {
          modele2 = [];
        }
      }
      if (!Array.isArray(modele2)) {
        modele2 = [];
      }

      return {
        id: product.name, // Use name as id
        name: product.name,
        quantity2: product.quantity2 || 0,
        price2: product.price2 ? parseFloat(product.price2) : 0,
        description2: product.description2 || '',
        references2: references2,
        images2: images2,
        modele2: modele2,
        created_at: product.created_at,
        updated_at: product.updated_at
      };
    });

    return res.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('❌ Error in GET /api/acha2/all:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

/**
 * DELETE /api/acha2/:name
 * Delete acha2 product by name
 */
router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Product name is required'
      });
    }

    // Ensure table exists
    await createAcha2ProductsTable();

    // Delete the product
    const result = await pool.query(
      'DELETE FROM acha2_products WHERE name = $1 RETURNING *',
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    return res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in DELETE /api/acha2/:name:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

module.exports = router;

