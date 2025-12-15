require('dotenv').config();
const originalConsoleLog = console.log;
console.log = () => {};
const { pool } = require('./config/database');
console.log = originalConsoleLog;

async function diagnoseAchaDatabase() {
  let client;
  const report = {
    timestamp: new Date().toISOString(),
    connection: { success: false },
    columnTypes: [],
    sampleData: [],
    invalidValues: [],
    analysis: {}
  };

  try {
    client = await pool.connect();
    report.connection.success = true;
    const dbResult = await client.query('SELECT current_database()');
    report.connection.database = dbResult.rows[0].current_database;

    const columnsResult = await client.query(`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns
      WHERE table_name = 'acha_products'
      ORDER BY ordinal_position
    `);
    report.columnTypes = columnsResult.rows;

    const hasPromoPercent = report.columnTypes.some(c => c.column_name === 'promotion_percentage');
    const hasPromoPrice = report.columnTypes.some(c => c.column_name === 'promotion_price');

    let sampleQuery = `
      SELECT 
        id,
        sub_id,
        price,
        pg_typeof(price) AS price_type
    `;
    if (hasPromoPercent) {
      sampleQuery += `, promotion_percentage, pg_typeof(promotion_percentage) AS promo_type`;
    }
    if (hasPromoPrice) {
      sampleQuery += `, promotion_price, pg_typeof(promotion_price) AS promo_price_type`;
    }
    sampleQuery += ` FROM acha_products LIMIT 20`;

    const sampleResult = await client.query(sampleQuery);
    report.sampleData = sampleResult.rows;

    const invalidResult = await client.query(`
      SELECT id, price
      FROM acha_products
      WHERE price::text !~ '^[0-9\.]+$' OR price IS NULL
    `);
    report.invalidValues = invalidResult.rows;

    const priceColumn = report.columnTypes.find(c => c.column_name === 'price');
    const promoPercentColumn = report.columnTypes.find(c => c.column_name === 'promotion_percentage');
    const promoPriceColumn = report.columnTypes.find(c => c.column_name === 'promotion_price');

    const totalRowsResult = await client.query('SELECT COUNT(*) FROM acha_products');
    const totalRows = totalRowsResult.rows[0].count;

    report.analysis = {
      priceIsText: priceColumn ? priceColumn.data_type === 'text' : null,
      priceIsNumeric: priceColumn ? priceColumn.data_type === 'numeric' : null,
      priceDataType: priceColumn ? priceColumn.data_type : null,
      pricePrecision: priceColumn ? priceColumn.numeric_precision : null,
      priceScale: priceColumn ? priceColumn.numeric_scale : null,
      promotionPercentageIsNumeric: promoPercentColumn ? promoPercentColumn.data_type === 'numeric' : null,
      promotionPercentageDataType: promoPercentColumn ? promoPercentColumn.data_type : null,
      promotionPercentageExists: hasPromoPercent,
      promotionPriceIsNumeric: promoPriceColumn ? promoPriceColumn.data_type === 'numeric' : null,
      promotionPriceDataType: promoPriceColumn ? promoPriceColumn.data_type : null,
      promotionPriceExists: hasPromoPrice,
      hasInvalidPriceValues: report.invalidValues.length > 0,
      invalidPriceCount: report.invalidValues.length,
      totalRows: totalRows,
      migrationsApplied: {
        promotion_percentage: hasPromoPercent,
        promotion_price: hasPromoPrice,
        price_to_numeric: priceColumn ? priceColumn.data_type === 'numeric' : false
      }
    };

    const jsonOutput = JSON.stringify(report, null, 2);
    process.stdout.write(jsonOutput);

  } catch (error) {
    report.connection.error = error.message;
    report.connection.code = error.code;
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    process.exit(0);
  }
}

diagnoseAchaDatabase();

