/**
 * END-TO-END TEST: Acha Product Promotion System
 * 
 * Tests:
 * 1. Update product ID 1 with promotion_percentage = 20 and promotion_price = price * 0.8
 * 2. Fetch it again and verify values
 * 3. Print final JSON
 */

require('dotenv').config();
const { pool } = require('./config/database');
const AchaProduct = require('./models/AchaProduct');

async function testPromo() {
  let client;
  const results = {
    before: null,
    updateData: null,
    after: null,
    success: false
  };

  try {
    client = await pool.connect();
    console.log('🧪 END-TO-END TEST: Acha Product Promotion System\n');

    // ==========================================
    // STEP 1: Get product ID 1
    // ==========================================
    console.log('📦 STEP 1: Fetching product ID 1...');
    const productBefore = await AchaProduct.findById(1);
    
    if (!productBefore) {
      throw new Error('Product ID 1 does not exist!');
    }

    results.before = {
      id: productBefore.id,
      sub_id: productBefore.sub_id,
      price: productBefore.price,
      promotion_percentage: productBefore.promotion_percentage,
      promotion_price: productBefore.promotion_price
    };

    console.log('Before update:');
    console.log(JSON.stringify(results.before, null, 2));
    console.log('');

    // ==========================================
    // STEP 2: Calculate promotion values
    // ==========================================
    const basePrice = parseFloat(productBefore.price) || 0;
    const promotionPercentage = 20;
    const promotionPrice = basePrice * 0.8;

    results.updateData = {
      promotion_percentage: promotionPercentage,
      promotion_price: promotionPrice.toFixed(3)
    };

    console.log('📝 STEP 2: Calculating promotion...');
    console.log(`  Base price: ${basePrice}`);
    console.log(`  Promotion: ${promotionPercentage}%`);
    console.log(`  New price: ${promotionPrice.toFixed(3)}`);
    console.log('');

    // ==========================================
    // STEP 3: Update product
    // ==========================================
    console.log('💾 STEP 3: Updating product...');
    console.log('Update data:', JSON.stringify(results.updateData, null, 2));
    
    const updatedProduct = await AchaProduct.update(1, {
      promotion_percentage: promotionPercentage,
      promotion_price: promotionPrice.toFixed(3)
    });

    console.log('✅ Product updated');
    console.log('');

    // ==========================================
    // STEP 4: Fetch again and verify
    // ==========================================
    console.log('🔍 STEP 4: Fetching product again to verify...');
    const productAfter = await AchaProduct.findById(1);

    results.after = {
      id: productAfter.id,
      sub_id: productAfter.sub_id,
      price: productAfter.price,
      promotion_percentage: productAfter.promotion_percentage,
      promotion_price: productAfter.promotion_price
    };

    console.log('After update:');
    console.log(JSON.stringify(results.after, null, 2));
    console.log('');

    // ==========================================
    // STEP 5: Verify values
    // ==========================================
    console.log('✅ STEP 5: Verifying values...');
    
    const promoPercent = parseFloat(results.after.promotion_percentage) || 0;
    const promoPrice = parseFloat(results.after.promotion_price) || null;
    const afterPrice = parseFloat(results.after.price) || 0;

    console.log(`  promotion_percentage: ${promoPercent} (expected: ${promotionPercentage})`);
    console.log(`  promotion_price: ${promoPrice} (expected: ${promotionPrice.toFixed(3)})`);
    console.log(`  price: ${afterPrice}`);

    if (promoPercent !== promotionPercentage) {
      throw new Error(`❌ promotion_percentage mismatch! Expected ${promotionPercentage}, got ${promoPercent}`);
    }

    if (promoPrice === null) {
      throw new Error('❌ promotion_price is null!');
    }

    const expectedPrice = parseFloat(promotionPrice.toFixed(3));
    const actualPrice = parseFloat(promoPrice.toFixed(3));
    if (Math.abs(actualPrice - expectedPrice) > 0.001) {
      throw new Error(`❌ promotion_price mismatch! Expected ${expectedPrice}, got ${actualPrice}`);
    }

    if (promoPrice >= afterPrice) {
      throw new Error(`❌ promotion_price (${promoPrice}) should be less than base price (${afterPrice})!`);
    }

    console.log('✅ All verifications passed!');
    console.log('');

    results.success = true;

    // ==========================================
    // STEP 6: Final JSON output
    // ==========================================
    console.log('📋 FINAL TEST RESULTS:');
    console.log(JSON.stringify(results, null, 2));

    return results;

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
    results.error = error.message;
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  testPromo()
    .then(results => {
      if (results.success) {
        console.log('\n✅ END-TO-END TEST PASSED!');
        process.exit(0);
      } else {
        console.log('\n❌ END-TO-END TEST FAILED!');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('\n❌ TEST ERROR:', err);
      process.exit(1);
    });
}

module.exports = testPromo;

