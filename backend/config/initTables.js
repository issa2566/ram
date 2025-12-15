/**
 * Database Table Initialization
 * Ensures all required tables exist on server startup
 */

const { pool } = require('./database');

async function initAllTables() {
  console.log('🔄 Initializing database tables...');
  
  try {
    // Create car_brands table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS car_brands (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        file TEXT,
        models TEXT[],
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ car_brands table ready');

    // Create search_options table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS search_options (
        id SERIAL PRIMARY KEY,
        field TEXT NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ search_options table ready');

    // Create products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC,
        original_price NUMERIC,
        discount TEXT,
        main_image TEXT,
        all_images TEXT[],
        brand TEXT,
        sku TEXT,
        category TEXT,
        loyalty_points INTEGER DEFAULT 0,
        has_preview BOOLEAN DEFAULT false,
        has_options BOOLEAN DEFAULT false,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ products table ready');

    // Create users table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'user',
        is_admin BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ users table ready');

    console.log('✅ All database tables initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error initializing tables:', error.message);
    return false;
  }
}

module.exports = { initAllTables };

