import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { Metadata } from 'next';
import ClaudeStyleInterface from './components/ClaudeStyleInterface';
import SubscriptionGate from '@/components/SubscriptionGate';

export const metadata: Metadata = {
  title: 'Pine Genie AI',
  description: 'Your TradingView strategy assistant',
};

export default async function PineGenieAIPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <SubscriptionGate feature="ai_chat">
      <ClaudeStyleInterface 
        userId={session.user?.id || 'default-user'}
        initialConversation={null}
      />
    </SubscriptionGate>
  );
}