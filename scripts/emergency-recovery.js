#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚨 EMERGENCY RECOVERY MODE');
console.log('This will help you recover from broken app state');

function showOptions() {
  console.log('\nSelect recovery option:');
  console.log('1. Restore to last working commit');
  console.log('2. Restore to 2 commits ago');
  console.log('3. Restore to 3 commits ago');
  console.log('4. Show recent commits');
  console.log('5. Create emergency backup');
  console.log('6. Exit');
}

function executeRecovery(option) {
  try {
    switch(option) {
      case '1':
        execSync('git reset --hard HEAD~1', { stdio: 'inherit' });
        console.log('✅ Restored to last commit');
        break;
      case '2':
        execSync('git reset --hard HEAD~2', { stdio: 'inherit' });
        console.log('✅ Restored to 2 commits ago');
        break;
      case '3':
        execSync('git reset --hard HEAD~3', { stdio: 'inherit' });
        console.log('✅ Restored to 3 commits ago');
        break;
      case '4':
        execSync('git log --oneline -10', { stdio: 'inherit' });
        break;
      case '5':
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        execSync(`git checkout -b emergency-backup-${timestamp}`, { stdio: 'inherit' });
        execSync('git checkout main', { stdio: 'inherit' });
        console.log(`✅ Emergency backup created: emergency-backup-${timestamp}`);
        break;
      case '6':
        console.log('👋 Exiting recovery mode');
        rl.close();
        return;
      default:
        console.log('❌ Invalid option');
    }
  } catch (error) {
    console.log('❌ Recovery failed:', error.message);
  }
  
  askForOption();
}

function askForOption() {
  showOptions();
  rl.question('\nEnter your choice (1-6): ', (answer) => {
    executeRecovery(answer.trim());
  });
}

// Start the recovery process
askForOption();