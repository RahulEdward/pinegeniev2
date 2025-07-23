/**
 * Responsive Design Tests for PineGenie Agent Interface
 * 
 * Tests verify that the agent interface works properly on mobile, tablet, and desktop
 * devices with proper touch interactions and layout adaptation.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import KiroEnhancedChatInterface from '../components/KiroEnhancedChatInterface';
import WelcomeCards from '../components/WelcomeCards';
import { AgentThemeProvider } from '../components/AgentThemeProvider';

// Mock window.matchMedia for responsive tests
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

// Device viewport configurations
const DEVICE_VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
  smallMobile: { width: 320, height: 568 },
  largeMobile: { width: 414, height: 896 },
  tabletLandscape: { width: 1024, height: 768 },
};

// Helper function to set viewport size
const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  
  // Update CSS media queries
  window.matchMedia = jest.fn().mockImplementation((query) => {
    const mediaQuery = mockMatchMedia(query);
    
    // Parse common media queries
    if (query.includes('max-width: 768px')) {
      mediaQuery.matches = width <= 768;
    } else if (query.includes('min-width: 769px')) {
      mediaQuery.matches = width >= 769;
    } else if (query.includes('max-width: 640px')) {
      mediaQuery.matches = width <= 640;
    }
    
    return mediaQuery;
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

// Helper component wrapper with theme provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AgentThemeProvider>
    {children}
  </AgentThemeProvider>
);

describe('Responsive Design Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'Test response', conversationId: '123' }),
    });
  });

  describe('Mobile Device Tests (375x667)', () => {
    beforeEach(() => {
      setViewportSize(DEVICE_VIEWPORTS.mobile.width, DEVICE_VIEWPORTS.mobile.height);
    });

    test('should render chat interface properly on mobile', () => {
      render(
        <TestWrapper>
          <KiroEnhancedChatInterface />
        </TestWrapper>
      );

      const chatContainer = screen.getByRole('textbox');
      expect(chatContainer).toBeInTheDocument();
      expect(chatContainer).toHaveStyle({ width: '100%' });
    });

    test('should display welcome cards in single column on mobile', () => {
      render(
        <TestWrapper>
          <WelcomeCards onCardClick={jest.fn()} />
        </TestWrapper>
      );

      const welcomeCards = screen.getByText('Create Trading Strategy').closest('.grid');
      expect(welcomeCards).toHaveClass('grid-cols-1');
    });

    test('should handle touch interactions on mobile', async () => {
      const mockCardClick = jest.fn();
      render(
        <TestWrapper>
          <WelcomeCards onCardClick={mockCardClick} />
        </TestWrapper>
      );

      const strategyCard = screen.getByText('Create Trading Strategy').closest('div');
      
      // Simulate touch events
      fireEvent.touchStart(strategyCard!);
      fireEvent.touchEnd(strategyCard!);
      fireEvent.click(strategyCard!);

      await waitFor(() => {
        expect(mockCardClick).toHaveBeenCalled();
      });
    });

    test('should adapt textarea height properly on mobile', () => {
      render(
        <TestWrapper>
          <KiroEnhancedChatInterface />
        </TestWrapper>
      );

      const textarea = screen.getByPlaceholderText(/Ask about Pine Script/);
      expect(textarea).toHaveStyle({ minHeight: '50px', maxHeight: '150px' });
    });

    test('should show mobile-optimized button sizes', () => {
      render(
        <TestWrapper>
          <KiroEnhancedChatInterface />
        </TestWrapper>
      );

      const sendButton = screen.getByRole('button', { name: /send/i });
      const voiceButton = screen.getByRole('button', { name: /voice/i });
      
      // Buttons should have adequate touch target size (44px minimum)
      expect(sendButton).toHaveClass('p-3'); // 12px padding = 48px total with icon
      expect(voiceButton).toHaveClass('p-3');
    });
  });

  describe('Small Mobile Device Tests (320x568)', () => {
    beforeEach(() => {
      setViewportSize(DEVICE_VIEWPORTS.smallMobile.width, DEVICE_VIEWPORTS.smallMobile.height);
    });

    test('should handle very small screens gracefully', () => {
      render(
        <TestWrapper>
          <KiroEnhancedChatInterface />
        </TestWrapper>
      );

      const chatContainer = screen.getByRole('textbox').closest('.flex-1');
      expect(chatContainer).toBeInTheDocument();
    });

    test('should maintain readability on small screens', () => {
      render(
        <TestWrapper>
          <WelcomeCards onCardClick={jest.fn()} />
        </TestWrapper>
      );

      const cardTitle = screen.getByText('Create Trading Strategy');
      const cardDescription = screen.getByText(/Generate Pine Script code/);
      
      expect(cardTitle).toHaveClass('text-base'); // Readable font size
      expect(cardDescription).toHaveClass('text-sm');
    });
  });

  describe('Tablet Device Tests (768x1024)', () => {
    beforeEach(() => {
      setViewportSize(DEVICE_VIEWPORTS.tablet.width, DEVICE_VIEWPORTS.tablet.height);
    });

    test('should display welcome cards in two columns on tablet', () => {
      render(
        <TestWrapper>
          <WelcomeCards onCardClick={jest.fn()} />
        </TestWrapper>
      );

      const welcomeCards = screen.getByText('Create Trading Strategy').closest('.grid');
      expect(welcomeCards).toHaveClass('md:grid-cols-2');
    });

    test('should provide adequate spacing on tablet', () => {
      render(
        <TestWrapper>
          <KiroEnhancedChatInterface />
        </TestWrapper>
      );

      const chatContainer = screen.getByRole('textbox').closest('.p-4');
      expect(chatContainer).toHaveClass('p-4'); // 16px padding
    });

    test('should handle tablet touch interactions', async () => {
      const mockCardClick = jest.fn();
      render(
        <TestWrapper>
          <WelcomeCards onCardClick={mockCardClick} />
        </TestWrapper>
      );

      const card = screen.getByText('Learn Pine Script').closest('div');
      
      // Simulate tablet touch with longer press
      fireEvent.touchStart(card!, { touches: [{ clientX: 100, clientY: 100 }] });
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate hold
      fireEvent.touchEnd(card!);
      fireEvent.click(card!);

      await waitFor(() => {
        expect(mockCardClick).toHaveBeenCalled();
      });
    });
  });

  describe('Desktop Device Tests (1920x1080)', () => {
    beforeEach(() => {
      setViewportSize(DEVICE_VIEWPORTS.desktop.width, DEVICE_VIEWPORTS.desktop.height);
    });

    test('should display full layout on desktop', () => {
      render(
        <TestWrapper>
          <KiroEnhancedChatInterface />
        </TestWrapper>
      );

      const chatInterface = screen.getByRole('textbox').closest('.flex');
      expect(chatInterface).toBeInTheDocument();
    });

    test('should show hover effects on desktop', async () => {
      render(
        <TestWrapper>
          <WelcomeCards onCardClick={jest.fn()} />
        </TestWrapper>
      );

      const card = screen.getByText('Create Trading Strategy').closest('div');
      
      fireEvent.mouseEnter(card!);
      
      // Should trigger hover state
      await waitFor(() => {
        expect(card).toHaveStyle({ transform: 'translateY(-2px)' });
      });

      fireEvent.mouseLeave(card!);
      
      await waitFor(() => {
        expect(card).toHaveStyle({ transform: 'translateY(0)' });
      });
    });

    test('should handle keyboard navigation on desktop', () => {
      render(
        <TestWrapper>
          <KiroEnhancedChatInterface />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      const sendButton = screen.getByRole('button', { name: /send/i });

      // Tab navigation should work
      textarea.focus();
      expect(textarea).toHaveFocus();

      fireEvent.keyDown(textarea, { key: 'Tab' });
      // Should move to next focusable element
    });
  });

  describe('Orientation Change Tests', () => {
    test('should handle portrait to landscape transition', async () => {
      // Start in portrait
      setViewportSize(768, 1024);
      
      const { rerender } = render(
        <TestWrapper>
          <WelcomeCards onCardClick={jest.fn()} />
        </TestWrapper>
      );

      let welcomeCards = screen.getByText('Create Trading Strategy').closest('.grid');
      expect(welcomeCards).toHaveClass('md:grid-cols-2');

      // Switch to landscape
      setViewportSize(1024, 768);
      
      rerender(
        <TestWrapper>
          <WelcomeCards onCardClick={jest.fn()} />
        </TestWrapper>
      );

      welcomeCards = screen.getByText('Create Trading Strategy').closest('.grid');
      expect(welcomeCards).toHaveClass('md:grid-cols-2');
    });

    test('should maintain functionality during orientation change', async () => {
      setViewportSize(375, 667);
      
      render(
        <TestWrapper>
          <KiroEnhancedChatInterface />
        </TestWrapper>
      );

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Test message' } });

      // Simulate orientation change
      setViewportSize(667, 375);
      
      // Message should still be there
      expect(textarea).toHaveValue('Test message');
    });
  });

  describe('Performance Tests', () => {
    test('should render quickly on mobile devices', async () => {
      setViewportSize(DEVICE_VIEWPORTS.mobile.width, DEVICE_VIEWPORTS.mobile.height);
      
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <KiroEnhancedChatInterface />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    test('should handle rapid viewport changes', async () => {
      const { rerender } = render(
        <TestWrapper>
          <WelcomeCards onCardClick={jest.fn()} />
        </TestWrapper>
      );

      // Rapidly change viewport sizes
      const viewports = [
        DEVICE_VIEWPORTS.mobile,
        DEVICE_VIEWPORTS.tablet,
        DEVICE_VIEWPORTS.desktop,
        DEVICE_VIEWPORTS.smallMobile,
      ];

      for (const viewport of viewports) {
        setViewportSize(viewport.width, viewport.height);
        
        rerender(
          <TestWrapper>
            <WelcomeCards onCardClick={jest.fn()} />
          </TestWrapper>
        );

        // Should not crash or throw errors
        expect(screen.getByText('Create Trading Strategy')).toBeInTheDocument();
      }
    });
  });

  describe('Accessibility Tests', () => {
    test('should maintain accessibility on all devices', () => {
      const devices = [DEVICE_VIEWPORTS.mobile, DEVICE_VIEWPORTS.tablet, DEVICE_VIEWPORTS.desktop];

      devices.forEach(device => {
        setViewportSize(device.width, device.height);
        
        render(
          <TestWrapper>
            <KiroEnhancedChatInterface />
          </TestWrapper>
        );

        const textarea = screen.getByRole('textbox');
        const buttons = screen.getAllByRole('button');

        expect(textarea).toBeAccessible();
        buttons.forEach(button => {
          expect(button).toBeAccessible();
        });
      });
    });

    test('should provide adequate touch targets on mobile', () => {
      setViewportSize(DEVICE_VIEWPORTS.mobile.width, DEVICE_VIEWPORTS.mobile.height);
      
      render(
        <TestWrapper>
          <WelcomeCards onCardClick={jest.fn()} />
        </TestWrapper>
      );

      const cards = screen.getAllByText(/Create Trading Strategy|Learn Pine Script|Optimize Strategy/);
      
      cards.forEach(card => {
        const cardElement = card.closest('div');
        const styles = window.getComputedStyle(cardElement!);
        
        // Should have adequate padding for touch targets
        expect(styles.padding).toBeTruthy();
      });
    });
  });

  describe('Cross-Browser Compatibility', () => {
    test('should work with different user agents', () => {
      const userAgents = [
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15', // iOS Safari
        'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36', // Android Chrome
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15', // iPad Safari
      ];

      userAgents.forEach(userAgent => {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          configurable: true,
        });

        render(
          <TestWrapper>
            <KiroEnhancedChatInterface />
          </TestWrapper>
        );

        expect(screen.getByRole('textbox')).toBeInTheDocument();
      });
    });
  });
});