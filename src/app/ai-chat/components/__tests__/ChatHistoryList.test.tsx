/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatHistoryList, { Conversation } from '../ChatHistoryList';
import { useClaudeLayoutStore } from '../../stores/claude-layout-store';

// Mock the store
jest.mock('../../stores/claude-layout-store');

const mockUseClaudeLayoutStore = useClaudeLayoutStore as jest.MockedFunction<typeof useClaudeLayoutStore>;

// Mock conversations data
const mockConversations: Conversation[] = [
  {
    id: '1',
    title: 'RSI Strategy Discussion',
    lastMessage: 'Let me help you create an RSI-based trading strategy...',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    category: 'mean-reversion',
    hasSpec: true,
    messageCount: 15
  },
  {
    id: '2',
    title: 'Breakout Trading Setup',
    lastMessage: 'Here is a breakout strategy using Bollinger Bands...',
    timestamp: new Date('2024-01-14T14:20:00Z'),
    category: 'breakout',
    hasSpec: false,
    messageCount: 8
  },
  {
    id: '3',
    title: 'Trend Following with EMA',
    lastMessage: 'This EMA crossover strategy works well in trending markets...',
    timestamp: new Date('2024-01-13T09:15:00Z'),
    category: 'trend-following',
    hasSpec: true,
    messageCount: 22
  },
  {
    id: '4',
    title: 'Scalping Strategy',
    lastMessage: 'Quick scalping setup for 1-minute charts...',
    timestamp: new Date('2024-01-12T16:45:00Z'),
    category: 'scalping',
    hasSpec: false,
    messageCount: 5
  }
];

