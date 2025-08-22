import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { Metadata } from 'next';
import SimpleAIChat from './components/SimpleAIChat';

export const metadata: Metadata = {
  title: 'Pine Genie AI - Simple Chat',
  description: 'Simple AI chat for PineScript generation',
};

export default async function SimpleAIChatPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <SimpleAIChat userId={session.user?.id || 'default-user'} />
  );
}