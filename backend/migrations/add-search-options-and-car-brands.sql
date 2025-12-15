-- Migration: Add search_options and car_brands tables
-- Run this after the main database.sql

-- Create search_options table
CREATE TABLE IF NOT EXISTS search_options (
  id SERIAL PRIMARY KEY,
  field VARCHAR(50) NOT NULL,
  value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(field, value)
);

-- Create index on field for faster lookups
CREATE INDEX IF NOT EXISTS idx_search_options_field ON search_options(field);

-- Create trigger to update updated_at for search_options
DROP TRIGGER IF EXISTS update_search_options_updated_at ON search_options;
CREATE TRIGGER update_search_options_updated_at
    BEFORE UPDATE ON search_options
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create car_brands table
CREATE TABLE IF NOT EXISTS car_brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  file VARCHAR(500),
  models TEXT[],
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_car_brands_name ON car_brands(name);

-- Create trigger to update updated_at for car_brands
DROP TRIGGER IF EXISTS update_car_brands_updated_at ON car_brands;
CREATE TRIGGER update_car_brands_updated_at
    BEFORE UPDATE ON car_brands
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default search options
INSERT INTO search_options (field, value) VALUES
  ('marque', 'Toyota'),
  ('marque', 'Honda'),
  ('marque', 'BMW'),
  ('marque', 'Mercedes'),
  ('marque', 'Audi'),
  ('marque', 'Nissan'),
  ('marque', 'Hyundai'),
  ('marque', 'Kia'),
  ('marque', 'Ford'),
  ('marque', 'Chevrolet'),
  ('modele', 'Camry'),
  ('modele', 'Civic'),
  ('modele', 'X3'),
  ('modele', 'C-Class'),
  ('modele', 'A4'),
  ('modele', 'Altima'),
  ('modele', 'Elantra'),
  ('modele', 'Sportage'),
  ('modele', 'Focus'),
  ('modele', 'Cruze'),
  ('annee', '2020'),
  ('annee', '2021'),
  ('annee', '2022'),
  ('annee', '2023'),
  ('annee', '2024'),
  ('annee', '2019'),
  ('annee', '2018'),
  ('annee', '2017'),
  ('annee', '2016'),
  ('annee', '2015')
ON CONFLICT (field, value) DO NOTHING;

-- Insert default car brands
INSERT INTO car_brands (name, file, models) VALUES
  ('Toyota', '/cars.logo/Toyota.svg', ARRAY['Camry', 'Corolla', 'RAV4']),
  ('Honda', '/cars.logo/Honda.svg', ARRAY['Civic', 'Accord', 'CR-V']),
  ('BMW', '/cars.logo/BMW.svg', ARRAY['X3', 'X5', '3 Series']),
  ('Mercedes', '/cars.logo/Mercedes.svg', ARRAY['C-Class', 'E-Class', 'GLE']),
  ('Audi', '/cars.logo/Audi.svg', ARRAY['A4', 'A6', 'Q5']),
  ('Nissan', '/cars.logo/Nissan.svg', ARRAY['Altima', 'Sentra', 'Rogue']),
  ('Hyundai', '/cars.logo/Hyundai.svg', ARRAY['Elantra', 'Sonata', 'Tucson']),
  ('Kia', '/cars.logo/Kia.svg', ARRAY['Sportage', 'Sorento', 'Optima']),
  ('Ford', '/cars.logo/Ford.svg', ARRAY['Focus', 'Fusion', 'Explorer']),
  ('Chevrolet', '/cars.logo/Chevrolet.svg', ARRAY['Cruze', 'Malibu', 'Equinox'])
ON CONFLICT (name) DO NOTHING;

-- Verify table creation
SELECT 'Search options table created successfully' AS status;
SELECT COUNT(*) AS search_options_count FROM search_options;
SELECT 'Car brands table created successfully' AS status;
SELECT COUNT(*) AS car_brands_count FROM car_brands;

