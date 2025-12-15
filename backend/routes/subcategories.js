const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');

// Ensure uploads/subcategories directory exists
const uploadsDir = path.join(__dirname, '../uploads/subcategories');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created /uploads/subcategories directory');
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = req.body.subcategory_name
      ? req.body.subcategory_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
      : 'subcategory';
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  }
});

// File filter - accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  console.log('📤 Upload file check:', file.originalname, 'mimetype:', file.mimetype);
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ File accepted:', file.originalname);
    cb(null, true);
  } else {
    console.log('❌ File rejected:', file.originalname);
    cb(new Error('Only JPG, JPEG, and PNG files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Admin check middleware (simplified for development)
const isAdmin = (req, res, next) => {
  // TODO: Implement proper admin authentication
  // For now, allow all requests
  return next();
};

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('❌ Multer error:', err.message);
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  } else if (err) {
    console.error('❌ Upload error:', err.message);
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next();
};

/**
 * Initialize subcategories table with family_name column
 * Includes migrations for old schema versions
 */
async function initSubcategoriesTable() {
  try {
    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subcategories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        family_name TEXT NOT NULL DEFAULT 'Uncategorized',
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Check if family_name column exists, add if missing (migration)
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'subcategories' 
      AND column_name = 'family_name'
    `);
    
    if (columnCheck.rows.length === 0) {
      console.log('🔧 [MIGRATION] Adding family_name column to subcategories...');
      await pool.query(`ALTER TABLE subcategories ADD COLUMN family_name TEXT DEFAULT 'Uncategorized'`);
      // Update any NULL values
      await pool.query(`UPDATE subcategories SET family_name = 'Uncategorized' WHERE family_name IS NULL`);
      console.log('✅ [MIGRATION] family_name column added');
    }
    
    // Migration: Fix unique constraint from UNIQUE(name) to UNIQUE(name, family_name)
    // Check for old constraint on just 'name'
    const oldConstraintCheck = await pool.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'subcategories'::regclass 
      AND contype = 'u'
      AND array_length(conkey, 1) = 1
    `);
    
    if (oldConstraintCheck.rows.length > 0) {
      for (const row of oldConstraintCheck.rows) {
        console.log(`🔧 [MIGRATION] Dropping old unique constraint: ${row.conname}`);
        try {
          await pool.query(`ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS ${row.conname}`);
        } catch (e) {
          console.log(`⚠️ Could not drop constraint ${row.conname}: ${e.message}`);
        }
      }
    }
    
    // Create proper unique constraint on (name, family_name) if not exists
    try {
      await pool.query(`
        ALTER TABLE subcategories 
        ADD CONSTRAINT subcategories_name_family_unique UNIQUE(name, family_name)
      `);
      console.log('✅ [MIGRATION] Added UNIQUE(name, family_name) constraint');
    } catch (e) {
      // Constraint might already exist
      if (!e.message.includes('already exists')) {
        console.log('⚠️ Unique constraint note:', e.message);
      }
    }
    
    // Create index for faster lookups by family
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_subcategories_family ON subcategories(family_name)
    `);
    
    console.log('✅ subcategories table ready (with family_name support)');
  } catch (error) {
    console.error('❌ Error creating subcategories table:', error.message);
  }
}

// Initialize table on module load
initSubcategoriesTable();

/**
 * POST /api/subcategories/upload-image
 * Upload an image for a subcategory AND link it to a family (admin only)
 * Required: subcategory_name, image
 * Optional: family_name (defaults to 'Uncategorized')
 */
router.post('/upload-image', isAdmin, upload.single('image'), handleMulterError, async (req, res) => {
  console.log('📤 POST /api/subcategories/upload-image');
  console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { subcategory_name, family_name } = req.body;
    const familyNameValue = family_name || 'Uncategorized';
    
    // Log warning if family_name is missing
    if (!family_name) {
      console.warn('⚠️ WARNING: family_name not provided! Using default "Uncategorized"');
      console.warn('⚠️ This may cause subcategory to not appear in the correct family after refresh!');
    }
    
    if (!subcategory_name) {
      return res.status(400).json({
        success: false,
        error: 'subcategory_name is required'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded'
      });
    }
    
    console.log(`📦 Uploading image for subcategory: "${subcategory_name}" (Family: "${familyNameValue}")`);
    console.log(`📄 File: ${req.file.originalname} → ${req.file.filename}`);
    
    // Create the image URL (relative path)
    const imageUrl = `/uploads/subcategories/${req.file.filename}`;
    
    // Check if subcategory exists and get old image URL
    const existingResult = await pool.query(
      'SELECT image_url FROM subcategories WHERE name = $1 AND family_name = $2',
      [subcategory_name, familyNameValue]
    );
    
    const oldImageUrl = existingResult.rows[0]?.image_url;
    
    // Insert or update subcategory in database WITH family_name
    const result = await pool.query(`
      INSERT INTO subcategories (name, family_name, image_url, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (name, family_name) 
      DO UPDATE SET image_url = $3, updated_at = NOW()
      RETURNING *
    `, [subcategory_name, familyNameValue, imageUrl]);
    
    // Delete old image file if it exists and is different
    if (oldImageUrl && oldImageUrl !== imageUrl && oldImageUrl.startsWith('/uploads/subcategories/')) {
      const oldFilename = oldImageUrl.replace('/uploads/subcategories/', '');
      const oldFilepath = path.join(uploadsDir, oldFilename);
      
      if (fs.existsSync(oldFilepath)) {
        try {
          fs.unlinkSync(oldFilepath);
          console.log(`🗑️ Deleted old image: ${oldFilename}`);
        } catch (err) {
          console.error(`❌ Failed to delete old image: ${oldFilename}`, err.message);
        }
      }
    }
    
    console.log('✅ Image uploaded and database updated');
    
    // Prevent caching of response
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        id: result.rows[0].id,
        subcategory_name: result.rows[0].name,
        family_name: result.rows[0].family_name,
        image_url: result.rows[0].image_url,
        timestamp: Date.now() // For cache busting on frontend
      }
    });
  } catch (error) {
    console.error('❌ Error uploading subcategory image:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image: ' + error.message
    });
  }
});

/**
 * GET /api/subcategories
 * Get all subcategories with images
 * NO CACHING - Always returns fresh data
 */
router.get('/', async (req, res) => {
  console.log('📥 GET /api/subcategories');
  
  // Prevent caching - ensure all clients get fresh data
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    const result = await pool.query('SELECT * FROM subcategories ORDER BY family_name, name');
    
    console.log(`✅ Returned ${result.rows.length} subcategories`);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ Error fetching subcategories:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subcategories'
    });
  }
});

/**
 * GET /api/subcategories/by-family
 * Get all subcategories grouped by family_name
 * Returns: { familyName: [subcategories], ... }
 */
router.get('/by-family', async (req, res) => {
  console.log('📥 GET /api/subcategories/by-family');
  
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    const result = await pool.query('SELECT * FROM subcategories ORDER BY family_name, name');
    
    // Group by family_name
    const grouped = {};
    result.rows.forEach(row => {
      const family = row.family_name || 'Uncategorized';
      if (!grouped[family]) {
        grouped[family] = [];
      }
      grouped[family].push({
        id: row.id,
        name: row.name,
        image_url: row.image_url,
        created_at: row.created_at,
        updated_at: row.updated_at
      });
    });
    
    console.log(`✅ Returned subcategories for ${Object.keys(grouped).length} families`);
    
    res.json({
      success: true,
      data: grouped
    });
  } catch (error) {
    console.error('❌ Error fetching subcategories by family:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subcategories'
    });
  }
});

/**
 * GET /api/subcategories/family/:familyName
 * Get all subcategories for a specific family
 */
router.get('/family/:familyName', async (req, res) => {
  const { familyName } = req.params;
  console.log(`📥 GET /api/subcategories/family/${familyName}`);
  
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  try {
    const decodedFamily = decodeURIComponent(familyName);
    const result = await pool.query(
      'SELECT * FROM subcategories WHERE family_name = $1 ORDER BY name',
      [decodedFamily]
    );
    
    console.log(`✅ Returned ${result.rows.length} subcategories for family: ${decodedFamily}`);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('❌ Error fetching subcategories for family:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subcategories'
    });
  }
});

/**
 * DELETE /api/subcategories/:name/image
 * Delete a subcategory image (admin only)
 * Query param: ?family_name=FamilyName (optional but recommended)
 */
router.delete('/:name/image', isAdmin, async (req, res) => {
  const { name } = req.params;
  const { family_name } = req.query;
  console.log('🗑️ DELETE /api/subcategories/' + name + '/image', family_name ? `(Family: ${family_name})` : '');
  
  try {
    let result;
    let updateQuery;
    let updateParams;
    
    // Use family_name if provided (family-safe)
    if (family_name) {
      result = await pool.query(
        'SELECT image_url FROM subcategories WHERE name = $1 AND family_name = $2',
        [name, family_name]
      );
      updateQuery = 'UPDATE subcategories SET image_url = NULL, updated_at = NOW() WHERE name = $1 AND family_name = $2';
      updateParams = [name, family_name];
    } else {
      // Fallback: use name only (may affect multiple families if same name exists)
      console.warn('⚠️ DELETE without family_name - may affect multiple subcategories with same name');
      result = await pool.query(
        'SELECT image_url FROM subcategories WHERE name = $1',
        [name]
      );
      updateQuery = 'UPDATE subcategories SET image_url = NULL, updated_at = NOW() WHERE name = $1';
      updateParams = [name];
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }
    
    const imageUrl = result.rows[0].image_url;
    
    // Update database to remove image URL
    await pool.query(updateQuery, updateParams);
    
    // Delete image file if it exists
    if (imageUrl && imageUrl.startsWith('/uploads/subcategories/')) {
      const filename = imageUrl.replace('/uploads/subcategories/', '');
      const filepath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath);
          console.log(`🗑️ Deleted image: ${filename}`);
        } catch (err) {
          console.error(`❌ Failed to delete image: ${filename}`, err.message);
        }
      }
    }
    
    console.log('✅ Subcategory image deleted');
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting subcategory image:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image: ' + error.message
    });
  }
});

/**
 * DELETE /api/subcategories/:name
 * Delete an entire subcategory (admin only)
 * Query param: ?family_name=FamilyName (required for family-safe deletion)
 */
router.delete('/:name', isAdmin, async (req, res) => {
  const { name } = req.params;
  const { family_name } = req.query;
  console.log('🗑️ DELETE /api/subcategories/' + name, family_name ? `(Family: ${family_name})` : '');
  
  if (!family_name) {
    return res.status(400).json({
      success: false,
      error: 'family_name query parameter is required for safe deletion'
    });
  }
  
  try {
    // Get image URL before deletion
    const result = await pool.query(
      'SELECT image_url FROM subcategories WHERE name = $1 AND family_name = $2',
      [name, family_name]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }
    
    const imageUrl = result.rows[0].image_url;
    
    // Delete from database
    await pool.query(
      'DELETE FROM subcategories WHERE name = $1 AND family_name = $2',
      [name, family_name]
    );
    
    // Delete image file if it exists
    if (imageUrl && imageUrl.startsWith('/uploads/subcategories/')) {
      const filename = imageUrl.replace('/uploads/subcategories/', '');
      const filepath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath);
          console.log(`🗑️ Deleted image file: ${filename}`);
        } catch (err) {
          console.error(`❌ Failed to delete image file: ${filename}`, err.message);
        }
      }
    }
    
    console.log('✅ Subcategory deleted');
    
    res.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting subcategory:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete subcategory: ' + error.message
    });
  }
});

module.exports = router;

