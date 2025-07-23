/**
 * Original Chat Demo Page
 * 
 * Shows the original chat interface for comparison
 */

import EnhancedChatInterface from '@/components/ai/EnhancedChatInterface';

export const metadata = {
  title: 'Original Chat Interface',
  description: 'Original chat interface for comparison',
};

export default function OriginalChatDemoPage() {
  return (
    <div className="p-6 h-screen bg-background">
      <EnhancedChatInterface />
    </div>
  );
}