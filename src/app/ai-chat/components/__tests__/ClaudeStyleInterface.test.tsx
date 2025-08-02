/**
 * Tests for ClaudeStyleInterface component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClaudeStyleInterface from '../ClaudeStyleInterface';

// Mock the zustand store
jest.mock('../../stores/claude-layout-store', () => ({
  useClaudeLayoutStore: jest.fn(() => ({
    sidebarCollapsed: false,
    codePanelOpen: false,
    currentConversation: null,
    activeSpecSession: null,
    getLayoutClass: () => 'claude-interface desktop',
    shouldShowSidebar: () => true,
    shouldShowCodePanel: () => false,
    toggleSidebar: jest.fn(),
    toggleCodePanel: jest.fn(),
    setCurrentConversation: jest.fn(),
    setActiveSpecSession: jest.fn(),
    getGridTemplate: () => '280px 1fr 0px'
  })),
  useResponsiveLayout: () => {}
}));

describe('ClaudeStyleInterface', () => {
  const defaultProps = {
    userId: 'test-user',
    initialConversation: null
  };

  beforeEach(() => {
    // Mock window.innerWidth for responsive tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
  });

  it('should render all main components', () => {
    render(<ClaudeStyleInterface {...defaultProps} />);
    
    expect(screen.getByTestId('claude-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-chat-area')).toBeInTheDocument();
    expect(screen.getByTestId('claude-code-panel')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input-area')).toBeInTheDocument();
  });

  it('should display placeholder content in all sections', () => {
    render(<ClaudeStyleInterface {...defaultProps} />);
    
    // Check sidebar content
    expect(screen.getByText('Pine Genie')).toBeInTheDocument();
    expect(screen.getByText('New Chat')).toBeInTheDocument();
    expect(screen.getByText('Chat History')).toBeInTheDocument();
    expect(screen.getByText('Spec Planning')).toBeInTheDocument();
    
    // Check main chat area
    expect(screen.getByText('Main Chat Area')).toBeInTheDocument();
    expect(screen.getByText('Messages, AI responses, typing indicators')).toBeInTheDocument();
    
    // Check code panel
    expect(screen.getByText('Code Panel')).toBeInTheDocument();
    expect(screen.getByText('Syntax highlighting, code tabs, export options')).toBeInTheDocument();
    
    // Check input area
    expect(screen.getByText('Input Area')).toBeInTheDocument();
    expect(screen.getByText('Multi-line input, file upload, voice input, send controls')).toBeInTheDocument();
  });

  it('should have proper CSS classes applied', () => {
    render(<ClaudeStyleInterface {...defaultProps} />);
    
    const mainContainer = screen.getByTestId('claude-sidebar').closest('.claude-interface');
    expect(mainContainer).toHaveClass('claude-interface');
  });

  it('should render toggle buttons', () => {
    render(<ClaudeStyleInterface {...defaultProps} />);
    
    expect(screen.getByText('Toggle Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Toggle Code Panel')).toBeInTheDocument();
    
    // Check sidebar toggle button exists (it's an icon button, not text)
    expect(screen.getByTestId('sidebar-toggle-button')).toBeInTheDocument();
  });

  it('should apply correct grid template style', () => {
    render(<ClaudeStyleInterface {...defaultProps} />);
    
    const mainContainer = screen.getByTestId('claude-sidebar').closest('.claude-interface');
    expect(mainContainer).toHaveAttribute('style');
    // The style should contain the grid template
    const style = mainContainer?.getAttribute('style');
    expect(style).toContain('grid-template-columns');
  });
});