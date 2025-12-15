/**
 * Migration: Add quantity column to dashboard_products table
 * This migration adds the quantity INTEGER DEFAULT 0 column to existing tables
 */

const { pool } = require('../config/database');

async function addQuantityToDashboardProducts() {
  try {
    console.log('🔄 Adding quantity column to dashboard_products table...');
    
    // Check if column already exists
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'dashboard_products' 
      AND column_name = 'quantity'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ Quantity column already exists in dashboard_products');
      return { success: true, message: 'Column already exists' };
    }

    // Add the quantity column
    await pool.query(`
      ALTER TABLE dashboard_products 
      ADD COLUMN quantity INTEGER DEFAULT 0
    `);

    console.log('✅ Successfully added quantity column to dashboard_products');
    return { success: true, message: 'Quantity column added successfully' };
  } catch (error) {
    console.error('❌ Error adding quantity column to dashboard_products:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = addQuantityToDashboardProducts;

