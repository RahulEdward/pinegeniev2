import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ChatInterface from '@/components/ai/ChatInterface';

export default async function AIChatPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PineGenie AI Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get expert help with TradingView strategies and Pine Script development
          </p>
        </div>

        <div className="max-w-4xl mx-auto h-[calc(100vh-200px)]">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}