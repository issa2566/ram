/**
 * Migration: Create global_settings table
 * Stores global application settings including modele_list
 */

const { pool } = require('../config/database');

async function createGlobalSettingsTable() {
  console.log('🔧 [MIGRATION] Creating global_settings table...');

  const client = await pool.connect();

  try {
    // Create the table
    await client.query(`
      CREATE TABLE IF NOT EXISTS global_settings (
        id SERIAL PRIMARY KEY,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add modele_list if it doesn't exist
    const checkResult = await client.query(
      "SELECT * FROM global_settings WHERE setting_key = 'modele_list'"
    );

    if (checkResult.rows.length === 0) {
      // Initialize with default models
      await client.query(
        `INSERT INTO global_settings (setting_key, setting_value)
         VALUES ('modele_list', $1::jsonb)`,
        [JSON.stringify([
          "Kia Picanto",
          "Kia Rio",
          "Kia Sportage",
          "Hyundai i10",
          "Hyundai i20",
          "Peugeot 208",
          "Peugeot 308",
          "Renault Clio",
          "Renault Megane",
          "Volkswagen Golf",
          "Volkswagen Polo"
        ])]
      );
      console.log('✅ [MIGRATION] Initialized modele_list with default values');
    }

    console.log('✅ [MIGRATION] global_settings table ready');
  } catch (error) {
    console.error('❌ [MIGRATION] Error creating global_settings table:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = createGlobalSettingsTable;

// Run migration if called directly
if (require.main === module) {
  createGlobalSettingsTable()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

