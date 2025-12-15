/**
 * Migration: Create acha2_products table
 * Dedicated table for Acha2 page products
 */

const { pool } = require('../config/database');

async function createAcha2ProductsTable() {
  console.log('🔧 [MIGRATION] Creating acha2_products table...');

  const client = await pool.connect();

  try {
    // Create the table
    await client.query(`
      CREATE TABLE IF NOT EXISTS acha2_products (
        name TEXT PRIMARY KEY,
        quantity2 INTEGER DEFAULT 0,
        price2 NUMERIC DEFAULT 0,
        description2 TEXT,
        references2 JSONB DEFAULT '[]'::jsonb,
        images2 JSONB DEFAULT '[]'::jsonb,
        modele2 JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add modele2 column if table exists but column doesn't
    await client.query(`
      ALTER TABLE acha2_products
      ADD COLUMN IF NOT EXISTS modele2 JSONB DEFAULT '[]'::jsonb
    `);

    console.log('✅ [MIGRATION] acha2_products table created successfully');
  } catch (error) {
    console.error('❌ [MIGRATION] Error creating acha2_products table:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = createAcha2ProductsTable;

// Run migration if called directly
if (require.main === module) {
  createAcha2ProductsTable()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

