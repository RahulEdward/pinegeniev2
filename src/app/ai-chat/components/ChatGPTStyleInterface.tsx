'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
}

export default function ChatGPTStyleInterface({ userId }: { userId: string }) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Load theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Toggle theme function
    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        if (newTheme) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const generateId = () => Date.now().toString() + Math.random().toString(36);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: generateId(),
            content: input.trim(),
            role: 'user'
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = input.trim();
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('/api/ai-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
                    modelId: 'gpt-4'
                })
            });

            const data = await response.json();

            const aiMessage: Message = {
                id: generateId(),
                content: data.content || 'Sorry, no response received.',
                role: 'assistant'
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: generateId(),
                content: 'Error occurred. Please try again.',
                role: 'assistant'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className={`h-screen flex transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            {/* Sidebar */}
            {sidebarOpen && (
                <div className={`w-64 flex flex-col transition-colors duration-300 border-r ${isDarkMode ? 'bg-gray-900 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-200'}`}>
                    <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                        <button
                            onClick={() => setMessages([])}
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
                        {messages.length === 0 ? (
                            <div className={`text-center py-8 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                No chat history yet
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <div className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-blue-50 text-blue-900'
                                    }`}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                    <span className="flex-1 text-sm truncate">Current Chat</span>
                                    <button className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                                        }`}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className={`w-full px-3 py-2 text-sm rounded-lg transition-colors ${isDarkMode
                                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className={`border-b p-4 flex items-center justify-between transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className={`p-2 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        >
                            ☰
                        </button>
                        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                            <span className="text-white text-sm font-bold">AI</span>
                        </div>
                        <h1 className="font-semibold">Pine Genie AI</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Model Selector */}
                        <select className={`px-3 py-1 text-sm border rounded focus:outline-none ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            }`}>
                            <option>GPT-4</option>
                            <option>GPT-3.5</option>
                        </select>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded text-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
                            title="Toggle theme"
                        >
                            {isDarkMode ? '☀️' : '🌙'}
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className={`flex-1 overflow-y-auto p-6 transition-colors ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl">
                                <span className="text-white text-3xl">💬</span>
                            </div>
                            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                How can I help you today?
                            </h2>
                            <p className={`text-xl mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                I can help you create powerful Pine Script v6 trading strategies
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                                <button
                                    onClick={() => setInput('Create a RSI strategy with Pine Script v6')}
                                    className={`group p-6 rounded-2xl border text-left transition-all duration-300 hover:scale-105 hover:shadow-xl ${isDarkMode
                                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-blue-500'
                                        : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300 shadow-lg'
                                        }`}
                                >
                                    <div className="text-3xl mb-4">📈</div>
                                    <div className={`font-bold text-lg mb-2 group-hover:text-blue-600 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        RSI Strategy v6
                                    </div>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Create RSI strategy with 30/70 levels using Pine Script v6
                                    </div>
                                </button>

                                <button
                                    onClick={() => setInput('Build a MACD crossover strategy using Pine Script v6')}
                                    className={`group p-6 rounded-2xl border text-left transition-all duration-300 hover:scale-105 hover:shadow-xl ${isDarkMode
                                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-green-500'
                                        : 'bg-white border-gray-200 hover:bg-green-50 hover:border-green-300 shadow-lg'
                                        }`}
                                >
                                    <div className="text-3xl mb-4">📊</div>
                                    <div className={`font-bold text-lg mb-2 group-hover:text-green-600 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        MACD Crossover v6
                                    </div>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Build MACD crossover strategy with Pine Script v6 syntax
                                    </div>
                                </button>

                                <button
                                    onClick={() => setInput('Make a Bollinger Bands squeeze strategy in Pine Script v6')}
                                    className={`group p-6 rounded-2xl border text-left transition-all duration-300 hover:scale-105 hover:shadow-xl ${isDarkMode
                                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-purple-500'
                                        : 'bg-white border-gray-200 hover:bg-purple-50 hover:border-purple-300 shadow-lg'
                                        }`}
                                >
                                    <div className="text-3xl mb-4">🎯</div>
                                    <div className={`font-bold text-lg mb-2 group-hover:text-purple-600 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Bollinger Bands v6
                                    </div>
                                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Create Bollinger Bands squeeze strategy with Pine Script v6
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-6 p-4">
                            {messages.map((message) => (
                                <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {message.role === 'assistant' && (
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <span className="text-white text-sm font-bold">AI</span>
                                        </div>
                                    )}

                                    <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
                                        <div className={`px-6 py-4 rounded-2xl shadow-lg ${message.role === 'user'
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto'
                                            : isDarkMode
                                                ? 'bg-gray-800 text-gray-100 border border-gray-700'
                                                : 'bg-white text-gray-900 border border-gray-200'
                                            }`}>
                                            <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                                        </div>

                                        <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-right text-blue-100' : 'text-left'
                                            } ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                            {new Date().toLocaleTimeString()}
                                        </div>
                                    </div>

                                    {message.role === 'user' && (
                                        <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                            <span className="text-white text-sm font-bold">U</span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <span className="text-white text-sm font-bold">AI</span>
                                    </div>
                                    <div className={`px-6 py-4 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                Generating Pine Script v6 code...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className={`border-t p-6 transition-colors ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <div className="max-w-4xl mx-auto">
                        <div className={`relative border rounded-2xl shadow-lg transition-all duration-200 ${isDarkMode
                            ? 'border-gray-600 bg-gray-800 focus-within:border-blue-500'
                            : 'border-gray-300 bg-white focus-within:border-blue-500 focus-within:shadow-xl'
                            }`}>
                            <div className="flex items-end gap-3 p-4">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Ask me to create Pine Script v6 strategies..."
                                    className={`flex-1 resize-none border-none outline-none bg-transparent text-base leading-6 ${isDarkMode ? 'placeholder-gray-400 text-gray-100' : 'placeholder-gray-500 text-gray-900'
                                        }`}
                                    rows={1}
                                    style={{ minHeight: '28px', maxHeight: '120px' }}
                                    disabled={loading}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = target.scrollHeight + 'px';
                                    }}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim() || loading}
                                    className={`p-3 rounded-xl transition-all duration-200 ${!input.trim() || loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 shadow-lg'
                                        } text-white`}
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="m22 2-7 20-4-9-9-4Z" />
                                            <path d="M22 2 11 13" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center justify-center mt-3 gap-2 text-xs">
                            <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                Press Enter to send, Shift+Enter for new line
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}