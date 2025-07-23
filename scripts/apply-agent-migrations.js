/**
 * Apply Agent Migrations
 * 
 * This script applies the database migrations for the agent conversation schema.
 */
const { execSync } = require('child_process');
const path = require('path');

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

/**
 * Logs a message with color
 * 
 * @param {string} message - The message to log
 * @param {string} color - The color to use
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Runs a command and returns the output
 * 
 * @param {string} command - The command to run
 * @returns {string} The command output
 */
function runCommand(command) {
  try {
    log(`Running: ${command}`, colors.blue);
    const output = execSync(command, { encoding: 'utf8' });
    return output;
  } catch (error) {
    log(`Error running command: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    log('Starting agent migrations...', colors.green);
    
    // Apply migrations
    log('Applying database migrations...', colors.yellow);
    const migrationOutput = runCommand('npx prisma migrate deploy');
    log(migrationOutput);
    
    // Generate Prisma client
    log('Generating Prisma client...', colors.yellow);
    const generateOutput = runCommand('npx prisma generate');
    log(generateOutput);
    
    log('Agent migrations completed successfully!', colors.green);
  } catch (error) {
    log(`Migration failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run the main function
main();