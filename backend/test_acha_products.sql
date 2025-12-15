-- ==========================================
-- ACHA PRODUCTS TEST QUERIES
-- Test all special characters and functionality
-- FIX APPLIED FROM DIAGNOSTIC DOCUMENT
-- ==========================================

-- Test 1: Insert product with apostrophe
INSERT INTO acha_products (sub_id, name, description, price, images, quantity, product_references)
VALUES (
  'Disque d''embrayage',
  'Disque d''embrayage',
  'Pièce de qualité supérieure',
  '125.500',
  ARRAY[]::TEXT[],
  10,
  ARRAY['REF-123', 'REF-456']::TEXT[]
)
ON CONFLICT (sub_id) DO UPDATE SET 
  updated_at = CURRENT_TIMESTAMP,
  quantity = EXCLUDED.quantity
RETURNING id, sub_id, name, quantity, product_references;

-- Test 2: Insert product with accents
INSERT INTO acha_products (sub_id, name, description, price, images, quantity, product_references)
VALUES (
  'Filtre à air',
  'Filtre à air',
  'Filtration optimale',
  '45.000',
  ARRAY[]::TEXT[],
  25,
  ARRAY['AIR-001', 'AIR-002']::TEXT[]
)
ON CONFLICT (sub_id) DO UPDATE SET 
  updated_at = CURRENT_TIMESTAMP,
  quantity = EXCLUDED.quantity
RETURNING id, sub_id, name, quantity, product_references;

-- Test 3: Insert product with multiple special characters
INSERT INTO acha_products (sub_id, name, description, price, images, quantity, product_references)
VALUES (
  'Kit d''embrayage complet',
  'Kit d''embrayage complet',
  'Kit complet pour système d''embrayage',
  '320.000',
  ARRAY[]::TEXT[],
  5,
  ARRAY['KIT-001', 'KIT-002', 'KIT-003']::TEXT[]
)
ON CONFLICT (sub_id) DO UPDATE SET 
  updated_at = CURRENT_TIMESTAMP,
  quantity = EXCLUDED.quantity
RETURNING id, sub_id, name, quantity, product_references;

-- Test 4: Query with apostrophe
SELECT 
  id, 
  sub_id, 
  name, 
  price, 
  quantity, 
  product_references,
  array_length(product_references, 1) as ref_count
FROM acha_products 
WHERE sub_id = 'Disque d''embrayage';

-- Test 5: Query with accent
SELECT 
  id, 
  sub_id, 
  name, 
  price, 
  quantity, 
  product_references,
  array_length(product_references, 1) as ref_count
FROM acha_products 
WHERE sub_id = 'Filtre à air';

-- Test 6: Update product_references
UPDATE acha_products 
SET product_references = ARRAY['NEW-REF-1', 'NEW-REF-2', 'NEW-REF-3']::TEXT[]
WHERE sub_id = 'Disque d''embrayage'
RETURNING id, sub_id, product_references;

-- Test 7: Update quantity
UPDATE acha_products 
SET quantity = quantity - 1, updated_at = CURRENT_TIMESTAMP
WHERE sub_id = 'Filtre à air'
RETURNING id, sub_id, quantity;

-- Test 8: List all products
SELECT 
  id, 
  sub_id, 
  name, 
  price,
  quantity, 
  array_length(product_references, 1) as ref_count,
  array_length(images, 1) as image_count,
  created_at,
  updated_at
FROM acha_products 
ORDER BY created_at DESC;

-- Test 9: Verify table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'acha_products'
ORDER BY ordinal_position;

-- Test 10: Verify indexes
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'acha_products';

