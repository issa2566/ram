# Migrations Directory - DEPRECATED

## Status: DEPRECATED FOR LOCALHOST DEVELOPMENT

This directory contains old migration files that are **NO LONGER USED** in localhost development.

### Current Database Management

Database schema is now managed via:
- **`db/schema.sql`** - Single source of truth for all table definitions
- **`db/migrate.js`** - Executes schema.sql at server startup

### Migration Files Status

All migration files in this directory are **DEPRECATED** and should not be executed:
- `fix_acha_products_schema.js` - DEPRECATED (table now in schema.sql)
- `create_acha2_products_table.js` - DEPRECATED (table now in schema.sql)
- `create_global_settings_table.js` - DEPRECATED (table now in schema.sql)
- `add_acha2_fields.js` - DEPRECATED (columns now in schema.sql)
- `add_promotion_percentage.js` - DEPRECATED (columns now in schema.sql)
- `add_promotion_price.js` - DEPRECATED (columns now in schema.sql)
- `convert_price_to_numeric.js` - DEPRECATED (column type now in schema.sql)
- `fix_price_column_type.js` - DEPRECATED (column type now in schema.sql)
- `fix_acha_promotion_system.js` - DEPRECATED (columns now in schema.sql)
- `add_quantity_to_dashboard_products.js` - DEPRECATED (column now in schema.sql)
- `fix_missing_acha_columns.js` - DEPRECATED (columns now in schema.sql)

### Why These Files Are Kept

These files are kept for reference only. They document the evolution of the schema but are not executed during server startup.

### For Localhost Development

**DO NOT** run these migrations manually. The server automatically runs `db/migrate.js` which executes `db/schema.sql` to create all tables.

