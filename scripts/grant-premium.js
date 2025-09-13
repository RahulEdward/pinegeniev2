/**
 * Grant Premium Access Script
 * 
 * Usage: node scripts/grant-premium.js <email> [planName] [durationMonths]
 * Example: node scripts/grant-premium.js user@example.com pro 12
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function grantPremiumAccess() {
  try {
    console.log('🎯 Pine Genie Premium Access Granter\n');
    
    // Get user email
    const email = await new Promise((resolve) => {
      rl.question('Enter user email: ', resolve);
    });
    
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email address');
      rl.close();
      return;
    }
    
    // Get plan type
    const planName = await new Promise((resolve) => {
      rl.question('Enter plan name (pro/premium) [default: pro]: ', (answer) => {
        resolve(answer || 'pro');
      });
    });
    
    // Get duration
    const durationInput = await new Promise((resolve) => {
      rl.question('Enter duration in months [default: 12]: ', (answer) => {
        resolve(answer || '12');
      });
    });
    
    const durationMonths = parseInt(durationInput);
    
    if (isNaN(durationMonths) || durationMonths < 1) {
      console.log('❌ Invalid duration');
      rl.close();
      return;
    }
    
    console.log('\n📋 Summary:');
    console.log(`Email: ${email}`);
    console.log(`Plan: ${planName}`);
    console.log(`Duration: ${durationMonths} months`);
    
    const confirm = await new Promise((resolve) => {
      rl.question('\nConfirm? (y/N): ', resolve);
    });
    
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Cancelled');
      rl.close();
      return;
    }
    
    console.log('\n🚀 Granting premium access...');
    
    // Make API call
    const response = await fetch('http://localhost:3000/api/admin/grant-premium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        planName,
        durationMonths
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Premium access granted successfully!');
      console.log(`📧 User: ${result.user.email}`);
      console.log(`📦 Plan: ${result.subscription.planName}`);
      console.log(`📅 Expires: ${new Date(result.subscription.expiresAt).toLocaleDateString()}`);
    } else {
      console.log('❌ Failed to grant premium access:');
      console.log(result.error);
      if (result.details) {
        console.log('Details:', result.details);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Check if running directly
if (require.main === module) {
  grantPremiumAccess();
}

module.exports = { grantPremiumAccess };