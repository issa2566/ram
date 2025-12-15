/**
 * Migration: Convert price column from TEXT to NUMERIC(12,3) in acha_products
 * This fixes TEXT/NUMERIC conflicts when updating promotion fields
 */

const { pool } = require('../config/database');

async function convertPriceToNumeric() {
  console.log('🔧 [MIGRATION] Converting price column from TEXT to NUMERIC(12,3) in acha_products...');
  
  let client;
  try {
    client = await pool.connect();
    
    // Check current column type
    const columnCheck = await client.query(`
      SELECT data_type, numeric_precision, numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'acha_products' 
      AND column_name = 'price'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('⚠️ [MIGRATION] Column price does not exist, skipping');
      return;
    }
    
    const currentType = columnCheck.rows[0].data_type;
    
    if (currentType === 'numeric') {
      console.log('🟩 [MIGRATION] Column price is already NUMERIC, skipping conversion');
      return;
    }
    
    // Convert empty strings to 0.000 before conversion
    await client.query(`
      UPDATE acha_products 
      SET price = '0.000' 
      WHERE price = '' OR price IS NULL
    `);
    
    // Convert TEXT to NUMERIC(12,3)
    await client.query(`
      ALTER TABLE acha_products
      ALTER COLUMN price TYPE NUMERIC(12,3)
      USING CASE 
        WHEN price = '' OR price IS NULL THEN 0.000
        ELSE price::NUMERIC
      END
    `);
    
    // Set default value
    await client.query(`
      ALTER TABLE acha_products
      ALTER COLUMN price SET DEFAULT 0.000
    `);
    
    console.log('✅ [MIGRATION] Column price converted to NUMERIC(12,3) successfully');
    
  } catch (error) {
    console.error('🟥 [MIGRATION] ERROR converting price to NUMERIC:', error.message);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = convertPriceToNumeric;

// Allow running standalone for testing
if (require.main === module) {
  console.log('🔧 Running convert_price_to_numeric in standalone mode...');
  convertPriceToNumeric()
    .then(() => {
      console.log('🟩 Migration completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('🟥 Migration failed:', err);
      process.exit(1);
    });
}

