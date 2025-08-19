#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 Starting Safe Development Mode...');

// 1. Create backup before any changes
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupBranch = `backup-${timestamp}`;
  
  try {
    execSync(`git checkout -b ${backupBranch}`, { stdio: 'inherit' });
    execSync(`git checkout main`, { stdio: 'inherit' });
    console.log(`✅ Backup created: ${backupBranch}`);
  } catch (error) {
    console.log('⚠️  Could not create backup branch');
  }
}

// 2. Check if working directory is clean
function checkWorkingDirectory() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('⚠️  Working directory has uncommitted changes');
      console.log('💡 Commit your changes first: git add . && git commit -m "WIP: save progress"');
      return false;
    }
    return true;
  } catch (error) {
    console.log('⚠️  Not a git repository');
    return true;
  }
}

// 3. Validate critical files
function validateCriticalFiles() {
  const criticalFiles = [
    'src/app/page.tsx',
    'src/app/layout.tsx',
    'package.json'
  ];
  
  for (const file of criticalFiles) {
    if (!fs.existsSync(file)) {
      console.log(`❌ Critical file missing: ${file}`);
      return false;
    }
  }
  
  console.log('✅ All critical files present');
  return true;
}

// 4. Run development server with safety checks
function runDevServer() {
  console.log('🚀 Starting development server...');
  try {
    execSync('npm run dev', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Development server failed to start');
    process.exit(1);
  }
}

// Main execution
if (checkWorkingDirectory() && validateCriticalFiles()) {
  createBackup();
  runDevServer();
} else {
  console.log('❌ Safety checks failed. Please fix issues before continuing.');
  process.exit(1);
}