/**
 * Database Table Initializer (DEPRECATED)
 * 
 * This file is kept for backward compatibility but is NO LONGER USED.
 * 
 * Database schema is now managed via:
 * - db/schema.sql (single source of truth)
 * - db/migrate.js (executes schema.sql)
 * 
 * Server startup now calls migrate.js instead of this file.
 */

const { pool } = require('../config/database');

/**
 * Check if a table exists in the database
 * @param {object} pool - PostgreSQL connection pool
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} - True if table exists
 */
async function tableExists(pool, tableName) {
  try {
    const result = await pool.query(
      `SELECT to_regclass($1) as exists`,
      [`public.${tableName}`]
    );
    return result.rows[0].exists !== null;
  } catch (error) {
    console.error(`❌ Error checking if table ${tableName} exists:`, error.message);
    return false;
  }
}

/**
 * DEPRECATED: This function is no longer used.
 * Tables are now created via db/migrate.js which executes db/schema.sql
 */
async function initializeTables(pool) {
  console.warn('⚠️  initializeTables() is deprecated. Use db/migrate.js instead.');
  return { success: true, tablesCreated: [] };
}

module.exports = {
  initializeTables,
  tableExists
};
