-- ============================================
-- Database Schema - Single Source of Truth
-- ============================================
-- This file contains ALL table definitions
-- Run via: node db/migrate.js
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Car brands table
CREATE TABLE IF NOT EXISTS car_brands (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Search options table
CREATE TABLE IF NOT EXISTS search_options (
  id SERIAL PRIMARY KEY,
  field TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
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
);

-- Vehicle models table
CREATE TABLE IF NOT EXISTS vehicle_models (
  id SERIAL PRIMARY KEY,
  marque VARCHAR(255) NOT NULL,
  model VARCHAR(255) NOT NULL,
  description TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicle model parts table
CREATE TABLE IF NOT EXISTS vehicle_model_parts (
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
);

-- Acha products table
CREATE TABLE IF NOT EXISTS acha_products (
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
);

-- Hero content table
CREATE TABLE IF NOT EXISTS hero_content (
  id SERIAL PRIMARY KEY,
  title TEXT DEFAULT 'Un large choix de pièces auto',
  subtitle TEXT DEFAULT 'Découvrez des milliers de références pour toutes les marques populaires. Qualité garantie, service fiable.',
  button_text TEXT DEFAULT 'Découvrir le catalogue',
  button_link TEXT DEFAULT '/catalogue',
  images TEXT[] DEFAULT ARRAY['/k.png', '/k2.jpg', '/k3.png'],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Brand images table
CREATE TABLE IF NOT EXISTS brand_images (
  id SERIAL PRIMARY KEY,
  title TEXT DEFAULT 'NOS MARQUES DISPONIBLES',
  images TEXT[] DEFAULT ARRAY['/pp.jpg'],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard products table
CREATE TABLE IF NOT EXISTS dashboard_products (
  id SERIAL PRIMARY KEY,
  product_id TEXT,
  name TEXT,
  image TEXT,
  reference TEXT,
  price NUMERIC(12,3),
  quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Section content table
CREATE TABLE IF NOT EXISTS section_content (
  id SERIAL PRIMARY KEY,
  section_type TEXT UNIQUE NOT NULL,
  title TEXT,
  content JSONB
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
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
);

-- Subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  family_name TEXT NOT NULL DEFAULT 'Uncategorized',
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT subcategories_name_family_unique UNIQUE(name, family_name)
);

-- Acha2 products table
CREATE TABLE IF NOT EXISTS acha2_products (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  quantity2 INTEGER DEFAULT 0,
  price2 NUMERIC DEFAULT 0,
  description2 TEXT,
  references2 JSONB DEFAULT '[]'::jsonb,
  images2 JSONB DEFAULT '[]'::jsonb,
  modele2 JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Global settings table
CREATE TABLE IF NOT EXISTS global_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Initialize default modele_list if not exists
INSERT INTO global_settings (setting_key, setting_value)
VALUES ('modele_list', '["Kia Picanto", "Kia Rio", "Kia Sportage", "Hyundai i10", "Hyundai i20", "Peugeot 208", "Peugeot 308", "Renault Clio", "Renault Megane", "Volkswagen Golf", "Volkswagen Polo"]'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

