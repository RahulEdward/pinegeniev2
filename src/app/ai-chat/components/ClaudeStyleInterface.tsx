'use client';

import React, { useState } from 'react';
import { useClaudeLayoutStore, useResponsiveLayout } from '../stores/claude-layout-store';
import ClaudeSidebar from './ClaudeSidebar';
import MessageContainer, { Message } from './MessageContainer';
import CodePanel from './CodePanel';
import ModelSelector, { availableModels } from './ModelSelector';
import { Conversation } from './ChatHistoryList';
import { UserProfile, UserSettings } from './UserProfileSection';
// Using API route instead of direct client-side service
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
import '../styles/claude-interface.css';

interface ClaudeStyleInterfaceProps {
  initialConversation?: string | null;
  userId: string;
}

/**
 * Main Claude-style interface component with responsive grid layout
 * Implements the core structure for the Claude-style UI enhancement
 */
export default function ClaudeStyleInterface({
  initialConversation,
  userId
}: ClaudeStyleInterfaceProps) {
  const {
    codePanelOpen,
    currentConversation,
    getLayoutClass,
    shouldShowSidebar,
    shouldShowCodePanel,
    toggleSidebar,
    toggleCodePanel,
    setCurrentConversation,
    isDarkMode,
    initializeTheme,
    toggleTheme: toggleStoreTheme
  } = useClaudeLayoutStore();

  // Initialize responsive behavior - hydration safe
  useResponsiveLayout();

  // Add scroll fix for AI chat
  React.useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    
    const style = document.createElement('style');
    style.innerHTML = `
      body, html { overflow: auto !important; height: auto !important; }
      .claude-interface { overflow: visible !important; }
      .claude-main-chat { overflow: visible !important; }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.head.querySelector('style');
      if (existingStyle && existingStyle.innerHTML.includes('claude-interface')) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // State for hydration
  const [isClient, setIsClient] = useState(false);

  // Handle hydration and load conversations
  React.useEffect(() => {
    setIsClient(true);
    loadConversations();
    
    // Ensure sidebar is open on desktop by default
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      const { sidebarCollapsed, setSidebarCollapsed } = useClaudeLayoutStore.getState();
      if (sidebarCollapsed) {
        setSidebarCollapsed(false);
      }
    }
  }, []);

  // Load conversations from API
  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const response = await fetch('/api/ai-chat/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.data || []);
      } else {
        console.error('Failed to load conversations');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Conversation data - loaded from API
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);

  // Sample user data
  const [user] = useState<UserProfile>({
    id: userId,
    name: 'Pine Trader',
    email: 'user@pinegenie.com',
    initials: 'PT'
  });

  // Get personalized greeting based on time of day
  const getGreeting = React.useCallback(() => {
    const hour = new Date().getHours();
    let timeOfDay = 'Evening';

    if (hour >= 5 && hour < 12) {
      timeOfDay = 'Morning';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'Afternoon';
    }

    return `${timeOfDay}, ${user.name}`;
  }, [user.name]);

  // Sample settings - initialize with light theme to match global default
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    fontSize: 14,
    autoOpenCodePanel: true,
    sidebarCollapsed: false,
    notifications: true,
    autoSave: true,
    language: 'en'
  });

  // State for input and file handling
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // State for messages - start with empty array to show welcome screen
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);

  // State for code panel
  const [generatedCode, setGeneratedCode] = useState<string>('');

  // State for AI model selection - Default to ChatGPT-4
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle conversation deletion
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/ai-chat/conversations?id=${conversationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove conversation from local state
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));

        // If the deleted conversation was the current one, clear it
        if (currentConversation === conversationId) {
          setCurrentConversation(null);
          setMessages([]);
        }
      } else {
        console.error('Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = async (conversationId: string) => {
    setCurrentConversation(conversationId);

    // Load messages for this conversation
    try {
      const response = await fetch(`/api/ai-chat/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        // Transform messages to match the expected format
        const formattedMessages = data.data.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.createdAt)
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation messages:', error);
    }
  };

  // Handle new chat
  const handleNewChat = () => {
    setCurrentConversation(null);
    setMessages([]);
    setGeneratedCode('');
  };

  // Set initial conversation if provided
  React.useEffect(() => {
    if (initialConversation && !currentConversation) {
      setCurrentConversation(initialConversation);
    }
  }, [initialConversation, currentConversation, setCurrentConversation]);

  // Initialize theme from global theme system
  React.useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Sync settings with layout store theme
  React.useEffect(() => {
    const themeFromStore = isDarkMode ? 'dark' : 'light';
    if (settings.theme !== themeFromStore) {
      setSettings(prev => ({ ...prev, theme: themeFromStore }));
    }
  }, [isDarkMode, settings.theme]);

  // Apply theme on mount and when settings change
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    
    // Also sync with global theme classes for consistency
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [settings.theme]);

  // Handler functions (removed duplicates - using the new async versions above)

  const handleStartChat = () => {
    if (!useClaudeLayoutStore.getState().sidebarCollapsed) {
      toggleSidebar();
    }
  };

  // Enhanced code detection function
  const shouldOpenCodePanel = (text: string) => {
    const codeKeywords = [
      'pine script', 'pinescript', 'strategy', 'indicator',
      'code', 'script', '//@version', 'study()', 'strategy()',
      'rsi', 'macd', 'moving average', 'bollinger bands',
      'buy signal', 'sell signal', 'entry', 'exit',
      'here\'s the code', 'generated code', 'pine code'
    ];

    const lowerText = text.toLowerCase();
    return codeKeywords.some(keyword => lowerText.includes(keyword)) ||
      lowerText.includes('```');
  };

  // Extract Pine Script code from AI response
  const extractPineScriptCode = (text: string): string => {
    const codeBlockRegex = /```(?:pinescript|pine)?\n?([\s\S]*?)```/gi;
    const matches = text.match(codeBlockRegex);

    if (matches && matches.length > 0) {
      // Extract code from the first code block
      const codeMatch = matches[0].replace(/```(?:pinescript|pine)?\n?/gi, '').replace(/```$/g, '');
      return addPineGenieSignature(codeMatch.trim());
    }

    return '';
  };

  // Add Pine Genie signature to generated code
  const addPineGenieSignature = (code: string): string => {
    const signature = `// Generated by Pine Genie AI
// Visit: https://pinegenie.com
// Date: ${new Date().toLocaleDateString()}

`;

    // Check if code already has Pine Genie signature
    if (code.includes('Generated by Pine Genie AI')) {
      return code;
    }

    return signature + code;
  };

  // Clear generated code
  const handleClearCode = () => {
    setGeneratedCode('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';

    // Auto-open code panel when user mentions code-related keywords
    if (shouldOpenCodePanel(value) && !codePanelOpen && settings.autoOpenCodePanel) {
      toggleCodePanel();
    }
  };

  const handleAttachFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTheme = () => {
    toggleStoreTheme();
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    handleUpdateSettings({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleSignOut = () => {
    console.log('Signing out');
  };

  // Handle sending messages with AI service
  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsAILoading(true);
    setIsGenerating(true);

    try {
      // Convert messages to ChatMessage format for our AI service
      const chatMessages: ChatMessage[] = [
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        {
          role: 'user' as const,
          content: content
        }
      ];

      // Map model names to our working models
      let modelToUse = selectedModel;
      if (selectedModel === 'pine-genie') {
        modelToUse = 'pine-genie'; // Use local fallback
      } else if (selectedModel === 'gpt-4o') {
        modelToUse = 'gpt-4'; // Map to our working GPT-4
      } else if (selectedModel === 'claude-3-5-sonnet') {
        modelToUse = 'gpt-3.5-turbo'; // Fallback to GPT-3.5 if Claude not available
      } else {
        modelToUse = 'gpt-4'; // Default to GPT-4
      }

      // Send to our API route (server-side) instead of client-side service
      console.log(`🚀 Sending request to /api/ai-generate with model: ${modelToUse}`);
      
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatMessages,
          modelId: modelToUse
        })
      });

      console.log(`📡 API Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error: ${response.status} - ${errorText}`);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const aiResponse = await response.json();
      console.log(`✅ AI Response received:`, { model: aiResponse.model, contentLength: aiResponse.content?.length });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Extract and populate code in the right panel
      const extractedCode = extractPineScriptCode(aiResponse.content);
      if (extractedCode) {
        setGeneratedCode(extractedCode);
      }

      // Auto-open code panel if AI response contains code
      if (shouldOpenCodePanel(aiResponse.content) && !codePanelOpen && settings.autoOpenCodePanel) {
        setTimeout(() => toggleCodePanel(), 500);
      }

    } catch (error) {
      console.error('Error sending message:', error);

      // Fallback error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again or check your API configuration.',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAILoading(false);
      setIsGenerating(false);
    }
  };

  // Handle suggested prompt clicks
  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const gridTemplate = useClaudeLayoutStore((state: any) => state.getGridTemplate?.() || '1fr');

  return (
    <div
      className={getLayoutClass()}
      style={{
        gridTemplateColumns: gridTemplate,
        height: 'auto',
        minHeight: '100vh',
        overflow: 'visible',
        position: 'relative'
      }}
    >
      {/* Left Sidebar */}
      {shouldShowSidebar() && (
        <ClaudeSidebar
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onNewChat={handleNewChat}
          user={user}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onSignOut={handleSignOut}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      )}

      {/* Main Chat Area */}
      <main
        className="claude-main-chat"
        data-testid="main-chat-area"
        style={{
          height: 'auto',
          minHeight: '100vh',
          overflow: 'visible',
          display: 'block',
          position: 'relative'
        }}
      >
        {/* Back Button - Only render on client side */}
        {isClient && (
          <div style={{
            position: 'fixed',
            top: '24px',
            left: '24px',
            zIndex: 1001
          }}>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: 'rgba(55, 65, 81, 0.9)',
                color: 'white',
                border: '1px solid rgba(75, 85, 99, 0.5)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
              title="Back to Dashboard"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.9)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.9)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Theme Toggle - Only render on client side */}
        {isClient && (
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000
          }}>
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: 'transparent',
                color: settings.theme === 'dark' ? '#e6edf3' : '#24292f',
                border: '1px solid #30363d',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {settings.theme === 'dark' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        )}

        <div className="chat-content" style={{
          paddingBottom: '150px',
          minHeight: '100vh',
          overflow: 'visible'
        }}>
          {/* Message Container - Always show, handles empty state internally */}
          <MessageContainer
            messages={messages}
            isLoading={isAILoading}
            onSuggestedPrompt={handleSuggestedPrompt}
          />
        </div>

        {/* Input Section - Fixed at bottom */}
        <div className="input-section" style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '800px',
          zIndex: 1000,
          boxShadow: 'none',
          overflow: 'hidden',
          filter: 'none',
          WebkitBoxShadow: 'none',
          MozBoxShadow: 'none',
          background: 'transparent',
          border: 'none'
        }}>
          {/* Attached Files Display - Outside the input container */}
          {attachedFiles.length > 0 && (
            <div className="attached-files-external">
              {attachedFiles.map((file, index) => (
                <div key={index} className="attached-file">
                  <span className="file-name">{file.name}</span>
                  <button
                    className="remove-file-btn"
                    onClick={() => handleRemoveFile(index)}
                    title="Remove file"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="main-input-container" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '24px',
            boxShadow: 'none !important',
            overflow: 'hidden',
            filter: 'none !important',
            WebkitBoxShadow: 'none !important',
            MozBoxShadow: 'none !important',
            border: settings.theme === 'dark' ? '1px solid #30363d' : '1px solid #d0d7de',
            background: settings.theme === 'dark' ? '#161b22' : '#ffffff',
            outline: 'none !important',
            WebkitAppearance: 'none',
            MozAppearance: 'none'
          }}>
            <textarea
              className="main-input"
              placeholder="How can I help you today?"
              value={inputValue}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                resize: 'none',
                fontSize: '16px',
                lineHeight: '1.5',
                color: settings.theme === 'dark' ? '#e6edf3' : '#24292f',
                minHeight: '20px',
                maxHeight: '120px'
              }}
              rows={1}
              onFocus={handleStartChat}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
            />

            <div className="input-actions">
              <button
                className="attach-btn"
                onClick={handleAttachFile}
                title="Attach file"
                data-testid="attach-file-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <button
                className="send-btn"
                title="Send message"
                disabled={!inputValue.trim()}
                onClick={() => handleSendMessage()}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.py,.js,.ts,.json,.csv,.pine,.md,.pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </main>

      {/* Right Code Panel - Always Visible */}
      <CodePanel
        code={generatedCode}
        isOpen={true}
        onClose={toggleCodePanel}
        onClear={handleClearCode}
      />

    </div>
  );
}