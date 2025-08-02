'use client';

import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Plus,
  MessageSquare,
  TestTube,
  FolderOpen,
  Archive,
  User,
  ChevronDown,
  Trash2,
  Edit3,
  MoreHorizontal
} from 'lucide-react';
import { useThemeConsistency } from '@/agents/pinegenie-agent/components/ThemeConsistencyProvider';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  chatHistory: ChatHistory[];
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  currentChatId?: string;
  userName?: string;
  userPlan?: string;
  userInitials?: string;
  appTitle?: string;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  onNewChat,
  chatHistory,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  currentChatId,
  userName,
  userPlan,
  userInitials,
  appTitle
}: ChatSidebarProps) {
  const { colors, isDark } = useThemeConsistency();
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  // Handle new chat click
  const handleNewChatClick = () => {
    console.log('New Chat clicked in sidebar');
    onNewChat();
  };

  const handleRenameStart = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const handleRenameSubmit = () => {
    if (editingChatId && editTitle.trim()) {
      onRenameChat(editingChatId, editTitle.trim());
    }
    setEditingChatId(null);
    setEditTitle('');
  };

  const handleRenameCancel = () => {
    setEditingChatId(null);
    setEditTitle('');
  };

  // No date grouping - just show chats directly

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-in-out ${isOpen ? 'w-80' : 'w-16'
          } lg:relative lg:z-auto`}
        style={{
          backgroundColor: colors.bg.secondary,
          borderRight: `1px solid ${colors.border.primary}`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: colors.border.primary }}>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg transition-colors hover:bg-opacity-80"
            style={{
              backgroundColor: colors.bg.tertiary,
              color: colors.text.primary
            }}
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {isOpen && (
            <h1
              className="text-xl font-semibold"
              style={{ color: colors.text.primary }}
            >
              {appTitle}
            </h1>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={handleNewChatClick}
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105"
            style={{
              backgroundColor: colors.accent.blue,
              color: '#ffffff'
            }}
          >
            <Plus className="h-5 w-5 text-white" />
            {isOpen && (
              <span className="font-medium">New Chat</span>
            )}
          </button>
        </div>

        {/* Chat History */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {chatHistory.length > 0 && (
              <div className="space-y-4">


                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative rounded-lg transition-all duration-200 ${currentChatId === chat.id ? 'ring-1' : ''
                      }`}
                    style={{
                      backgroundColor: currentChatId === chat.id ? colors.bg.tertiary : 'transparent',
                      ringColor: currentChatId === chat.id ? colors.accent.blue : 'transparent'
                    }}
                    onMouseEnter={() => setHoveredChatId(chat.id)}
                    onMouseLeave={() => setHoveredChatId(null)}
                  >
                    {editingChatId === chat.id ? (
                      <div className="p-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameSubmit();
                            if (e.key === 'Escape') handleRenameCancel();
                          }}
                          onBlur={handleRenameSubmit}
                          className="w-full px-2 py-1 text-sm rounded border-none outline-none"
                          style={{
                            backgroundColor: colors.bg.primary,
                            color: colors.text.primary
                          }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectChat(chat.id)}
                        className="w-full text-left p-2 rounded-lg transition-colors"
                        onMouseEnter={(e) => {
                          if (currentChatId !== chat.id) {
                            e.currentTarget.style.backgroundColor = colors.bg.tertiary;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (currentChatId !== chat.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: colors.text.primary }}
                        >
                          {chat.title}
                        </div>
                        <div
                          className="text-xs truncate mt-1"
                          style={{ color: colors.text.muted }}
                        >
                          {chat.preview}
                        </div>
                      </button>
                    )}

                    {/* Chat Actions */}
                    {hoveredChatId === chat.id && editingChatId !== chat.id && (
                      <div className="absolute right-2 top-2 flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameStart(chat.id, chat.title);
                          }}
                          className="p-1 rounded hover:bg-opacity-80 transition-colors"
                          style={{
                            backgroundColor: colors.bg.primary,
                            color: colors.text.secondary
                          }}
                          aria-label="Rename chat"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          className="p-1 rounded hover:bg-opacity-80 transition-colors"
                          style={{
                            backgroundColor: colors.bg.primary,
                            color: colors.accent.red
                          }}
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Profile */}
        <div
          className="border-t p-4"
          style={{ borderColor: colors.border.primary }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              style={{
                backgroundColor: colors.accent.blue,
                color: '#ffffff'
              }}
            >
              {userInitials}
            </div>

            {isOpen && (
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-medium truncate"
                  style={{ color: colors.text.primary }}
                >
                  {userName}
                </div>
                <div
                  className="text-xs truncate"
                  style={{ color: colors.text.muted }}
                >
                  {userPlan}
                </div>
              </div>
            )}

            {isOpen && (
              <button
                className="p-1 rounded transition-colors"
                style={{ color: colors.text.secondary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.bg.tertiary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatSidebar;