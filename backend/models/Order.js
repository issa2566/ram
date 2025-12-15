/**
 * Order Model
 * Database operations for orders
 */

const { pool } = require('../config/database');

class Order {
  /**
   * Find all orders, sorted by newest first
   */
  static async findAll() {
    const result = await pool.query(
      'SELECT * FROM orders ORDER BY created_at DESC'
    );
    return result.rows;
  }

  /**
   * Find order by ID
   */
  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Create a new order
   */
  static async create(orderData) {
    const {
      product_id,
      product_name,
      product_image,
      product_price,
      product_references,
      quantity,
      customer_nom,
      customer_prenom,
      customer_phone,
      customer_wilaya,
      customer_delegation
    } = orderData;

    // Validate required fields with explicit checks
    if (!product_name) {
      throw new Error('product_name is required');
    }
    if (!customer_nom || !customer_nom.trim()) {
      throw new Error('customer_nom is required and cannot be empty');
    }
    if (!customer_prenom || !customer_prenom.trim()) {
      throw new Error('customer_prenom is required and cannot be empty');
    }
    if (!customer_phone || !customer_phone.trim()) {
      throw new Error('customer_phone is required and cannot be empty');
    }
    if (!customer_wilaya || !customer_wilaya.trim()) {
      throw new Error('customer_wilaya is required and cannot be empty');
    }
    if (!customer_delegation || !customer_delegation.trim()) {
      throw new Error('customer_delegation is required and cannot be empty');
    }
    if (!quantity || quantity < 1) {
      throw new Error('quantity must be at least 1');
    }

    // Prepare values with explicit trimming and validation
    const values = [
      product_id || null,
      product_name.trim(),
      product_image || null,
      product_price ? parseFloat(product_price) : 0,
      Array.isArray(product_references) ? product_references : [],
      quantity,
      customer_nom.trim(),
      customer_prenom.trim(),
      customer_phone.trim(),
      customer_wilaya.trim(), // CRITICAL: Must not be null or empty
      customer_delegation.trim() // CRITICAL: Must not be null or empty
    ];

    // Debug: Log values before insert
    console.log('📝 Model: Inserting order with values:', {
      customer_wilaya: values[9],
      customer_delegation: values[10],
      customer_nom: values[6],
      customer_prenom: values[7],
      customer_phone: values[8]
    });

    // 🛡️ SAFE COLUMN DETECTION: Check if legacy columns exist for backward compatibility
    // This prevents NULL constraint violations on old NOT NULL columns
    let existingColumns = [];
    let columnDetectionFailed = false;
    const legacyColumnNames = ['governorate', 'delegation', 'firstname', 'lastname', 'phone'];

    try {
      console.log('🛡️ ORDER MODEL: Checking for legacy columns in orders table...');
      const columnCheck = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND table_schema = 'public'
      `);
      
      existingColumns = columnCheck.rows.map(row => row.column_name.toLowerCase());
      console.log('🛡️ ORDER MODEL: Column detection successful. Found columns:', existingColumns.length);
      
      // Log detected legacy columns
      const detectedLegacyColumns = legacyColumnNames.filter(col => existingColumns.includes(col.toLowerCase()));
      if (detectedLegacyColumns.length > 0) {
        console.log('🛡️ ORDER MODEL: Detected legacy columns:', detectedLegacyColumns.join(', '));
      } else {
        console.log('🛡️ ORDER MODEL: No legacy columns detected. Using new schema only.');
      }
    } catch (columnCheckError) {
      // 🛡️ FALLBACK STRATEGY: If column detection fails, assume ALL legacy columns exist
      // This is the SAFEST approach - better to include unnecessary columns than miss required ones
      columnDetectionFailed = true;
      existingColumns = legacyColumnNames.map(col => col.toLowerCase()); // Assume all exist
      console.error('🛡️ ORDER MODEL: ⚠️ Column detection FAILED:', columnCheckError.message);
      console.log('🛡️ ORDER MODEL: 🛡️ FALLBACK MODE ACTIVATED - Assuming ALL legacy columns exist for safety');
      console.log('🛡️ ORDER MODEL: Will include in INSERT:', legacyColumnNames.join(', '));
    }

    // Build INSERT statement with new columns (always included)
    let insertSQL = `INSERT INTO orders (
      product_id, product_name, product_image, product_price, product_references,
      quantity, customer_nom, customer_prenom, customer_phone, 
      customer_wilaya, customer_delegation`;
    
    const columnsToAdd = [];
    
    // 🛡️ GUARANTEED INSERT COVERAGE: Include legacy columns if they exist OR if detection failed
    // Check each legacy column (case-insensitive)
    if (columnDetectionFailed || existingColumns.includes('governorate')) {
      insertSQL += ', governorate';
      values.push(customer_wilaya.trim()); // Map customer_wilaya to governorate
      columnsToAdd.push('governorate');
    }
    if (columnDetectionFailed || existingColumns.includes('delegation')) {
      insertSQL += ', delegation';
      values.push(customer_delegation.trim()); // Map customer_delegation to delegation
      columnsToAdd.push('delegation');
    }
    if (columnDetectionFailed || existingColumns.includes('firstname')) {
      insertSQL += ', firstname';
      values.push(customer_prenom.trim());
      columnsToAdd.push('firstname');
    }
    if (columnDetectionFailed || existingColumns.includes('lastname')) {
      insertSQL += ', lastname';
      values.push(customer_nom.trim());
      columnsToAdd.push('lastname');
    }
    if (columnDetectionFailed || existingColumns.includes('phone')) {
      insertSQL += ', phone';
      values.push(customer_phone.trim());
      columnsToAdd.push('phone');
    }

    // Log final INSERT strategy
    if (columnsToAdd.length > 0) {
      console.log('🛡️ ORDER MODEL: ✅ Including legacy columns in INSERT:', columnsToAdd.join(', '));
    }
    console.log('🛡️ ORDER MODEL: Total values for INSERT:', values.length);

    insertSQL += `) VALUES (`;
    for (let i = 1; i <= values.length; i++) {
      insertSQL += `$${i}`;
      if (i < values.length) insertSQL += ', ';
    }
    insertSQL += `) RETURNING *`;

    // Log final SQL (truncated for readability)
    console.log('🛡️ ORDER MODEL: Executing INSERT with', values.length, 'parameters');
    
    try {
      const result = await pool.query(insertSQL, values);
      console.log('🛡️ ORDER MODEL: ✅ Order inserted successfully');
      return result.rows[0];
    } catch (insertError) {
      // Enhanced error logging for NULL constraint violations
      if (insertError.code === '23502' || insertError.message.includes('NULL') || insertError.message.includes('NOT NULL')) {
        console.error('🛡️ ORDER MODEL: ❌ NULL CONSTRAINT VIOLATION DETECTED!');
        console.error('🛡️ ORDER MODEL: Error message:', insertError.message);
        console.error('🛡️ ORDER MODEL: This should NOT happen with hardened backward compatibility');
        console.error('🛡️ ORDER MODEL: Columns included:', columnsToAdd.length > 0 ? columnsToAdd.join(', ') : 'none');
        console.error('🛡️ ORDER MODEL: Column detection status:', columnDetectionFailed ? 'FAILED (fallback used)' : 'SUCCESS');
      }
      throw insertError; // Re-throw to be handled by controller
    }
  }

  /**
   * Delete an order
   */
  static async delete(id) {
    const result = await pool.query(
      'DELETE FROM orders WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  }
}

module.exports = Order;

