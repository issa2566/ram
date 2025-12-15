/**
 * REAL DATABASE CHECK AND FIX
 * This script directly queries and fixes the PostgreSQL database
 */

require('dotenv').config();
const { pool } = require('./config/database');

async function checkAndFixDatabase() {
  let client;
  const executedQueries = [];
  const results = {
    before: {},
    after: {},
    queries: [],
    fixes: []
  };

  try {
    client = await pool.connect();
    console.log('✅ Connected to database\n');

    // ==========================================
    // STEP 1: Check current schema
    // ==========================================
    console.log('📊 STEP 1: Checking current schema...');
    const schemaCheck = await client.query(`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns
      WHERE table_name = 'acha_products'
      AND column_name IN ('price', 'promotion_percentage', 'promotion_price')
      ORDER BY column_name
    `);
    
    results.before = {};
    schemaCheck.rows.forEach(row => {
      results.before[row.column_name] = {
        exists: true,
        type: row.data_type,
        precision: row.numeric_precision,
        scale: row.numeric_scale
      };
    });

    console.log('Current state:');
    console.log('  price:', results.before.price || 'MISSING');
    console.log('  promotion_percentage:', results.before.promotion_percentage || 'MISSING');
    console.log('  promotion_price:', results.before.promotion_price || 'MISSING');
    console.log('');

    // ==========================================
    // STEP 2: Fix price column
    // ==========================================
    if (!results.before.price) {
      console.log('❌ ERROR: price column does not exist! This is critical.');
      throw new Error('price column missing');
    }

    if (results.before.price.type === 'text' || results.before.price.type === 'character varying') {
      console.log('🔧 FIXING: Converting price from TEXT to NUMERIC(12,3)...');
      
      // First, fix invalid values
      const fixInvalidQuery = `
        UPDATE acha_products
        SET price = '0.000'
        WHERE price IS NULL OR price = '' OR price !~ '^[0-9]+\.?[0-9]*$'
      `;
      await client.query(fixInvalidQuery);
      executedQueries.push(fixInvalidQuery);
      results.queries.push(fixInvalidQuery);

      // Convert column type
      const convertQuery = `
        ALTER TABLE acha_products
        ALTER COLUMN price TYPE NUMERIC(12,3)
        USING CASE 
          WHEN price ~ '^[0-9]+\.?[0-9]*$' THEN price::NUMERIC
          ELSE 0.000
        END
      `;
      await client.query(convertQuery);
      executedQueries.push(convertQuery);
      results.queries.push(convertQuery);
      results.fixes.push('price: TEXT → NUMERIC(12,3)');

      // Set default
      const defaultQuery = `ALTER TABLE acha_products ALTER COLUMN price SET DEFAULT 0.000`;
      await client.query(defaultQuery);
      executedQueries.push(defaultQuery);
      results.queries.push(defaultQuery);

      console.log('✅ Price column converted to NUMERIC(12,3)');
    } else {
      console.log('✅ Price column is already NUMERIC');
    }
    console.log('');

    // ==========================================
    // STEP 3: Add promotion_percentage
    // ==========================================
    if (!results.before.promotion_percentage) {
      console.log('🔧 FIXING: Adding promotion_percentage column...');
      
      const addPromoPercentQuery = `
        ALTER TABLE acha_products 
        ADD COLUMN IF NOT EXISTS promotion_percentage NUMERIC DEFAULT 0
      `;
      await client.query(addPromoPercentQuery);
      executedQueries.push(addPromoPercentQuery);
      results.queries.push(addPromoPercentQuery);
      results.fixes.push('Added promotion_percentage column');

      // Set existing rows to 0
      const updateQuery = `UPDATE acha_products SET promotion_percentage = 0 WHERE promotion_percentage IS NULL`;
      await client.query(updateQuery);
      executedQueries.push(updateQuery);
      results.queries.push(updateQuery);

      console.log('✅ promotion_percentage column added');
    } else {
      console.log('✅ promotion_percentage column already exists');
    }
    console.log('');

    // ==========================================
    // STEP 4: Add promotion_price
    // ==========================================
    if (!results.before.promotion_price) {
      console.log('🔧 FIXING: Adding promotion_price column...');
      
      const addPromoPriceQuery = `
        ALTER TABLE acha_products 
        ADD COLUMN IF NOT EXISTS promotion_price NUMERIC DEFAULT NULL
      `;
      await client.query(addPromoPriceQuery);
      executedQueries.push(addPromoPriceQuery);
      results.queries.push(addPromoPriceQuery);
      results.fixes.push('Added promotion_price column');

      console.log('✅ promotion_price column added');
    } else {
      console.log('✅ promotion_price column already exists');
    }
    console.log('');

    // ==========================================
    // STEP 5: Verify final schema
    // ==========================================
    console.log('📊 STEP 5: Verifying final schema...');
    const finalCheck = await client.query(`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns
      WHERE table_name = 'acha_products'
      AND column_name IN ('price', 'promotion_percentage', 'promotion_price')
      ORDER BY column_name
    `);

    results.after = {};
    finalCheck.rows.forEach(row => {
      results.after[row.column_name] = {
        exists: true,
        type: row.data_type,
        precision: row.numeric_precision,
        scale: row.numeric_scale
      };
    });

    console.log('Final state:');
    console.log('  price:', results.after.price ? `${results.after.price.type}(${results.after.price.precision},${results.after.price.scale})` : 'MISSING');
    console.log('  promotion_percentage:', results.after.promotion_percentage ? results.after.promotion_percentage.type : 'MISSING');
    console.log('  promotion_price:', results.after.promotion_price ? results.after.promotion_price.type : 'MISSING');
    console.log('');

    // ==========================================
    // STEP 6: Check sample data
    // ==========================================
    console.log('📊 STEP 6: Checking sample data...');
    const sampleData = await client.query(`
      SELECT id, sub_id, price, promotion_percentage, promotion_price
      FROM acha_products
      LIMIT 5
    `);

    console.log('Sample products:');
    sampleData.rows.forEach(row => {
      console.log(`  ID ${row.id} (${row.sub_id}):`);
      console.log(`    price: ${row.price}`);
      console.log(`    promotion_percentage: ${row.promotion_percentage}`);
      console.log(`    promotion_price: ${row.promotion_price}`);
    });
    console.log('');

    return results;

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  checkAndFixDatabase()
    .then(results => {
      console.log('\n✅ Database check and fix completed!');
      console.log('\n📋 Summary:');
      console.log('  Fixes applied:', results.fixes.length);
      console.log('  Queries executed:', results.queries.length);
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Failed:', err);
      process.exit(1);
    });
}

module.exports = checkAndFixDatabase;

