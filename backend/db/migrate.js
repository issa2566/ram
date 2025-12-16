/**
 * Database Migration Script
 * Executes schema.sql ONCE
 * FAILS if any SQL error occurs
 */

require('dotenv').config();
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function migrate() {
  console.log('🔄 Starting database migration...');
  
  const client = await pool.connect();
  
  try {
    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found: ${schemaPath}`);
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema (all statements at once)
    console.log('📦 Executing schema.sql...');
    await client.query(schemaSQL);
    
    console.log('✅ Database migration completed successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Database migration FAILED:');
    console.error(`   Error: ${error.message}`);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    if (error.position) {
      console.error(`   Position: ${error.position}`);
    }
    throw error; // Re-throw to stop server startup
  } finally {
    client.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error.message);
      process.exit(1);
    });
}

module.exports = migrate;

