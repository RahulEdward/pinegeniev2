import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth-options';
import { Metadata } from 'next';
import ChatGPTStyleInterface from '../ai-chat/components/ChatGPTStyleInterface';

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
    <ChatGPTStyleInterface userId={session.user?.id || 'default-user'} />
  );
}