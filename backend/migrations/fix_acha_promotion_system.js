/**
 * COMPREHENSIVE MIGRATION: Fix Acha Product Promotion System
 * 
 * This migration fixes THREE critical issues:
 * 1. Adds promotion_percentage column (NUMERIC DEFAULT 0) if missing
 * 2. Adds promotion_price column (NUMERIC DEFAULT NULL) if missing
 * 3. Converts price column from TEXT to NUMERIC(12,3) if needed
 * 
 * All operations are idempotent and safe to run multiple times.
 */

const { pool } = require('../config/database');

async function fixAchaPromotionSystem() {
  console.log('🔧 [MIGRATION] Starting comprehensive Acha promotion system fix...');
  
  let client;
  try {
    client = await pool.connect();
    
    // ==========================================
    // STEP 1: Check if table exists
    // ==========================================
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'acha_products'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('⚠️ [MIGRATION] Table acha_products does not exist. Creating it...');
      // Table will be created by initTable() in AchaProduct model
      // Just return here
      return;
    }
    
    // ==========================================
    // STEP 2: Check current column types
    // ==========================================
    const columnsCheck = await client.query(`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns
      WHERE table_name = 'acha_products'
      AND column_name IN ('price', 'promotion_percentage', 'promotion_price')
      ORDER BY column_name
    `);
    
    const existingColumns = {};
    columnsCheck.rows.forEach(row => {
      existingColumns[row.column_name] = {
        exists: true,
        type: row.data_type,
        precision: row.numeric_precision,
        scale: row.numeric_scale
      };
    });
    
    console.log('📊 [MIGRATION] Current column state:', existingColumns);
    
    // ==========================================
    // STEP 3: Fix price column (TEXT → NUMERIC)
    // ==========================================
    if (!existingColumns.price) {
      console.log('⚠️ [MIGRATION] Price column does not exist. This is unexpected.');
    } else if (existingColumns.price.type === 'text' || existingColumns.price.type === 'character varying') {
      console.log('🔧 [MIGRATION] Converting price column from TEXT to NUMERIC(12,3)...');
      
      try {
        // First, update any invalid values to 0.000
        await client.query(`
          UPDATE acha_products
          SET price = '0.000'
          WHERE price IS NULL OR price = '' OR price !~ '^[0-9]+\.?[0-9]*$'
        `);
        
        // Convert the column type
        await client.query(`
          ALTER TABLE acha_products
          ALTER COLUMN price TYPE NUMERIC(12,3)
          USING CASE 
            WHEN price ~ '^[0-9]+\.?[0-9]*$' THEN price::NUMERIC
            ELSE 0.000
          END
        `);
        
        // Set default if not already set
        await client.query(`
          ALTER TABLE acha_products
          ALTER COLUMN price SET DEFAULT 0.000
        `);
        
        console.log('✅ [MIGRATION] Price column converted to NUMERIC(12,3)');
      } catch (error) {
        console.error('🟥 [MIGRATION] ERROR converting price column:', error.message);
        throw error;
      }
    } else {
      console.log('🟩 [MIGRATION] Price column is already NUMERIC');
    }
    
    // ==========================================
    // STEP 4: Add promotion_percentage column
    // ==========================================
    if (!existingColumns.promotion_percentage) {
      console.log('🔧 [MIGRATION] Adding promotion_percentage column...');
      
      try {
        await client.query(`
          ALTER TABLE acha_products 
          ADD COLUMN promotion_percentage NUMERIC DEFAULT 0
        `);
        
        // Update existing rows to have 0
        await client.query(`
          UPDATE acha_products
          SET promotion_percentage = 0
          WHERE promotion_percentage IS NULL
        `);
        
        console.log('✅ [MIGRATION] Column promotion_percentage added successfully');
      } catch (error) {
        console.error('🟥 [MIGRATION] ERROR adding promotion_percentage:', error.message);
        throw error;
      }
    } else {
      console.log('🟩 [MIGRATION] Column promotion_percentage already exists');
      
      // Ensure default is set
      try {
        await client.query(`
          ALTER TABLE acha_products
          ALTER COLUMN promotion_percentage SET DEFAULT 0
        `);
      } catch (e) {
        // Ignore if default already set
      }
    }
    
    // ==========================================
    // STEP 5: Add promotion_price column
    // ==========================================
    if (!existingColumns.promotion_price) {
      console.log('🔧 [MIGRATION] Adding promotion_price column...');
      
      try {
        await client.query(`
          ALTER TABLE acha_products 
          ADD COLUMN promotion_price NUMERIC DEFAULT NULL
        `);
        
        console.log('✅ [MIGRATION] Column promotion_price added successfully');
      } catch (error) {
        console.error('🟥 [MIGRATION] ERROR adding promotion_price:', error.message);
        throw error;
      }
    } else {
      console.log('🟩 [MIGRATION] Column promotion_price already exists');
    }
    
    // ==========================================
    // STEP 6: Verify final state
    // ==========================================
    const finalCheck = await client.query(`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns
      WHERE table_name = 'acha_products'
      AND column_name IN ('price', 'promotion_percentage', 'promotion_price')
      ORDER BY column_name
    `);
    
    console.log('✅ [MIGRATION] Final column state:');
    finalCheck.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type}${row.numeric_precision ? `(${row.numeric_precision},${row.numeric_scale})` : ''}`);
    });
    
    console.log('✅ [MIGRATION] Acha promotion system fix completed successfully!');
    
  } catch (error) {
    console.error('🟥 [MIGRATION] CRITICAL ERROR in fixAchaPromotionSystem:', error.message);
    console.error('   Stack:', error.stack);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = fixAchaPromotionSystem;

// Allow running standalone for testing
if (require.main === module) {
  console.log('🔧 Running fix_acha_promotion_system in standalone mode...');
  fixAchaPromotionSystem()
    .then(() => {
      console.log('🟩 Migration completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('🟥 Migration failed:', err);
      process.exit(1);
    });
}

