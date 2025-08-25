const fs = require('fs');
const path = require('path');

// List of all API routes that need dynamic export
const routes = [
  'src/app/api/admin/ai/models/route.ts',
  'src/app/api/admin/ai/models/[id]/route.ts',
  'src/app/api/admin/ai/settings/route.ts',
  'src/app/api/admin/ai/stats/route.ts',
  'src/app/api/admin/analytics/route.ts',
  'src/app/api/admin/api-keys/route.ts',
  'src/app/api/admin/api-keys/[id]/route.ts',
  'src/app/api/admin/auth/login/route.ts',
  'src/app/api/admin/auth/logout/route.ts',
  'src/app/api/admin/auth/me/route.ts',
  'src/app/api/admin/cleanup-free-tokens/route.ts',
  'src/app/api/admin/extend-demo-user/route.ts',
  'src/app/api/admin/metrics/route.ts',
  'src/app/api/admin/models/route.ts',
  'src/app/api/admin/models/[id]/route.ts',
  'src/app/api/admin/security/events/route.ts',
  'src/app/api/admin/subscriptions/metrics/route.ts',
  'src/app/api/admin/subscriptions/plans/route.ts',
  'src/app/api/admin/subscriptions/transactions/route.ts',
  'src/app/api/admin/test/route.ts',
  'src/app/api/admin/tokens/route.ts',
  'src/app/api/admin/tokens/allocate/route.ts',
  'src/app/api/admin/tokens/test/route.ts',
  'src/app/api/admin/tokens/users/route.ts',
  'src/app/api/admin/tokens/users/[userId]/route.ts',
  'src/app/api/admin/update-pricing/route.ts',
  'src/app/api/admin/users/route.ts',
  'src/app/api/admin/users/export/route.ts',
  'src/app/api/ai/chat/route.ts',
  'src/app/api/ai-chat/route.ts',
  'src/app/api/ai-chat/conversations/route.ts',
  'src/app/api/ai-chat/conversations/[conversationId]/messages/route.ts',
  'src/app/api/ai-generate/route.ts',
  'src/app/api/auth/register/route.ts',
  'src/app/api/billing/history/route.ts',
  'src/app/api/billing/invoice/[invoiceId]/route.ts',
  'src/app/api/debug/system/route.ts',
  'src/app/api/debug/user/route.ts',
  'src/app/api/folders/route.ts',
  'src/app/api/folders/[id]/route.ts',
  'src/app/api/organization/bulk-move/route.ts',
  'src/app/api/organization/bulk-tag/route.ts',
  'src/app/api/organization/popular-tags/route.ts',
  'src/app/api/organization/stats/route.ts',
  'src/app/api/payment/verify/route.ts',
  'src/app/api/payment/webhook/route.ts',
  'src/app/api/payment/webhook/payu/route.ts',
  'src/app/api/pine-genie/chat/route.ts',
  'src/app/api/scripts/route.ts',
  'src/app/api/scripts/[id]/route.ts',
  'src/app/api/seed-database/route.ts',
  'src/app/api/shared-strategies/route.ts',
  'src/app/api/strategies/route.ts',
  'src/app/api/strategies/import/route.ts',
  'src/app/api/strategies/search/route.ts',
  'src/app/api/strategies/[id]/route.ts',
  'src/app/api/strategies/[id]/clone/route.ts',
  'src/app/api/strategies/[id]/export/route.ts',
  'src/app/api/strategies/[id]/share/route.ts',
  'src/app/api/strategies/[id]/versions/route.ts',
  'src/app/api/strategies/[id]/versions/[versionId]/restore/route.ts',
  'src/app/api/subscription/check-access/route.ts',
  'src/app/api/subscription/create/route.ts',
  'src/app/api/subscription/plans/route.ts',
  'src/app/api/subscription/strategy-storage/route.ts',
  'src/app/api/templates/route.ts',
  'src/app/api/templates/[id]/route.ts',
  'src/app/api/templates/[id]/access/route.ts',
  'src/app/api/templates/[id]/use/route.ts'
];

function addDynamicExport(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if dynamic export already exists
    if (content.includes('export const dynamic')) {
      console.log(`Already has dynamic export: ${filePath}`);
      return;
    }

    // Find the first import statement
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find where to insert (after imports, before first export)
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('export async function') || 
          lines[i].startsWith('export function') ||
          lines[i].startsWith('export default')) {
        insertIndex = i;
        break;
      }
    }

    // Insert dynamic export
    lines.splice(insertIndex, 0, '', '// Force dynamic rendering', 'export const dynamic = \'force-dynamic\';', '');
    
    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

console.log('🚀 Starting to fix dynamic server usage errors...\n');

routes.forEach(route => {
  addDynamicExport(route);
});

console.log('\n✅ All API routes have been updated with dynamic export!');
console.log('🔄 Run "npm run build" again to verify fixes.');