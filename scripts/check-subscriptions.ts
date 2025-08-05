import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSubscriptions() {
  try {
    console.log('🔍 Checking current subscriptions...');
    
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: { select: { email: true, name: true } },
        plan: { select: { name: true, displayName: true } }
      }
    });
    
    console.log(`Found ${subscriptions.length} subscriptions:`);
    
    subscriptions.forEach((sub, index) => {
      console.log(`${index + 1}. User: ${sub.user.email} | Plan: ${sub.plan.displayName} | Status: ${sub.status} | ID: ${sub.id}`);
    });
    
    // Check for duplicate active subscriptions
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'ACTIVE' || sub.status === 'TRIALING');
    const userCounts = activeSubscriptions.reduce((acc, sub) => {
      acc[sub.userId] = (acc[sub.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const duplicateUsers = Object.entries(userCounts).filter(([_, count]) => count > 1);
    
    if (duplicateUsers.length > 0) {
      console.log('\n⚠️  Users with multiple active subscriptions:');
      duplicateUsers.forEach(([userId, count]) => {
        const userSubs = activeSubscriptions.filter(sub => sub.userId === userId);
        console.log(`User ID: ${userId} has ${count} active subscriptions:`);
        userSubs.forEach(sub => {
          console.log(`  - ${sub.plan.displayName} (${sub.status}) - ID: ${sub.id}`);
        });
      });
    } else {
      console.log('\n✅ No duplicate active subscriptions found');
    }
    
  } catch (error) {
    console.error('❌ Error checking subscriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscriptions();