#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Campaign Platform...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

try {
  // Install frontend dependencies
  console.log('📦 Installing frontend dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Install backend dependencies
  console.log('\n📦 Installing backend dependencies...');
  process.chdir('server');
  execSync('npm install', { stdio: 'inherit' });

  // Copy environment file if it doesn't exist
  if (!fs.existsSync('.env')) {
    console.log('\n📝 Creating environment file...');
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ Created .env file - please update with your database credentials');
  }

  process.chdir('..');

  console.log('\n✅ Setup complete!\n');
  console.log('Next steps:');
  console.log('1. Set up PostgreSQL database');
  console.log('2. Update server/.env with your database credentials');
  console.log('3. Run database migrations: cd server && npm run db:migrate');
  console.log('4. Seed database (optional): cd server && npm run db:seed');
  console.log('5. Start backend: cd server && npm run dev');
  console.log('6. Start frontend: npm run dev');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}