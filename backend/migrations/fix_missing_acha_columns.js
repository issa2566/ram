/**
 * FIX MISSING ACHA COLUMNS MIGRATION
 * ==========================================
 * Adds missing columns brand_name and model_name to acha_products table.
 * Safe and idempotent - can be run multiple times without errors.
 * Does NOT drop table or delete any data.
 */

const { pool } = require('../config/database');

async function fixMissingAchaColumns() {
  console.log('🔧 [MIGRATION] Checking for missing columns in acha_products...');
  
  let client;
  try {
    client = await pool.connect();
    
    // ==========================================
    // Check if table exists first
    // ==========================================
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = 'acha_products'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('🟡 [MIGRATION] Table acha_products does not exist yet - will be created by initTables');
      return;
    }
    
    console.log('🟩 [MIGRATION] Table acha_products exists - checking columns...');
    
    // ==========================================
    // Check if brand_name column exists
    // ==========================================
    const brandNameCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'acha_products' 
      AND column_name = 'brand_name'
    `);
    
    if (brandNameCheck.rows.length === 0) {
      console.log('🟥 [MIGRATION] Column "brand_name" is MISSING → adding...');
      await client.query(`ALTER TABLE acha_products ADD COLUMN brand_name TEXT`);
      console.log('🟩 [MIGRATION] Column "brand_name" added successfully');
    } else {
      console.log('🟩 [MIGRATION] Column "brand_name" already exists');
    }
    
    // ==========================================
    // Check if model_name column exists
    // ==========================================
    const modelNameCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'acha_products' 
      AND column_name = 'model_name'
    `);
    
    if (modelNameCheck.rows.length === 0) {
      console.log('🟥 [MIGRATION] Column "model_name" is MISSING → adding...');
      await client.query(`ALTER TABLE acha_products ADD COLUMN model_name TEXT`);
      console.log('🟩 [MIGRATION] Column "model_name" added successfully');
    } else {
      console.log('🟩 [MIGRATION] Column "model_name" already exists');
    }
    
    // ==========================================
    // Check if product_references column exists (also could be missing)
    // ==========================================
    const productRefsCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'acha_products' 
      AND column_name = 'product_references'
    `);
    
    if (productRefsCheck.rows.length === 0) {
      // Check if old 'references' column exists
      const oldRefsCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'acha_products' 
        AND column_name = 'references'
      `);
      
      if (oldRefsCheck.rows.length > 0) {
        console.log('🟥 [MIGRATION] Old column "references" found → renaming to "product_references"...');
        await client.query(`ALTER TABLE acha_products RENAME COLUMN references TO product_references`);
        console.log('🟩 [MIGRATION] Column renamed: references → product_references');
      } else {
        console.log('🟥 [MIGRATION] Column "product_references" is MISSING → adding...');
        await client.query(`ALTER TABLE acha_products ADD COLUMN product_references TEXT[] DEFAULT '{}'`);
        console.log('🟩 [MIGRATION] Column "product_references" added successfully');
      }
    } else {
      console.log('🟩 [MIGRATION] Column "product_references" already exists');
    }
    
    // ==========================================
    // Final validation
    // ==========================================
    console.log('');
    console.log('🟦 [MIGRATION] Final schema validation...');
    
    const finalCheck = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'acha_products'
      ORDER BY ordinal_position
    `);
    
    console.log('🟩 [MIGRATION] acha_products columns:');
    finalCheck.rows.forEach(col => {
      const marker = ['brand_name', 'model_name', 'product_references'].includes(col.column_name) ? '✅' : '  ';
      console.log(`   ${marker} ${col.column_name} (${col.data_type})`);
    });
    
    console.log('');
    console.log('🟩 [MIGRATION] ✅ Missing columns fix COMPLETE');
    
  } catch (error) {
    console.error('🟥 [MIGRATION] ERROR fixing missing columns:', error.message);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = fixMissingAchaColumns;

// Allow running standalone for testing
if (require.main === module) {
  console.log('🔧 Running fix_missing_acha_columns in standalone mode...');
  fixMissingAchaColumns()
    .then(() => {
      console.log('🟩 Migration completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('🟥 Migration failed:', err);
      process.exit(1);
    });
}

