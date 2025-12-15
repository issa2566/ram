const { pool } = require('../config/database');

async function fixPriceColumnType() {
  console.log('🔧 [MIGRATION] Fixing price column type from TEXT to NUMERIC(12,3)...');
  
  let client;
  try {
    client = await pool.connect();
    
    await client.query(`
      ALTER TABLE acha_products
      ALTER COLUMN price TYPE NUMERIC(12,3)
      USING price::NUMERIC
    `);
    
    console.log('✅ [MIGRATION] Price column converted to NUMERIC(12,3)');
    
  } catch (error) {
    if (error.message.includes('does not exist') || error.message.includes('already')) {
      console.log('⚠️ [MIGRATION] Price column type migration skipped (already applied or column does not exist)');
    } else {
      console.error('🟥 [MIGRATION] ERROR:', error.message);
      throw error;
    }
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = fixPriceColumnType;