describe('ChatHistoryList', () => {
  const mockOnSelectConversation = jest.fn();
  const mockOnDeleteConversation = jest.fn();
  const mockOnNewChat = jest.fn();

  const defaultProps = {
    conversations: mockConversations,
    currentConversationId: '1',
    onSelectConversation: mockOnSelectConversation,
    onDeleteConversation: mockOnDeleteConversation,
    onNewChat: mockOnNewChat
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseClaudeLayoutStore.mockReturnValue({
      sidebarCollapsed: false,
    } as any);
  });

  describe('Rendering', () => {
    it('should render the chat history list', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      expect(screen.getByTestId('chat-history-list')).toBeInTheDocument();
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('should render conversation categories that have conversations', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      // Only categories with conversations should be visible
      expect(screen.getByTestId('category-trend-following')).toBeInTheDocument();
      expect(screen.getByTestId('category-mean-reversion')).toBeInTheDocument();
      expect(screen.getByTestId('category-breakout')).toBeInTheDocument();
      expect(screen.getByTestId('category-scalping')).toBeInTheDocument();
      
      // Empty categories should not be visible when not searching
      expect(screen.queryByTestId('category-momentum')).not.toBeInTheDocument();
      expect(screen.queryByTestId('category-custom')).not.toBeInTheDocument();
    });

    it('should render conversations in their respective categories', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      expect(screen.getByTestId('conversation-1')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-2')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-3')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-4')).toBeInTheDocument();
    });

    it('should display conversation details correctly', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      expect(screen.getByText('RSI Strategy Discussion')).toBeInTheDocument();
      expect(screen.getByText('Let me help you create an RSI-based trading strategy...')).toBeInTheDocument();
      expect(screen.getByText('15 messages')).toBeInTheDocument();
    });

    it('should show spec badges for conversations with specs', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      const conversation1 = screen.getByTestId('conversation-1');
      const conversation2 = screen.getByTestId('conversation-2');
      
      expect(conversation1.querySelector('.spec-badge')).toBeInTheDocument();
      expect(conversation2.querySelector('.spec-badge')).not.toBeInTheDocument();
    });

    it('should highlight the current conversation', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      const activeConversation = screen.getByTestId('conversation-1');
      expect(activeConversation).toHaveClass('active');
    });
  });

  describe('Search Functionality', () => {
    it('should filter conversations based on search query', async () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'RSI' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('conversation-1')).toBeInTheDocument();
        expect(screen.queryByTestId('conversation-2')).not.toBeInTheDocument();
        expect(screen.queryByTestId('conversation-3')).not.toBeInTheDocument();
        expect(screen.queryByTestId('conversation-4')).not.toBeInTheDocument();
      });
    });

    it('should show clear search button when searching', async () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByTestId('clear-search-button')).toBeInTheDocument();
      });
    });

    it('should clear search when clear button is clicked', async () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        const clearButton = screen.getByTestId('clear-search-button');
        fireEvent.click(clearButton);
      });
      
      expect(searchInput).toHaveValue('');
    });

    it('should show no results message when search yields no results', async () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      await waitFor(() => {
        expect(screen.getByText('No conversations found')).toBeInTheDocument();
        expect(screen.getByTestId('clear-search-link')).toBeInTheDocument();
      });
    });
  });

  describe('Category Management', () => {
    it('should toggle category expansion when header is clicked', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      const categoryHeader = screen.getByTestId('category-mean-reversion');
      
      // Category should be expanded by default
      expect(categoryHeader).toHaveAttribute('aria-expanded', 'true');
      
      // Click to collapse
      fireEvent.click(categoryHeader);
      expect(categoryHeader).toHaveAttribute('aria-expanded', 'false');
      
      // Click to expand again
      fireEvent.click(categoryHeader);
      expect(categoryHeader).toHaveAttribute('aria-expanded', 'true');
    });

    it('should show conversation count in category headers', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      // Check that conversation counts are displayed (multiple categories have 1 conversation each)
      const conversationCounts = screen.getAllByText('(1)');
      expect(conversationCounts.length).toBeGreaterThan(0);
    });

    it('should hide empty categories when not searching', () => {
      const emptyConversations: Conversation[] = [
        {
          id: '1',
          title: 'Test',
          lastMessage: 'Test message',
          timestamp: new Date(),
          category: 'trend-following',
          hasSpec: false,
          messageCount: 1
        }
      ];

      render(<ChatHistoryList {...defaultProps} conversations={emptyConversations} />);
      
      // Only trend-following should be visible, others should be hidden
      expect(screen.getByTestId('category-trend-following')).toBeInTheDocument();
      expect(screen.queryByTestId('category-momentum')).not.toBeInTheDocument();
    });
  });

  describe('Conversation Interactions', () => {
    it('should call onSelectConversation when conversation is clicked', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      const conversation = screen.getByTestId('conversation-2');
      fireEvent.click(conversation);
      
      expect(mockOnSelectConversation).toHaveBeenCalledWith('2');
    });

    it('should call onSelectConversation when Enter key is pressed', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      const conversation = screen.getByTestId('conversation-2');
      fireEvent.keyDown(conversation, { key: 'Enter' });
      
      expect(mockOnSelectConversation).toHaveBeenCalledWith('2');
    });

    it('should call onSelectConversation when Space key is pressed', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      const conversation = screen.getByTestId('conversation-2');
      fireEvent.keyDown(conversation, { key: ' ' });
      
      expect(mockOnSelectConversation).toHaveBeenCalledWith('2');
    });

    it('should show delete button and call onDeleteConversation when clicked', () => {
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      render(<ChatHistoryList {...defaultProps} />);
      
      const deleteButton = screen.getByTestId('delete-conversation-1');
      fireEvent.click(deleteButton);
      
      expect(mockOnDeleteConversation).toHaveBeenCalledWith('1');
      
      // Restore original confirm
      window.confirm = originalConfirm;
    });

    it('should not delete conversation if user cancels confirmation', () => {
      // Mock window.confirm to return false
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => false);

      render(<ChatHistoryList {...defaultProps} />);
      
      const deleteButton = screen.getByTestId('delete-conversation-1');
      fireEvent.click(deleteButton);
      
      expect(mockOnDeleteConversation).not.toHaveBeenCalled();
      
      // Restore original confirm
      window.confirm = originalConfirm;
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no conversations exist', () => {
      render(<ChatHistoryList {...defaultProps} conversations={[]} />);
      
      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
      expect(screen.getByText('Start a new conversation to begin building your trading strategies')).toBeInTheDocument();
      expect(screen.getByTestId('new-chat-cta')).toBeInTheDocument();
    });

    it('should call onNewChat when new chat CTA is clicked', () => {
      render(<ChatHistoryList {...defaultProps} conversations={[]} />);
      
      const newChatButton = screen.getByTestId('new-chat-cta');
      fireEvent.click(newChatButton);
      
      expect(mockOnNewChat).toHaveBeenCalled();
    });
  });

  describe('Collapsed Sidebar', () => {
    it('should not render when sidebar is collapsed', () => {
      mockUseClaudeLayoutStore.mockReturnValue({
        sidebarCollapsed: true,
      } as any);

      render(<ChatHistoryList {...defaultProps} />);
      
      expect(screen.queryByTestId('chat-history-list')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('aria-label', 'Search conversations');
      
      const categoryHeader = screen.getByTestId('category-mean-reversion');
      expect(categoryHeader).toHaveAttribute('aria-label', 'Mean Reversion category');
    });

    it('should have proper role attributes', () => {
      render(<ChatHistoryList {...defaultProps} />);
      
      const conversation = screen.getByTestId('conversation-1');
      expect(conversation).toHaveAttribute('role', 'button');
      expect(conversation).toHaveAttribute('tabIndex', '0');
    });
  });
});