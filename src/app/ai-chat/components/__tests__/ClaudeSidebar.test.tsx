/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClaudeSidebar from '../ClaudeSidebar';
import { useClaudeLayoutStore } from '../../stores/claude-layout-store';

// Mock the store
jest.mock('../../stores/claude-layout-store');

const mockUseClaudeLayoutStore = useClaudeLayoutStore as jest.MockedFunction<typeof useClaudeLayoutStore>;

describe('ClaudeSidebar', () => {
  const mockToggleSidebar = jest.fn();
  
  const defaultStoreState = {
    sidebarCollapsed: false,
    toggleSidebar: mockToggleSidebar,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseClaudeLayoutStore.mockReturnValue(defaultStoreState);
  });

  describe('Rendering', () => {
    it('should render the sidebar with all navigation elements', () => {
      render(<ClaudeSidebar />);
      
      expect(screen.getByTestId('claude-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-toggle-button')).toBeInTheDocument();
      expect(screen.getByTestId('new-chat-button')).toBeInTheDocument();
      expect(screen.getByTestId('chat-history-button')).toBeInTheDocument();
      expect(screen.getByTestId('spec-planning-button')).toBeInTheDocument();
      expect(screen.getByTestId('visual-builder-button')).toBeInTheDocument();
      
      // User profile section should be rendered
      expect(screen.getByTestId('user-profile-section')).toBeInTheDocument();
    });

    it('should display the Pine Genie title when expanded', () => {
      render(<ClaudeSidebar />);
      
      expect(screen.getByText('Pine Genie')).toBeInTheDocument();
    });

    it('should display navigation text when expanded', () => {
      render(<ClaudeSidebar />);
      
      expect(screen.getByText('New Chat')).toBeInTheDocument();
      expect(screen.getByText('Chat History')).toBeInTheDocument();
      expect(screen.getByText('Spec Planning')).toBeInTheDocument();
      expect(screen.getByText('Visual Builder')).toBeInTheDocument();
      
      // User profile section should show user details when expanded
      expect(screen.getByText('Pine Genie User')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<ClaudeSidebar />);
      
      const sidebar = screen.getByTestId('claude-sidebar');
      expect(sidebar).toHaveAttribute('role', 'navigation');
      expect(sidebar).toHaveAttribute('aria-label', 'Main navigation sidebar');
      
      const toggleButton = screen.getByTestId('sidebar-toggle-button');
      expect(toggleButton).toHaveAttribute('aria-label', 'Collapse sidebar');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('Collapsed State', () => {
    beforeEach(() => {
      mockUseClaudeLayoutStore.mockReturnValue({
        ...defaultStoreState,
        sidebarCollapsed: true,
      });
    });

    it('should apply collapsed class when sidebar is collapsed', () => {
      render(<ClaudeSidebar />);
      
      const sidebar = screen.getByTestId('claude-sidebar');
      expect(sidebar).toHaveClass('collapsed');
    });

    it('should hide title when collapsed', () => {
      render(<ClaudeSidebar />);
      
      expect(screen.queryByText('Pine Genie')).not.toBeInTheDocument();
    });

    it('should hide navigation text when collapsed', () => {
      render(<ClaudeSidebar />);
      
      expect(screen.queryByText('New Chat')).not.toBeInTheDocument();
      expect(screen.queryByText('Chat History')).not.toBeInTheDocument();
      expect(screen.queryByText('Spec Planning')).not.toBeInTheDocument();
      expect(screen.queryByText('Visual Builder')).not.toBeInTheDocument();
      
      // Chat history list should also be hidden when collapsed
      expect(screen.queryByTestId('chat-history-list')).not.toBeInTheDocument();
      
      // User profile section should be in collapsed state
      expect(screen.getByTestId('user-profile-section')).toHaveClass('collapsed');
      expect(screen.queryByText('Pine Genie User')).not.toBeInTheDocument();
    });

    it('should update ARIA attributes when collapsed', () => {
      render(<ClaudeSidebar />);
      
      const toggleButton = screen.getByTestId('sidebar-toggle-button');
      expect(toggleButton).toHaveAttribute('aria-label', 'Expand sidebar');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should show expand icon when collapsed', () => {
      render(<ClaudeSidebar />);
      
      const toggleButton = screen.getByTestId('sidebar-toggle-button');
      const icon = toggleButton.querySelector('svg path');
      expect(icon).toHaveAttribute('d', 'M9 18l6-6-6-6'); // Expand icon path
    });
  });

  describe('Expanded State', () => {
    it('should show collapse icon when expanded', () => {
      render(<ClaudeSidebar />);
      
      const toggleButton = screen.getByTestId('sidebar-toggle-button');
      const icon = toggleButton.querySelector('svg path');
      expect(icon).toHaveAttribute('d', 'M15 18l-6-6 6-6'); // Collapse icon path
    });

    it('should show chat history list when expanded', () => {
      render(<ClaudeSidebar />);
      
      // The ChatHistoryList component should be rendered when sidebar is expanded
      expect(screen.getByTestId('chat-history-list')).toBeInTheDocument();
    });
  });

  describe('Toggle Functionality', () => {
    it('should call toggleSidebar when toggle button is clicked', () => {
      render(<ClaudeSidebar />);
      
      const toggleButton = screen.getByTestId('sidebar-toggle-button');
      fireEvent.click(toggleButton);
      
      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
    });

    it('should call toggleSidebar when Enter key is pressed on toggle button', () => {
      render(<ClaudeSidebar />);
      
      const toggleButton = screen.getByTestId('sidebar-toggle-button');
      fireEvent.keyDown(toggleButton, { key: 'Enter' });
      
      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
    });

    it('should call toggleSidebar when Space key is pressed on toggle button', () => {
      render(<ClaudeSidebar />);
      
      const toggleButton = screen.getByTestId('sidebar-toggle-button');
      fireEvent.keyDown(toggleButton, { key: ' ' });
      
      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
    });

    it('should not call toggleSidebar for other keys', () => {
      render(<ClaudeSidebar />);
      
      const toggleButton = screen.getByTestId('sidebar-toggle-button');
      fireEvent.keyDown(toggleButton, { key: 'Tab' });
      
      expect(mockToggleSidebar).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Buttons', () => {
    it('should have proper titles for tooltips', () => {
      render(<ClaudeSidebar />);
      
      expect(screen.getByTestId('new-chat-button')).toHaveAttribute('title', 'Start new chat');
      expect(screen.getByTestId('chat-history-button')).toHaveAttribute('title', 'Chat history');
      expect(screen.getByTestId('spec-planning-button')).toHaveAttribute('title', 'Spec planning');
      expect(screen.getByTestId('visual-builder-button')).toHaveAttribute('title', 'Visual builder');
    });

    it('should have proper ARIA labels', () => {
      render(<ClaudeSidebar />);
      
      expect(screen.getByTestId('new-chat-button')).toHaveAttribute('aria-label', 'Start new chat');
      expect(screen.getByTestId('chat-history-button')).toHaveAttribute('aria-label', 'Chat history');
      expect(screen.getByTestId('spec-planning-button')).toHaveAttribute('aria-label', 'Spec planning');
      expect(screen.getByTestId('visual-builder-button')).toHaveAttribute('aria-label', 'Visual builder');
    });

    it('should render all SVG icons', () => {
      render(<ClaudeSidebar />);
      
      const buttons = [
        'new-chat-button',
        'chat-history-button', 
        'spec-planning-button',
        'visual-builder-button'
      ];
      
      buttons.forEach(buttonTestId => {
        const button = screen.getByTestId(buttonTestId);
        const icon = button.querySelector('svg');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle mobile state', () => {
      mockUseClaudeLayoutStore.mockReturnValue({
        ...defaultStoreState,
        isMobile: true,
        isTablet: false,
        isDesktop: false,
      });
      
      render(<ClaudeSidebar />);
      
      const sidebar = screen.getByTestId('claude-sidebar');
      expect(sidebar).toBeInTheDocument();
    });

    it('should handle tablet state', () => {
      mockUseClaudeLayoutStore.mockReturnValue({
        ...defaultStoreState,
        isMobile: false,
        isTablet: true,
        isDesktop: false,
      });
      
      render(<ClaudeSidebar />);
      
      const sidebar = screen.getByTestId('claude-sidebar');
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      render(<ClaudeSidebar className="custom-class" />);
      
      const sidebar = screen.getByTestId('claude-sidebar');
      expect(sidebar).toHaveClass('custom-class');
    });

    it('should preserve default classes with custom className', () => {
      render(<ClaudeSidebar className="custom-class" />);
      
      const sidebar = screen.getByTestId('claude-sidebar');
      expect(sidebar).toHaveClass('claude-sidebar');
      expect(sidebar).toHaveClass('custom-class');
    });
  });
});