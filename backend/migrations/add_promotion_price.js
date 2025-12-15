/**
 * Migration: Add promotion_price column to acha_products
 * Adds NUMERIC column with default value NULL
 */

const { pool } = require('../config/database');

async function addPromotionPrice() {
  console.log('🔧 [MIGRATION] Adding promotion_price column to acha_products...');
  
  let client;
  try {
    client = await pool.connect();
    
    // Check if column already exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'acha_products' 
      AND column_name = 'promotion_price'
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('🟩 [MIGRATION] Column promotion_price already exists');
      return;
    }
    
    // Add the column (idempotent - safe to run multiple times)
    await client.query(`
      ALTER TABLE acha_products 
      ADD COLUMN IF NOT EXISTS promotion_price NUMERIC DEFAULT NULL
    `);
    
    console.log('✅ [MIGRATION] Column promotion_price added/verified successfully');
    
  } catch (error) {
    console.error('🟥 [MIGRATION] ERROR adding promotion_price:', error.message);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = addPromotionPrice;

// Allow running standalone for testing
if (require.main === module) {
  console.log('🔧 Running add_promotion_price in standalone mode...');
  addPromotionPrice()
    .then(() => {
      console.log('🟩 Migration completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('🟥 Migration failed:', err);
      process.exit(1);
    });
}

