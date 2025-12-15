const { pool } = require("../config/database");

exports.getAllDashboardProducts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM dashboard_products ORDER BY created_at DESC"
    );
    
    // Ensure quantity is always returned as a number (handle NULL values)
    const productsWithQuantity = result.rows.map(row => ({
      ...row,
      quantity: row.quantity !== null && row.quantity !== undefined ? Number(row.quantity) : 0
    }));
    
    res.json({
      success: true,
      count: productsWithQuantity.length,
      data: productsWithQuantity
    });
  } catch (error) {
    console.error("Error fetching dashboard products:", error);
    res.status(500).json({ success: false, error: "Failed to load dashboard products" });
  }
};

exports.addDashboardProduct = async (req, res) => {
  try {
    // AUTO-CHECK: Print the POST body received
    console.log('📥 POST /dashboard-products - Request body received:', JSON.stringify(req.body, null, 2));
    
    const { id, product_id, name, image, reference, price, quantity } = req.body;
    
    // Use product_id if provided, otherwise fall back to id
    const productId = product_id || id;

    if (!productId) {
      return res.status(400).json({ success: false, error: "Product ID is required" });
    }

    // AUTO-CHECK: Print quantity value
    console.log('📊 Quantity value received:', quantity, 'Type:', typeof quantity);

    // Check for duplicate product_id
    const exists = await pool.query(
      "SELECT * FROM dashboard_products WHERE product_id = $1",
      [productId]
    );

    if (exists.rows.length > 0) {
      // Ensure quantity is returned as a number for duplicate response
      const existingProduct = {
        ...exists.rows[0],
        quantity: exists.rows[0].quantity !== null && exists.rows[0].quantity !== undefined ? Number(exists.rows[0].quantity) : 0
      };
      return res.json({ 
        success: true, 
        data: existingProduct, 
        duplicate: true,
        message: "Product already exists in dashboard"
      });
    }

    const quantityValue = quantity !== undefined && quantity !== null ? Number(quantity) : 0;
    console.log('💾 Inserting quantity value:', quantityValue);

    const result = await pool.query(
      `INSERT INTO dashboard_products (product_id, name, image, reference, price, quantity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [productId, name || null, image || null, reference || null, price || 0, quantityValue]
    );

    // Ensure quantity is returned as a number
    const savedProduct = {
      ...result.rows[0],
      quantity: result.rows[0].quantity !== null && result.rows[0].quantity !== undefined ? Number(result.rows[0].quantity) : 0
    };
    
    // AUTO-CHECK: Print the object returned to frontend
    console.log('📤 Response data sent to frontend:', JSON.stringify(savedProduct, null, 2));

    res.json({ success: true, data: savedProduct });
  } catch (error) {
    console.error("Error adding dashboard product:", error);
    res.status(500).json({ success: false, error: "Failed to add product" });
  }
};

exports.deleteDashboardProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await pool.query("DELETE FROM dashboard_products WHERE id = $1 RETURNING *", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting dashboard product:", error);
    res.status(500).json({ success: false, error: "Failed to delete product" });
  }
};

exports.updateDashboardProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, image, reference, price, quantity } = req.body;

    const quantityValue = quantity !== undefined && quantity !== null ? Number(quantity) : null;

    const result = await pool.query(
      `UPDATE dashboard_products 
       SET name = COALESCE($1, name),
           image = COALESCE($2, image),
           reference = COALESCE($3, reference),
           price = COALESCE($4, price),
           quantity = COALESCE($5, quantity)
       WHERE id = $6
       RETURNING *`,
      [name, image, reference, price, quantityValue, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    // Ensure quantity is returned as a number
    const updatedProduct = {
      ...result.rows[0],
      quantity: result.rows[0].quantity !== null && result.rows[0].quantity !== undefined ? Number(result.rows[0].quantity) : 0
    };

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Error updating dashboard product:", error);
    res.status(500).json({ success: false, error: "Failed to update product" });
  }
};
