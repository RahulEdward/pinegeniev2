import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Metadata } from 'next';
import ClaudeStyleInterface from '../components/ClaudeStyleInterface';

export const metadata: Metadata = {
  title: 'Claude-style Interface Test - Pine Genie AI',
  description: 'Testing the new Claude-style interface for Pine Genie AI',
};

export default async function ClaudeTestPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <ClaudeStyleInterface 
      userId={session.user?.email || 'test-user'} 
      initialConversation={null}
    />
  );
}