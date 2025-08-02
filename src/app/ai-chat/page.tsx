import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Metadata } from 'next';
import ClaudeStyleInterface from './components/ClaudeStyleInterface';

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
    <ClaudeStyleInterface 
      userId={session.user?.id || 'default-user'}
      initialConversation={null}
    />
  );
}