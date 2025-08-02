'use client';

import React, { useState } from 'react';
import { useClaudeLayoutStore, useResponsiveLayout } from '../stores/claude-layout-store';
import ClaudeSidebar from './ClaudeSidebar';
import MessageContainer, { Message } from './MessageContainer';
import CodePanel from './CodePanel';
import ModelSelector, { availableModels } from './ModelSelector';
import { Conversation } from './ChatHistoryList';
import { UserProfile, UserSettings } from './UserProfileSection';
import { aiService, ChatMessage } from '../services/aiService';
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
    setCurrentConversation
  } = useClaudeLayoutStore();

  // Initialize responsive behavior - hydration safe
  useResponsiveLayout();

  // Empty conversation data - no hard-coded chat history
  const [conversations] = useState<Conversation[]>([]);

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

  // Sample settings
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
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
  
  // State for AI model selection
  const [selectedModel, setSelectedModel] = useState<string>('pine-genie');
  const [isGenerating, setIsGenerating] = useState(false);

  // Set initial conversation if provided
  React.useEffect(() => {
    if (initialConversation && !currentConversation) {
      setCurrentConversation(initialConversation);
    }
  }, [initialConversation, currentConversation, setCurrentConversation]);

  // Apply theme on mount and when settings change
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Handler functions
  const handleSelectConversation = (id: string) => {
    setCurrentConversation(id);
    if (!useClaudeLayoutStore.getState().sidebarCollapsed) {
      toggleSidebar();
    }
  };

  const handleDeleteConversation = (id: string) => {
    console.log('Delete conversation:', id);
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
    console.log('Starting new chat');
    if (useClaudeLayoutStore.getState().sidebarCollapsed) {
      toggleSidebar();
    }
  };

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
      // Convert messages to ChatMessage format
      const chatMessages: ChatMessage[] = [
        ...messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.timestamp
        })),
        {
          role: 'user' as const,
          content: content,
          timestamp: new Date()
        }
      ];

      // Send to AI service
      const aiResponse = await aiService.sendMessage(selectedModel, chatMessages);

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
        gridTemplateColumns: gridTemplate
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
      >
        {/* Clean Top Controls - Only Theme Toggle */}
        <div className="chat-controls">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
            data-testid="theme-toggle"
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

        <div className="chat-content">
          {/* Message Container - Always show, handles empty state internally */}
          <MessageContainer
            messages={messages}
            isLoading={isAILoading}
            onSuggestedPrompt={handleSuggestedPrompt}
          />
        </div>

        {/* Input Section - Fixed at bottom */}
        <div className="input-section">
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

          <div className="main-input-container">
            <textarea
              className="main-input"
              placeholder="How can I help you today?"
              value={inputValue}
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

      {/* Right Code Panel */}
      {shouldShowCodePanel() && (
        <CodePanel
          code={generatedCode}
          isOpen={codePanelOpen}
          onClose={toggleCodePanel}
          onClear={handleClearCode}
        />
      )}

    </div>
  );
}