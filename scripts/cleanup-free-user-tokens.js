/**
 * Cleanup Free User Tokens Script
 * 
 * This script removes token allocations from users who are on the free plan.
 * Free users should have 0 extra credits.
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupFreeUserTokens() {
  console.log('🧹 Starting cleanup of free user token allocations...');

  try {
    // Find all users who are on free plan or have no subscription
    const freeUsers = await prisma.user.findMany({
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          include: {
            plan: true
          }
        }
      }
    });

    const freeUserIds = freeUsers
      .filter(user => {
        // User has no active subscription or is on free plan
        return user.subscriptions.length === 0 || 
               user.subscriptions.some(sub => sub.plan.name === 'free');
      })
      .map(user => user.id);

    console.log(`📊 Found ${freeUserIds.length} free users`);

    if (freeUserIds.length === 0) {
      console.log('✅ No free users found with token allocations to clean up');
      return;
    }

    // Find token allocations for free users
    const allocationsToRemove = await prisma.tokenAllocation.findMany({
      where: {
        userId: {
          in: freeUserIds
        }
      }
    });

    console.log(`🔍 Found ${allocationsToRemove.length} token allocations for free users`);

    if (allocationsToRemove.length === 0) {
      console.log('✅ No token allocations found for free users');
      return;
    }

    // Deactivate token allocations for free users (don't delete for audit trail)
    const result = await prisma.tokenAllocation.updateMany({
      where: {
        userId: {
          in: freeUserIds
        }
      },
      data: {
        isActive: false,
        reason: 'Deactivated - Free plan user'
      }
    });

    console.log(`✅ Deactivated ${result.count} token allocations for free users`);

    // Show summary of affected users
    for (const userId of freeUserIds) {
      const user = freeUsers.find(u => u.id === userId);
      const userAllocations = allocationsToRemove.filter(a => a.userId === userId);
      const totalTokens = userAllocations.reduce((sum, a) => sum + a.tokenAmount, 0);
      
      if (totalTokens > 0) {
        console.log(`  - ${user.name || user.email}: ${totalTokens} tokens deactivated`);
      }
    }

    console.log('🎉 Free user token cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup if this file is executed directly
if (require.main === module) {
  cleanupFreeUserTokens()
    .then(() => {
      console.log('✅ Cleanup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { cleanupFreeUserTokens };