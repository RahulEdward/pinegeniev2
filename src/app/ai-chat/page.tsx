import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { Metadata } from 'next';
import ChatGPTStyleInterface from './components/ChatGPTStyleInterface';
import { AIAccessGuard } from './components/AIAccessGuard';

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
    <AIAccessGuard>
      <ChatGPTStyleInterface 
        userId={session.user?.id || 'default-user'}
      />
    </AIAccessGuard>
  );
}