'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

interface ChatGPTStyleInterfaceProps {
    userId: string;
}

export default function ChatGPTStyleInterface({ userId }: ChatGPTStyleInterfaceProps) {
    const router = useRouter();
    const { isDarkMode, toggleTheme } = useTheme();
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-4');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const models = [
        { id: 'gpt-4', name: 'GPT-4', description: '✅ Advanced Pine Script Generation' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '✅ Fast Pine Script Generation' },
        { id: 'pine-genie', name: 'PineGenie', description: 'Local Pine Script Templates' }
    ];

    // Get current session
    const currentSession = chatSessions.find(session => session.id === currentSessionId);
    const currentMessages = currentSession?.messages || [];

    // Load chat sessions from localStorage
    useEffect(() => {
        const savedSessions = localStorage.getItem(`chat-sessions-${userId}`);
        if (savedSessions) {
            try {
                const parsed = JSON.parse(savedSessions);
                const sessionsWithDates = parsed.map((session: any) => ({
                    ...session,
                    createdAt: new Date(session.createdAt),
                    updatedAt: new Date(session.updatedAt),
                    messages: session.messages.map((msg: any) => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp)
                    }))
                }));
                setChatSessions(sessionsWithDates);

                // Set current session to the most recent one
                if (sessionsWithDates.length > 0) {
                    setCurrentSessionId(sessionsWithDates[0].id);
                }
            } catch (error) {
                console.error('Error loading saved sessions:', error);
            }
        }
    }, [userId]);

    // Save chat sessions to localStorage
    useEffect(() => {
        if (chatSessions.length > 0) {
            localStorage.setItem(`chat-sessions-${userId}`, JSON.stringify(chatSessions));
        }
    }, [chatSessions, userId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentMessages]);

    // Create new chat session
    const createNewChat = () => {
        const newSession: ChatSession = {
            id: Date.now().toString(),
            title: 'New Chat',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        setChatSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
    };

    // Delete chat session
    const deleteChat = (sessionId: string) => {
        if (window.confirm('Are you sure you want to delete this chat?')) {
            setChatSessions(prev => prev.filter(session => session.id !== sessionId));

            if (currentSessionId === sessionId) {
                const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
                setCurrentSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
            }
        }
    };

    // Clear all chats
    const clearAllChats = () => {
        if (window.confirm('Are you sure you want to delete all chats? This action cannot be undone.')) {
            setChatSessions([]);
            setCurrentSessionId(null);
            localStorage.removeItem(`chat-sessions-${userId}`);
        }
    };

    // Update session title based on first message
    const updateSessionTitle = (sessionId: string, firstMessage: string) => {
        const title = firstMessage.length > 30
            ? firstMessage.substring(0, 30) + '...'
            : firstMessage;

        setChatSessions(prev => prev.map(session =>
            session.id === sessionId
                ? { ...session, title, updatedAt: new Date() }
                : session
        ));
    };

    // Extract Pine Script code from response
    const extractPineScriptCode = (text: string): string => {
        const codeBlockRegex = /```(?:pinescript|pine)?\n?([\s\S]*?)```/gi;
        const matches = text.match(codeBlockRegex);

        if (matches && matches.length > 0) {
            return matches[0].replace(/```(?:pinescript|pine)?\n?/gi, '').replace(/```$/g, '').trim();
        }

        return '';
    };

    // Copy to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            const toast = document.createElement('div');
            toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${isDarkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
                }`;
            toast.textContent = '✅ Code copied to clipboard!';
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-10px)';
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 2000);
        }).catch(() => {
            alert('Failed to copy code to clipboard');
        });
    };

    // Send message
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        // Create new session if none exists
        let sessionId = currentSessionId;
        if (!sessionId) {
            const newSession: ChatSession = {
                id: Date.now().toString(),
                title: inputValue.length > 30 ? inputValue.substring(0, 30) + '...' : inputValue,
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            setChatSessions(prev => [newSession, ...prev]);
            sessionId = newSession.id;
            setCurrentSessionId(sessionId);
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            content: inputValue.trim(),
            role: 'user',
            timestamp: new Date()
        };

        // Add user message to current session
        setChatSessions(prev => prev.map(session =>
            session.id === sessionId
                ? {
                    ...session,
                    messages: [...session.messages, userMessage],
                    updatedAt: new Date()
                }
                : session
        ));

        // Update session title if it's the first message
        const currentSession = chatSessions.find(s => s.id === sessionId);
        if (!currentSession || currentSession.messages.length === 0) {
            updateSessionTitle(sessionId, inputValue.trim());
        }

        setInputValue('');
        setIsLoading(true);

        try {
            console.log(`🚀 Sending to ${selectedModel}:`, inputValue.trim());

            const response = await fetch('/api/ai-generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [
                        ...currentMessages.map(msg => ({
                            role: msg.role,
                            content: msg.content
                        })),
                        {
                            role: 'user',
                            content: inputValue.trim()
                        }
                    ],
                    modelId: selectedModel
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log(`✅ Response from ${data.model}:`, data.content.substring(0, 100) + '...');

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.content,
                role: 'assistant',
                timestamp: new Date()
            };

            // Add AI response to current session
            setChatSessions(prev => prev.map(session =>
                session.id === sessionId
                    ? {
                        ...session,
                        messages: [...session.messages, userMessage, aiMessage],
                        updatedAt: new Date()
                    }
                    : session
            ));

        } catch (error) {
            console.error('❌ Error:', error);

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
                role: 'assistant',
                timestamp: new Date()
            };

            setChatSessions(prev => prev.map(session =>
                session.id === sessionId
                    ? {
                        ...session,
                        messages: [...session.messages, userMessage, errorMessage],
                        updatedAt: new Date()
                    }
                    : session
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className={`h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}>
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                }`}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={createNewChat}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${isDarkMode
                                    ? 'border-gray-600 hover:bg-gray-800 text-gray-200'
                                    : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                                }`}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            New Chat
                        </button>
                    </div>

                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {chatSessions.length === 0 ? (
                            <div className={`text-center py-8 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                No chat history yet
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {chatSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${currentSessionId === session.id
                                                ? isDarkMode
                                                    ? 'bg-gray-800 text-white'
                                                    : 'bg-blue-50 text-blue-900'
                                                : isDarkMode
                                                    ? 'hover:bg-gray-800 text-gray-300'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                        onClick={() => setCurrentSessionId(session.id)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                        <span className="flex-1 text-sm truncate">{session.title}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteChat(session.id);
                                            }}
                                            className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                                                }`}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={clearAllChats}
                                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${isDarkMode
                                        ? 'text-gray-400 hover:text-red-400 hover:bg-gray-800'
                                        : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
                                    }`}
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${isDarkMode
                                        ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className={`border-b px-4 py-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                                    }`}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                </svg>
                            </button>

                            <button
                                onClick={() => router.push('/dashboard')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDarkMode
                                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                Dashboard
                            </button>

                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">PG</span>
                                </div>
                                <h1 className="text-lg font-semibold">Pine Genie AI</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Model Selector */}
                            <select
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                                className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isDarkMode
                                        ? 'bg-gray-800 border-gray-600 text-gray-200'
                                        : 'bg-white border-gray-300 text-gray-700'
                                    }`}
                            >
                                {models.map(model => (
                                    <option key={model.id} value={model.id}>
                                        {model.name}
                                    </option>
                                ))}
                            </select>

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-lg transition-colors ${isDarkMode
                                        ? 'text-yellow-400 hover:bg-gray-800'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {isDarkMode ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="5" />
                                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto">
                    {currentMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-semibold mb-3">How can I help you today?</h2>
                            <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                I can help you create powerful Pine Script v6 trading strategies
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
                                <button
                                    onClick={() => setInputValue('Create a RSI strategy with 30/70 levels and Pine Script v6')}
                                    className={`p-4 rounded-xl border text-left transition-all hover:scale-105 ${isDarkMode
                                            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="text-blue-500 mb-2">📈</div>
                                    <div className="font-medium mb-1">RSI Strategy v6</div>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Create RSI strategy with Pine Script v6
                                    </div>
                                </button>

                                <button
                                    onClick={() => setInputValue('Build a MACD crossover strategy using Pine Script version 6')}
                                    className={`p-4 rounded-xl border text-left transition-all hover:scale-105 ${isDarkMode
                                            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="text-green-500 mb-2">📊</div>
                                    <div className="font-medium mb-1">MACD Crossover v6</div>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Build MACD strategy with v6 syntax
                                    </div>
                                </button>

                                <button
                                    onClick={() => setInputValue('Make a Bollinger Bands squeeze strategy in Pine Script v6')}
                                    className={`p-4 rounded-xl border text-left transition-all hover:scale-105 ${isDarkMode
                                            ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    <div className="text-purple-500 mb-2">🎯</div>
                                    <div className="font-medium mb-1">Bollinger Bands v6</div>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Create Bollinger strategy with v6
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto px-4 py-6">
                            <div className="space-y-6">
                                {currentMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-sm font-bold">PG</span>
                                            </div>
                                        )}

                                        <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
                                            <div
                                                className={`px-4 py-3 rounded-2xl ${message.role === 'user'
                                                        ? 'bg-blue-500 text-white ml-auto'
                                                        : isDarkMode
                                                            ? 'bg-gray-800 text-gray-100'
                                                            : 'bg-gray-100 text-gray-900'
                                                    }`}
                                            >
                                                <div className="whitespace-pre-wrap leading-relaxed">
                                                    {message.content}
                                                </div>
                                            </div>

                                            {/* Code Block */}
                                            {message.role === 'assistant' && extractPineScriptCode(message.content) && (
                                                <div className={`mt-3 border rounded-xl overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                                                    }`}>
                                                    <div className={`flex items-center justify-between px-4 py-2 border-b ${isDarkMode
                                                            ? 'bg-gray-800 border-gray-700'
                                                            : 'bg-gray-50 border-gray-200'
                                                        }`}>
                                                        <span className="text-sm font-medium">Pine Script v6 Code</span>
                                                        <button
                                                            onClick={() => copyToClipboard(extractPineScriptCode(message.content))}
                                                            className={`px-3 py-1 text-xs rounded-lg transition-colors ${isDarkMode
                                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                                }`}
                                                        >
                                                            Copy Code
                                                        </button>
                                                    </div>
                                                    <pre className="p-4 text-sm overflow-x-auto bg-gray-900 text-green-400">
                                                        <code>{extractPineScriptCode(message.content)}</code>
                                                    </pre>
                                                </div>
                                            )}

                                            <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-right' : 'text-left'
                                                } ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {message.timestamp.toLocaleTimeString()}
                                            </div>
                                        </div>

                                        {message.role === 'user' && (
                                            <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-sm font-bold">U</span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-sm font-bold">PG</span>
                                        </div>
                                        <div className={`px-4 py-3 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                                                <span className="text-sm">Generating Pine Script v6 code...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className={`border-t px-4 py-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                    <div className="max-w-4xl mx-auto">
                        <div className={`border rounded-2xl transition-colors ${isDarkMode ? 'border-gray-700' : 'border-gray-300'
                            }`}>
                            <div className="flex items-end gap-3 p-4">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me to create Pine Script v6 strategies..."
                                    className={`flex-1 resize-none border-none outline-none bg-transparent text-base leading-6 ${isDarkMode ? 'placeholder-gray-500' : 'placeholder-gray-400'
                                        }`}
                                    rows={1}
                                    style={{ minHeight: '24px', maxHeight: '120px' }}
                                    disabled={isLoading}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = target.scrollHeight + 'px';
                                    }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="m22 2-7 20-4-9-9-4Z" />
                                            <path d="M22 2 11 13" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}