/**
 * Migration: Add promotion_percentage column to acha_products
 * Adds INTEGER column with default value 0
 */

const { pool } = require('../config/database');

async function addPromotionPercentage() {
  console.log('🔧 [MIGRATION] Adding promotion_percentage column to acha_products...');
  
  let client;
  try {
    client = await pool.connect();
    
    // Check if column already exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'acha_products' 
      AND column_name = 'promotion_percentage'
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('🟩 [MIGRATION] Column promotion_percentage already exists');
      return;
    }
    
    // Add the column (idempotent - safe to run multiple times)
    await client.query(`
      ALTER TABLE acha_products 
      ADD COLUMN IF NOT EXISTS promotion_percentage NUMERIC DEFAULT 0
    `);
    
    console.log('✅ [MIGRATION] Column promotion_percentage added/verified successfully');
    
  } catch (error) {
    console.error('🟥 [MIGRATION] ERROR adding promotion_percentage:', error.message);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = addPromotionPercentage;

// Allow running standalone for testing
if (require.main === module) {
  console.log('🔧 Running add_promotion_percentage in standalone mode...');
  addPromotionPercentage()
    .then(() => {
      console.log('🟩 Migration completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('🟥 Migration failed:', err);
      process.exit(1);
    });
}

