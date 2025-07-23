/**
 * Agent Chat Demo Page
 * 
 * Demonstrates the enhanced Kiro-style chat interface
 */

import ChatDemo from '@/agents/pinegenie-agent/components/ChatDemo';

export const metadata = {
  title: 'Kiro-Style Chat Interface Demo',
  description: 'Enhanced chat interface with Kiro-style design elements',
};

export default function AgentChatDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <ChatDemo />
    </div>
  );
}