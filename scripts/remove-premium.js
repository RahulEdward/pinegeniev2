const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removePremium() {
  try {
    console.log('🔍 Removing all premium subscriptions...');
    
    // Delete all active subscriptions
    const result = await prisma.subscription.deleteMany({
      where: {
        status: 'ACTIVE'
      }
    });
    
    console.log(`✅ Removed ${result.count} premium subscriptions`);
    
    // Update all users to free plan
    const userUpdate = await prisma.user.updateMany({
      data: {
        planName: 'free'
      }
    });
    
    console.log(`✅ Updated ${userUpdate.count} users to free plan`);
    
    console.log('🎉 All users are now on free plan');
    
  } catch (error) {
    console.error('❌ Error removing premium:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removePremium();