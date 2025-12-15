/**
 * ACHA PRODUCTS SCHEMA AUTO-FIX MIGRATION
 * ==========================================
 * This script automatically runs at server startup to ensure
 * the acha_products table has the correct schema.
 * 
 * FIXES:
 * 1. Renames 'references' column to 'product_references' if needed
 * 2. Creates table if it doesn't exist
 * 3. Adds performance index
 * 
 * AUTO-PILOT MODE - NO USER INTERACTION REQUIRED
 */

const { pool } = require('../config/database');

async function fixAchaProductsSchema() {
  console.log('🔥 [MIGRATION] Starting acha_products schema fix...');
  
  let client;
  try {
    client = await pool.connect();
    
    // ==========================================
    // STEP A: Check if table exists
    // ==========================================
    console.log('🟦 [MIGRATION] Checking if table exists...');
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = 'acha_products'
    `);
    
    const tableExists = tableCheck.rows.length > 0;
    
    if (!tableExists) {
      // ==========================================
      // STEP E: Table doesn't exist - CREATE IT
      // ==========================================
      console.log('🟥 [MIGRATION] Table does NOT exist - creating new table...');
      
      await client.query(`
        CREATE TABLE acha_products (
          id SERIAL PRIMARY KEY,
          sub_id TEXT UNIQUE NOT NULL,
          name TEXT,
          brand_name TEXT,
          model_name TEXT,
          description TEXT,
          price TEXT,
          images TEXT[],
          quantity INTEGER DEFAULT 0,
          product_references TEXT[] DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log('🟩 [MIGRATION] Created new acha_products table');
      
      // STEP F: Add index
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_acha_products_sub_id
        ON acha_products(sub_id)
      `);
      
      console.log('🟩 [MIGRATION] Index created: idx_acha_products_sub_id');
      console.log('🟩 [MIGRATION] Schema migration COMPLETE - New table created');
      
    } else {
      // ==========================================
      // STEP C: Table exists - Check for old column name
      // ==========================================
      console.log('🟩 [MIGRATION] Table exists');
      console.log('🟦 [MIGRATION] Checking for old column name "references"...');
      
      const columnCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'acha_products' 
        AND column_name = 'references'
      `);
      
      const hasOldColumn = columnCheck.rows.length > 0;
      
      if (hasOldColumn) {
        // ==========================================
        // STEP D: Old column exists - RENAME IT
        // ==========================================
        console.log('🟥 [MIGRATION] Column "references" FOUND → fixing...');
        
        try {
          await client.query(`
            ALTER TABLE acha_products 
            RENAME COLUMN references TO product_references
          `);
          
          console.log('🟩 [MIGRATION] Column renamed: references → product_references');
        } catch (renameError) {
          if (renameError.message.includes('does not exist')) {
            console.log('🟩 [MIGRATION] Column already named product_references');
          } else {
            throw renameError;
          }
        }
      } else {
        console.log('🟩 [MIGRATION] Column "product_references" already correct');
      }
      
      // STEP F: Ensure index exists
      console.log('🟦 [MIGRATION] Ensuring index exists...');
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_acha_products_sub_id
        ON acha_products(sub_id)
      `);
      console.log('🟩 [MIGRATION] Index verified: idx_acha_products_sub_id');
      
      console.log('🟩 [MIGRATION] Schema migration COMPLETE - Table validated');
    }
    
    // ==========================================
    // STEP G: Print final result
    // ==========================================
    console.log('');
    console.log('🟦 [MIGRATION] ========================================');
    console.log('🟦 [MIGRATION] FINAL SCHEMA VALIDATION');
    console.log('🟦 [MIGRATION] ========================================');
    
    const finalCheck = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'acha_products'
      ORDER BY ordinal_position
    `);
    
    console.log('🟩 [MIGRATION] Table: acha_products');
    console.log('🟩 [MIGRATION] Columns:');
    finalCheck.rows.forEach(col => {
      if (col.column_name === 'product_references') {
        console.log(`   ✅ ${col.column_name} (${col.data_type}) - CORRECT`);
      } else {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      }
    });
    
    // Check if 'references' column still exists (should not)
    const oldColumnStillExists = finalCheck.rows.some(col => col.column_name === 'references');
    if (oldColumnStillExists) {
      console.log('🟥 [MIGRATION] ERROR: Old column "references" still exists!');
      throw new Error('Migration failed - old column still present');
    } else {
      console.log('🟩 [MIGRATION] No old "references" column found - Schema is clean');
    }
    
    console.log('🟦 [MIGRATION] ========================================');
    console.log('🟩 [MIGRATION] ✅ SCHEMA FIX COMPLETE - READY FOR USE');
    console.log('🟦 [MIGRATION] ========================================');
    console.log('');
    
  } catch (error) {
    console.error('🟥 [MIGRATION] ERROR during schema fix:', error.message);
    console.error('🟥 [MIGRATION] Stack:', error.stack);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Export the migration function
module.exports = fixAchaProductsSchema;

// Allow running standalone for testing
if (require.main === module) {
  console.log('🔥 Running migration in standalone mode...');
  fixAchaProductsSchema()
    .then(() => {
      console.log('🟩 Migration completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('🟥 Migration failed:', err);
      process.exit(1);
    });
}

