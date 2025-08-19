const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function fixProTokens() {
  try {
    console.log('🔧 Fixing Pro user token allocation...');
    
    const proUser = await prisma.user.findUnique({
      where: { email: 'pro@pinegenietest.com' }
    });

    if (!proUser) {
      console.log('❌ Pro user not found');
      return;
    }

    // Deactivate existing token allocations
    await prisma.tokenAllocation.updateMany({
      where: {
        userId: proUser.id,
        isActive: true
      },
      data: {
        isActive: false
      }
    });

    // Create new allocation with 500 tokens
    await prisma.tokenAllocation.create({
      data: {
        userId: proUser.id,
        tokenAmount: 500,
        allocatedBy: 'system',
        reason: 'Pro plan - corrected to 500 tokens',
        isActive: true
      }
    });

    console.log('✅ Pro user token allocation fixed!');
    console.log('📧 Email: pro@pinegenietest.com');
    console.log('🔑 Password: ProUser123!');
    console.log('🪙 Tokens: 500');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProTokens();