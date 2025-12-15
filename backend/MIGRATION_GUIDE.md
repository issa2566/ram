# Database Migration Guide

## 🚀 Quick Start

### Step 1: Run Main Database Schema
```bash
psql -U postgres -d your_database -f database.sql
```

### Step 2: Run Additional Tables Migration
```bash
psql -U postgres -d your_database -f migrations/add-search-options-and-car-brands.sql
```

### Step 3: Verify Tables Created
```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show:
-- car_brands
-- products
-- search_options
-- users
```

---

## 📋 Database Tables

### 1. **users**
- Stores user accounts
- Fields: id, name, email, password, phone, address, is_admin, created_at, updated_at

### 2. **products**
- Stores product catalog
- Fields: id, name, price, original_price, discount, main_image, all_images, brand, sku, category, loyalty_points, has_preview, has_options, description, created_at, updated_at

### 3. **search_options**
- Stores search filter options
- Fields: id, field, value, created_at, updated_at
- Unique constraint on (field, value)

### 4. **car_brands**
- Stores car brand information
- Fields: id, name, file, models, description, created_at, updated_at
- Unique constraint on name

---

## 🔄 Migration Notes

- All tables have `created_at` and `updated_at` timestamps
- `updated_at` is automatically updated via triggers
- Default data is inserted for search_options and car_brands
- Admin user is created with email: `admin@example.com`, password: `admin123`

---

## ✅ Verification

After migration, verify:
1. All 4 tables exist
2. Default data is inserted
3. Triggers are working (update a record and check updated_at changes)
4. Indexes are created for performance

