/**
 * Database Table Initializer
 * Automatically creates all required tables if they don't exist
 * Run this at server startup to ensure database schema is ready
 */

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
 * Initialize all required database tables
 * @param {object} pool - PostgreSQL connection pool
 * @returns {Promise<{success: boolean, tablesCreated: string[]}>}
 */
async function initializeTables(pool) {
  console.log('🔄 Database: Starting table initialization...');
  
  const tablesCreated = [];
  const errors = [];

  // Table definitions
  const tables = [
    {
      name: 'car_brands',
      createSQL: `
        CREATE TABLE car_brands (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          model TEXT,
          description TEXT,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    },
    {
      name: 'search_options',
      createSQL: `
        CREATE TABLE search_options (
          id SERIAL PRIMARY KEY,
          field TEXT NOT NULL,
          value TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
    },
    {
      name: 'vehicles',
      createSQL: `
        CREATE TABLE vehicles (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          brand TEXT NOT NULL,
          model TEXT NOT NULL,
          description TEXT,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    },
    {
      name: 'products',
      createSQL: `
        CREATE TABLE products (
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
      `
    },
    {
      name: 'users',
      createSQL: `
        CREATE TABLE users (
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
      `
    },
    {
      name: 'vehicle_models',
      createSQL: `
        CREATE TABLE vehicle_models (
          id SERIAL PRIMARY KEY,
          marque VARCHAR(255) NOT NULL,
          model VARCHAR(255) NOT NULL,
          description TEXT,
          image TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    },
    {
      name: 'vehicle_model_parts',
      createSQL: `
        CREATE TABLE vehicle_model_parts (
          id SERIAL PRIMARY KEY,
          model_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          reference TEXT,
          description TEXT,
          price NUMERIC(10,2),
          image_url TEXT,
          category TEXT,
          in_stock BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    },
    {
      name: 'acha_products',
      createSQL: `
        CREATE TABLE acha_products (
          id SERIAL PRIMARY KEY,
          sub_id TEXT UNIQUE NOT NULL,
          name TEXT,
          brand_name TEXT,
          model_name TEXT,
          description TEXT,
          price NUMERIC(12,3) DEFAULT 0.000,
          images TEXT[],
          quantity INTEGER DEFAULT 0,
          product_references TEXT[] DEFAULT '{}',
          promotion_percentage NUMERIC DEFAULT 0,
          promotion_price NUMERIC DEFAULT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    },
    {
      name: 'hero_content',
      createSQL: `
        CREATE TABLE hero_content (
          id SERIAL PRIMARY KEY,
          title TEXT DEFAULT 'Un large choix de pièces auto',
          subtitle TEXT DEFAULT 'Découvrez des milliers de références pour toutes les marques populaires. Qualité garantie, service fiable.',
          button_text TEXT DEFAULT 'Découvrir le catalogue',
          button_link TEXT DEFAULT '/catalogue',
          images TEXT[] DEFAULT ARRAY['/k.png', '/k2.jpg', '/k3.png'],
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    },
    {
      name: 'brand_images',
      createSQL: `
        CREATE TABLE brand_images (
          id SERIAL PRIMARY KEY,
          title TEXT DEFAULT 'NOS MARQUES DISPONIBLES',
          images TEXT[] DEFAULT ARRAY['/pp.jpg'],
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    },
    {
      name: 'dashboard_products',
      createSQL: `
        CREATE TABLE dashboard_products (
          id SERIAL PRIMARY KEY,
          product_id TEXT,
          name TEXT,
          image TEXT,
          reference TEXT,
          price NUMERIC(12,3),
          quantity INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    },
    {
      name: 'section_content',
      createSQL: `
        CREATE TABLE section_content (
          id SERIAL PRIMARY KEY,
          section_type TEXT UNIQUE NOT NULL,
          title TEXT,
          content JSONB
        )
      `
    },
    {
      name: 'orders',
      createSQL: `
        CREATE TABLE orders (
          id SERIAL PRIMARY KEY,
          product_id TEXT,
          product_name TEXT NOT NULL,
          product_image TEXT,
          product_price NUMERIC(12,3) DEFAULT 0,
          product_references TEXT[] DEFAULT '{}',
          quantity INTEGER NOT NULL DEFAULT 1,
          customer_nom TEXT NOT NULL,
          customer_prenom TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          customer_wilaya TEXT NOT NULL,
          customer_delegation TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `
    }
  ];

  // Check and create each table
  for (const table of tables) {
    try {
      const exists = await tableExists(pool, table.name);
      
      if (!exists) {
        console.log(`📦 Creating table: ${table.name}`);
        await pool.query(table.createSQL);
        tablesCreated.push(table.name);
        console.log(`✅ Table created: ${table.name}`);
      } else {
        console.log(`✓ Table exists: ${table.name}`);
      }
      
      // Ensure section_content table is created if missing
      if (table.name === 'section_content') {
        try {
          await pool.query(`
            CREATE TABLE IF NOT EXISTS section_content (
              id SERIAL PRIMARY KEY,
              section_type TEXT UNIQUE NOT NULL,
              title TEXT,
              content JSONB
            )
          `);
          console.log("✅ section_content table verified");
        } catch (alterError) {
          console.log("ℹ️ section_content table verification completed:", alterError.message);
        }
      }
      
      // Special verification for orders - ensure all required columns exist
      if (table.name === 'orders') {
        console.log("✅ Orders table verified");
        try {
          // Check if table exists and has required columns
          const columnCheck = await pool.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'orders'
          `);
          
          const existingColumns = columnCheck.rows.map(row => row.column_name);
          
          // Add missing columns if needed (migration support)
          if (!existingColumns.includes('product_id')) {
            await pool.query(`ALTER TABLE orders ADD COLUMN product_id TEXT`);
            console.log("✅ Added product_id column to orders");
          }
          if (!existingColumns.includes('product_image')) {
            await pool.query(`ALTER TABLE orders ADD COLUMN product_image TEXT`);
            console.log("✅ Added product_image column to orders");
          }
          if (!existingColumns.includes('product_price')) {
            await pool.query(`ALTER TABLE orders ADD COLUMN product_price NUMERIC(12,3) DEFAULT 0`);
            console.log("✅ Added product_price column to orders");
          }
          if (!existingColumns.includes('product_references')) {
            await pool.query(`ALTER TABLE orders ADD COLUMN product_references TEXT[] DEFAULT '{}'`);
            console.log("✅ Added product_references column to orders");
          }
          if (!existingColumns.includes('customer_nom')) {
            await pool.query(`ALTER TABLE orders ADD COLUMN customer_nom TEXT`);
            console.log("✅ Added customer_nom column to orders");
          }
          if (!existingColumns.includes('customer_prenom')) {
            await pool.query(`ALTER TABLE orders ADD COLUMN customer_prenom TEXT`);
            console.log("✅ Added customer_prenom column to orders");
          }
          if (!existingColumns.includes('customer_phone')) {
            await pool.query(`ALTER TABLE orders ADD COLUMN customer_phone TEXT`);
            console.log("✅ Added customer_phone column to orders");
          }
          if (!existingColumns.includes('customer_wilaya')) {
            await pool.query(`ALTER TABLE orders ADD COLUMN customer_wilaya TEXT`);
            console.log("✅ Added customer_wilaya column to orders");
            // If old governorate column exists, copy its data to customer_wilaya
            if (existingColumns.includes('governorate')) {
              await pool.query(`UPDATE orders SET customer_wilaya = governorate WHERE customer_wilaya IS NULL`);
              console.log("✅ Migrated data from governorate to customer_wilaya");
            }
          }
          if (!existingColumns.includes('customer_delegation')) {
            await pool.query(`ALTER TABLE orders ADD COLUMN customer_delegation TEXT`);
            console.log("✅ Added customer_delegation column to orders");
            // If old delegation column exists, copy its data to customer_delegation
            if (existingColumns.includes('delegation')) {
              await pool.query(`UPDATE orders SET customer_delegation = delegation WHERE customer_delegation IS NULL`);
              console.log("✅ Migrated data from delegation to customer_delegation");
            }
          }
          
          // Ensure new columns are NOT NULL after migration
          // First, check if there are any NULL values that would prevent setting NOT NULL
          const nullCheck = await pool.query(`
            SELECT COUNT(*) as null_count 
            FROM orders 
            WHERE customer_wilaya IS NULL OR customer_delegation IS NULL
          `);
          
          if (parseInt(nullCheck.rows[0].null_count) === 0) {
            // No NULL values, we can safely set NOT NULL
            try {
              await pool.query(`ALTER TABLE orders ALTER COLUMN customer_wilaya SET NOT NULL`);
              await pool.query(`ALTER TABLE orders ALTER COLUMN customer_delegation SET NOT NULL`);
              console.log("✅ Set customer_wilaya and customer_delegation to NOT NULL");
            } catch (notNullError) {
              console.warn("⚠️ Could not set NOT NULL constraint (this is OK if columns already have it):", notNullError.message);
            }
          }
          
          // Migrate old column names to new ones if they exist
          if (existingColumns.includes('firstname') && existingColumns.includes('customer_prenom')) {
            await pool.query(`UPDATE orders SET customer_prenom = firstname WHERE customer_prenom IS NULL`);
          }
          if (existingColumns.includes('lastname') && existingColumns.includes('customer_nom')) {
            await pool.query(`UPDATE orders SET customer_nom = lastname WHERE customer_nom IS NULL`);
          }
          if (existingColumns.includes('phone') && existingColumns.includes('customer_phone')) {
            await pool.query(`UPDATE orders SET customer_phone = phone WHERE customer_phone IS NULL`);
          }
          if (existingColumns.includes('governorate') && existingColumns.includes('customer_wilaya')) {
            await pool.query(`UPDATE orders SET customer_wilaya = governorate WHERE customer_wilaya IS NULL`);
          }
          if (existingColumns.includes('delegation') && existingColumns.includes('customer_delegation')) {
            await pool.query(`UPDATE orders SET customer_delegation = delegation WHERE customer_delegation IS NULL`);
          }
        } catch (alterError) {
          console.error("❌ Error migrating orders table:", alterError.message);
        }
      }
      
      // Special verification for dashboard_products - ensure quantity column exists and is correct type
      if (table.name === 'dashboard_products') {
        console.log("✅ Dashboard products table verified");
        // Ensure quantity column exists, has correct type, default, and no NULL values
        try {
          // Check if quantity column exists
          const columnCheck = await pool.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'dashboard_products' AND column_name = 'quantity'
          `);

          if (columnCheck.rows.length === 0) {
            // Column doesn't exist - add it
            await pool.query(`
              ALTER TABLE dashboard_products 
              ADD COLUMN quantity INTEGER DEFAULT 0
            `);
            console.log("✅ Quantity column added to dashboard_products");
          } else {
            // Column exists - ensure it's INTEGER type with DEFAULT 0
            console.log("🔄 Migrating quantity column to ensure INTEGER type and DEFAULT 0...");
            
            // Alter column type to INTEGER (if needed)
            await pool.query(`
              ALTER TABLE dashboard_products 
              ALTER COLUMN quantity TYPE INTEGER USING quantity::integer
            `);
            console.log("✅ Quantity column type set to INTEGER");
            
            // Set default value to 0
            await pool.query(`
              ALTER TABLE dashboard_products 
              ALTER COLUMN quantity SET DEFAULT 0
            `);
            console.log("✅ Quantity column default set to 0");
          }
          
          // Update any NULL values to 0
          const updateResult = await pool.query(`
            UPDATE dashboard_products 
            SET quantity = 0 
            WHERE quantity IS NULL
          `);
          if (updateResult.rowCount > 0) {
            console.log(`✅ Updated ${updateResult.rowCount} rows with NULL quantity to 0`);
          } else {
            console.log("✅ No NULL quantity values found");
          }
        } catch (alterError) {
          console.error("❌ Error migrating quantity column:", alterError.message);
          // Continue even if migration fails (column might be in use)
        }
      }
    } catch (error) {
      console.error(`❌ Error creating table ${table.name}:`, error.message);
      errors.push({ table: table.name, error: error.message });
    }
  }

  // Summary
  if (tablesCreated.length > 0) {
    console.log(`\n✅ Database: Created ${tablesCreated.length} new table(s): ${tablesCreated.join(', ')}`);
  } else {
    console.log('\n✅ Database: All tables already exist');
  }

  if (errors.length > 0) {
    console.error(`\n⚠️ Database: ${errors.length} error(s) occurred during initialization`);
    return { success: false, tablesCreated, errors };
  }

  return { success: true, tablesCreated };
}

/**
 * Drop and recreate all tables (use with caution!)
 * @param {object} pool - PostgreSQL connection pool
 */
async function resetTables(pool) {
  console.log('⚠️ WARNING: Resetting all tables...');
  
  const tables = ['vehicles', 'car_brands', 'search_options', 'products', 'users', 'vehicle_models', 'vehicle_model_parts', 'acha_products', 'hero_content', 'brand_images', 'dashboard_products'];
  
  for (const table of tables) {
    try {
      await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
      console.log(`🗑️ Dropped table: ${table}`);
    } catch (error) {
      console.error(`❌ Error dropping table ${table}:`, error.message);
    }
  }
  
  // Recreate tables
  return await initializeTables(pool);
}

module.exports = {
  initializeTables,
  tableExists,
  resetTables
};

