'use client';

import { useState, useEffect } from 'react';
import { Clock, MessageSquare, Trash2 } from 'lucide-react';
import { useAgentColors } from '@/agents/pinegenie-agent/hooks/useAgentTheme';

interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
}

interface ChatHistoryProps {
  onSelectSession: (sessionId: string) => void;
}

export default function ChatHistory({ onSelectSession }: ChatHistoryProps) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const colors = useAgentColors();

  // Simulate loading chat history
  useEffect(() => {
    // In a real app, you would fetch this from your API
    const mockSessions: ChatSession[] = [
      {
        id: '1',
        title: 'RSI Strategy Development',
        date: '2 hours ago',
        preview: 'Can you help me create a Pine Script strategy using RSI?'
      },
      {
        id: '2',
        title: 'MACD Crossover Implementation',
        date: 'Yesterday',
        preview: 'I need help implementing a MACD crossover strategy with proper risk management'
      },
      {
        id: '3',
        title: 'Bollinger Bands Strategy',
        date: '3 days ago',
        preview: 'How can I create a strategy that uses Bollinger Bands for entry and exit signals?'
      },
      {
        id: '4',
        title: 'Debugging Pine Script Error',
        date: 'Last week',
        preview: 'I&apos;m getting an error in my Pine Script code: &quot;line 42: Cannot use expression as statement&quot;'
      }
    ];
    
    setTimeout(() => {
      setChatSessions(mockSessions);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    // In a real app, you would call your API to delete the session
    setChatSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  return (
    <div 
      className="chat-history-section"
      style={{ 
        backgroundColor: colors.surface,
        borderRadius: '0.5rem',
        border: `1px solid ${colors.border}`
      }}
    >
      <div 
        className="p-3 border-b"
        style={{ borderColor: colors.border }}
      >
        <h3 
          className="font-medium flex items-center gap-2"
          style={{ color: colors.text.primary }}
        >
          <Clock size={16} />
          <span>Recent Conversations</span>
        </h3>
      </div>
      
      {isLoading ? (
        <div 
          className="p-4 text-center"
          style={{ color: colors.text.secondary }}
        >
          <div className="animate-spin w-5 h-5 border-2 rounded-full mx-auto mb-2"
            style={{ 
              borderColor: `${colors.primary} transparent transparent transparent`
            }}
          ></div>
          <p>Loading chat history...</p>
        </div>
      ) : chatSessions.length === 0 ? (
        <div 
          className="p-4 text-center"
          style={{ color: colors.text.secondary }}
        >
          <MessageSquare className="mx-auto mb-2 opacity-50" />
          <p>No chat history found</p>
        </div>
      ) : (
        <ul>
          {chatSessions.map(session => (
            <li 
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className="p-3 border-b cursor-pointer transition-colors hover:bg-opacity-50"
              style={{ 
                borderColor: colors.border,
                backgroundColor: 'transparent',
                ':hover': { backgroundColor: colors.surfaceHover }
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 
                    className="font-medium text-sm mb-1"
                    style={{ color: colors.text.primary }}
                  >
                    {session.title}
                  </h4>
                  <p 
                    className="text-xs"
                    style={{ color: colors.text.secondary }}
                  >
                    {session.date}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: colors.text.secondary }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p 
                className="text-xs mt-2 truncate"
                style={{ color: colors.text.muted }}
              >
                {session.preview}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}