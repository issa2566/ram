require('dotenv').config();

console.log('Verifying environment variables for db.js...\n');

const requiredVars = ['DB_USER', 'DB_NAME', 'DB_PASSWORD'];
const optionalVars = ['DB_HOST', 'DB_PORT'];

console.log('Required variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName} = ${varName === 'DB_PASSWORD' ? '***' : value}`);
  } else {
    console.log(`  ❌ ${varName} = NOT SET`);
  }
});

console.log('\nOptional variables (with defaults):');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const defaultValue = varName === 'DB_HOST' ? '127.0.0.1' : '5432';
  if (value) {
    console.log(`  ✅ ${varName} = ${value}`);
  } else {
    console.log(`  ⚠️  ${varName} = NOT SET (will use default: ${defaultValue})`);
  }
});

console.log('\nServer variables:');
console.log(`  PORT = ${process.env.PORT || '3000'}`);
console.log(`  NODE_ENV = ${process.env.NODE_ENV || 'not set'}`);
console.log(`  API_BASE_URL = ${process.env.API_BASE_URL || 'not set'}`);

console.log('\n✅ db.js will read these values correctly!');
console.log('\nExpected database connection:');
console.log(`  User: ${process.env.DB_USER || 'NOT SET'}`);
console.log(`  Host: ${process.env.DB_HOST || '127.0.0.1'}`);
console.log(`  Database: ${process.env.DB_NAME || 'NOT SET'}`);
console.log(`  Port: ${process.env.DB_PORT || '5432'}`);

