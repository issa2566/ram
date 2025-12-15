/**
 * ACHA PRODUCTS API AUTO-TEST
 * ==========================================
 * Automatically tests the API with special characters
 * NO USER INTERACTION REQUIRED
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';

// Test cases with special characters
const TEST_CASES = [
  { name: "Disque d'embrayage", encoded: "Disque%20d'embrayage" },
  { name: "Kit d'embrayage", encoded: "Kit%20d'embrayage" },
  { name: "Mécanisme d'embrayage", encoded: "Mécanisme%20d'embrayage" },
  { name: "Filtre à air", encoded: "Filtre%20à%20air" },
  { name: "Équipement électrique", encoded: "Équipement%20électrique" }
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            parseError: true
          });
        }
      });
    }).on('error', reject);
  });
}

async function testAPI() {
  console.log('🔥 [TEST] Starting API auto-test...');
  console.log('🔥 [TEST] ========================================\n');
  
  let allPassed = true;
  
  for (const testCase of TEST_CASES) {
    console.log(`🟦 [TEST] Testing: ${testCase.name}`);
    const url = `${API_BASE}/api/acha-products/sub/${encodeURIComponent(testCase.name)}`;
    console.log(`🟦 [TEST] URL: ${url}`);
    
    try {
      const response = await makeRequest(url);
      
      if (response.status === 200) {
        if (response.data.success && response.data.data) {
          console.log(`🟩 [TEST] ✅ SUCCESS - Product returned`);
          console.log(`🟩 [TEST]    sub_id: ${response.data.data.sub_id}`);
          console.log(`🟩 [TEST]    name: ${response.data.data.name}`);
          console.log(`🟩 [TEST]    has product_references: ${response.data.data.product_references !== undefined}`);
        } else {
          console.log(`🟥 [TEST] ❌ FAIL - Response missing data`);
          allPassed = false;
        }
      } else {
        console.log(`🟥 [TEST] ❌ FAIL - Status ${response.status}`);
        console.log(`🟥 [TEST]    Response: ${JSON.stringify(response.data).substring(0, 200)}`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`🟥 [TEST] ❌ ERROR - ${error.message}`);
      allPassed = false;
    }
    
    console.log('');
  }
  
  console.log('🔥 [TEST] ========================================');
  if (allPassed) {
    console.log('🟩 [TEST] ✅ ALL TESTS PASSED');
    console.log('🟩 [TEST] API is working correctly with special characters');
  } else {
    console.log('🟥 [TEST] ❌ SOME TESTS FAILED');
    console.log('🟥 [TEST] Check backend logs for errors');
  }
  console.log('🔥 [TEST] ========================================\n');
  
  return allPassed;
}

// Run tests
testAPI()
  .then(passed => {
    process.exit(passed ? 0 : 1);
  })
  .catch(err => {
    console.error('🟥 [TEST] Fatal error:', err);
    process.exit(1);
  });

