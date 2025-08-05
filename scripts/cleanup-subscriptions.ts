import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupSubscriptions() {
  try {
    console.log('🧹 Cleaning up subscriptions...');
    
    // Delete all existing subscriptions
    const deleteResult = await prisma.subscription.deleteMany({});
    console.log(`Deleted ${deleteResult.count} subscriptions`);
    
    console.log('✅ Cleanup complete');
    
  } catch (error) {
    console.error('❌ Error cleaning up subscriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupSubscriptions();