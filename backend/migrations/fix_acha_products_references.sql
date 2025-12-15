-- ==========================================
-- ACHA PRODUCTS TABLE FIX
-- Migration to rename 'references' column to 'product_references'
-- FIX APPLIED FROM DIAGNOSTIC DOCUMENT
-- ==========================================

-- Run this ONLY IF the table already exists with old column name
-- This script is safe to run multiple times

DO $$
BEGIN
  -- Check if table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'acha_products'
  ) THEN
    
    -- Check if old column 'references' exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'acha_products' 
      AND column_name = 'references'
    ) THEN
      -- Rename the column
      ALTER TABLE acha_products 
      RENAME COLUMN references TO product_references;
      
      RAISE NOTICE '✅ Column renamed: references → product_references';
    ELSE
      RAISE NOTICE '✅ Column "product_references" already exists or table is new';
    END IF;
    
    -- Ensure index exists for performance
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'acha_products' 
      AND indexname = 'idx_acha_products_sub_id'
    ) THEN
      CREATE INDEX idx_acha_products_sub_id ON acha_products(sub_id);
      RAISE NOTICE '✅ Index created: idx_acha_products_sub_id';
    ELSE
      RAISE NOTICE '✅ Index already exists: idx_acha_products_sub_id';
    END IF;
    
  ELSE
    RAISE NOTICE '⚠️ Table "acha_products" does not exist yet. Will be created by backend on startup.';
  END IF;
END $$;

-- Verify the final schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'acha_products'
ORDER BY ordinal_position;

-- Show sample data (if any exists)
SELECT 
  id, 
  sub_id, 
  name, 
  quantity, 
  array_length(product_references, 1) as ref_count,
  array_length(images, 1) as image_count
FROM acha_products 
ORDER BY created_at DESC 
LIMIT 5;

