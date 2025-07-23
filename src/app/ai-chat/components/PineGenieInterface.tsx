'use client';

import { useState, useRef, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { ThemeConsistencyProvider, useThemeConsistency } from '@/agents/pinegenie-agent/components/ThemeConsistencyProvider';
import { ChatSidebar } from './ChatSidebar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
  messages: Message[];
}

function PineGenieInterfaceContent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { colors, isDark, toggleTheme } = useThemeConsistency();

  // Initialize empty chat history - no auto-creation

  const handleNewChat = () => {
    const newChatId = Date.now().toString();
    const newChat: ChatHistory = {
      id: newChatId,
      title: 'New Chat',
      timestamp: new Date(),
      preview: '',
      messages: []
    };
    setChatHistory(prev => [newChat, ...prev]);
    setCurrentChatId(newChatId);
    setMessages([]);
    setShowWelcome(true);
    setInput('');
  };

  const handleSelectChat = (chatId: string) => {
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setShowWelcome(chat.messages.length === 0);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      const remaining = chatHistory.filter(c => c.id !== chatId);
      if (remaining.length > 0) {
        handleSelectChat(remaining[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    setChatHistory(prev =>
      prev.map(chat =>
        chat.id === chatId
          ? { ...chat, title: newTitle }
          : chat
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setShowWelcome(false);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand you\'re looking to build Pine Script strategies. I can help you with strategy development, technical indicators, and code optimization.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);

    setInput('');
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: colors.bg.primary }}>
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        chatHistory={chatHistory}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        currentChatId={currentChatId}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {showWelcome ? (
          <div
            className="min-h-screen flex flex-col transition-colors duration-300"
            style={{
              backgroundColor: colors.bg.primary,
              backgroundImage: isDark
                ? `radial-gradient(circle, ${colors.text.muted}20 1px, transparent 1px)`
                : `radial-gradient(circle, ${colors.text.muted}30 1px, transparent 1px)`,
              backgroundSize: '20px 20px'
            }}
          >
            {/* Theme Toggle Button */}
            <div className="absolute top-6 right-6 z-10">
              <button
                onClick={toggleTheme}
                className="p-3 rounded-lg border transition-colors"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                style={{
                  borderColor: colors.border.primary,
                  backgroundColor: colors.bg.secondary,
                  color: colors.text.secondary
                }}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>

            {/* Welcome Content */}
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-4xl w-full text-center">
                <div className="relative mb-6">
                  <div className="relative w-12 h-12 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                  Pine Genie AI
                </h1>
                <p className="text-lg" style={{ color: colors.text.secondary }}>
                  Pine Script v6 Assistant • Online
                </p>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask a question or describe a task..."
                      className="w-full rounded-2xl py-4 px-6 pr-16 focus:outline-none focus:ring-2 resize-none text-sm"
                      style={{
                        backgroundColor: colors.bg.primary,
                        border: `1px solid ${colors.border.primary}`,
                        color: colors.text.primary
                      }}
                      rows={2}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 disabled:opacity-50 transition-colors p-2 rounded-lg"
                      style={{ color: colors.accent.blue }}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.bg.primary }}>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-3xl rounded-2xl p-4 ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}
                      style={{
                        backgroundColor: message.role === 'user' ? colors.accent.blue : colors.bg.secondary,
                        color: message.role === 'user' ? '#ffffff' : colors.text.primary,
                        border: message.role === 'assistant' ? `1px solid ${colors.border.primary}` : 'none'
                      }}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                      <div className="text-xs mt-3 opacity-60">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg p-4" style={{ backgroundColor: colors.bg.secondary }}>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: colors.accent.blue }}></div>
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: colors.accent.blue, animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: colors.accent.blue, animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Continue the conversation..."
                      className="w-full rounded-2xl py-4 px-6 pr-16 focus:outline-none focus:ring-1 resize-none text-sm"
                      style={{
                        backgroundColor: colors.bg.primary,
                        border: `1px solid ${colors.border.primary}`,
                        color: colors.text.primary
                      }}
                      rows={1}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 disabled:opacity-50 transition-colors p-2 rounded-lg"
                      style={{ color: colors.accent.blue }}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m22 2-7 20-4-9-9-4Z" />
                        <path d="M22 2 11 13" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PineGenieInterface() {
  return (
    <ThemeConsistencyProvider>
      <PineGenieInterfaceContent />
    </ThemeConsistencyProvider>
  );
}