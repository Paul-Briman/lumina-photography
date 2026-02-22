#!/usr/bin/env node

console.log('='.repeat(50));
console.log('🚀 LUMINA STARTUP WRAPPER');
console.log('='.repeat(50));
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Arch:', process.arch);
console.log('Current directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('');

// Check if dist/index.cjs exists
const fs = require('fs');
const path = require('path');

const appPath = path.join(process.cwd(), 'dist/index.cjs');
console.log('Looking for app at:', appPath);

if (!fs.existsSync(appPath)) {
  console.error('❌ ERROR: dist/index.cjs not found!');
  console.log('Files in dist:');
  try {
    const files = fs.readdirSync(path.join(process.cwd(), 'dist'));
    files.forEach(f => console.log('  -', f));
  } catch (e) {
    console.error('Cannot read dist directory:', e.message);
  }
  process.exit(1);
}

console.log('✅ App file found!');
console.log('File size:', fs.statSync(appPath).size, 'bytes');
console.log('');

// Try to load the app
console.log('Attempting to load app...');
try {
  require(appPath);
  console.log('✅ App loaded successfully!');
} catch (err) {
  console.error('❌ ERROR loading app:');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
  process.exit(1);
}