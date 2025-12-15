/**
 * Migration: Add Acha2 fields to acha_products table
 * Adds quantity2, description2, price2, references2, images2 fields
 */

const { pool } = require('../config/database');

async function addAcha2Fields() {
  console.log('🔧 [MIGRATION] Adding Acha2 fields to acha_products table...');

  const client = await pool.connect();

  try {
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'acha_products'
      )
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️ [MIGRATION] Table acha_products does not exist. Creating it...');
      // Table will be created by AchaProduct.initTable()
      await client.release();
      return;
    }

    // Check existing columns
    const columnsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'acha_products' 
      AND column_name IN ('quantity2', 'description2', 'price2', 'references2', 'images2')
    `);

    const existingColumns = columnsCheck.rows.map(row => row.column_name);

    // Add quantity2 if it doesn't exist
    if (!existingColumns.includes('quantity2')) {
      await client.query(`
        ALTER TABLE acha_products 
        ADD COLUMN quantity2 INTEGER DEFAULT 0
      `);
      console.log('✅ [MIGRATION] Added column: quantity2');
    }

    // Add description2 if it doesn't exist
    if (!existingColumns.includes('description2')) {
      await client.query(`
        ALTER TABLE acha_products 
        ADD COLUMN description2 TEXT
      `);
      console.log('✅ [MIGRATION] Added column: description2');
    }

    // Add price2 if it doesn't exist
    if (!existingColumns.includes('price2')) {
      await client.query(`
        ALTER TABLE acha_products 
        ADD COLUMN price2 NUMERIC(12,3) DEFAULT 0.000
      `);
      console.log('✅ [MIGRATION] Added column: price2');
    }

    // Add references2 if it doesn't exist
    if (!existingColumns.includes('references2')) {
      await client.query(`
        ALTER TABLE acha_products 
        ADD COLUMN references2 JSONB DEFAULT '[]'::jsonb
      `);
      console.log('✅ [MIGRATION] Added column: references2');
    }

    // Add images2 if it doesn't exist
    if (!existingColumns.includes('images2')) {
      await client.query(`
        ALTER TABLE acha_products 
        ADD COLUMN images2 JSONB DEFAULT '[]'::jsonb
      `);
      console.log('✅ [MIGRATION] Added column: images2');
    }

    console.log('✅ [MIGRATION] Acha2 fields migration completed successfully');
  } catch (error) {
    console.error('❌ [MIGRATION] Error adding Acha2 fields:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = addAcha2Fields;

// Run migration if called directly
if (require.main === module) {
  addAcha2Fields()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

