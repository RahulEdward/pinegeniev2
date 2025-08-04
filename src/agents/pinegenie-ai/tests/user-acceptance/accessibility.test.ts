/**
 * Accessibility and Usability - User Acceptance Tests
 * Tests accessibility compliance and usability features
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { accessibilityScenarios } from '../fixtures/user-scenarios';
import { createTestUtils } from '../helpers/test-utils';

// Mock accessibility testing utilities
jest.mock('@testing-library/jest-dom');

describe('Accessibility and Usability - User Acceptance Tests', () => {
  let testUtils: ReturnType<typeof createTestUtils>;

  beforeEach(() => {
    testUtils = createTestUtils();
    jest.clearAllMocks();
  });

  afterEach(() => {
    testUtils.cleanup();
  });

  describe('Keyboard Navigation', () => {
    test('should support full keyboard navigation', async () => {
      const chatInterface = await testUtils.renderChatInterface();
      
      // Test tab navigation
      const tabbableElements = chatInterface.getAllTabbableElements();
      expect(tabbableElements.length).toBeGreaterThan(5);
      
      // Test tab order is logical
      const tabOrder = tabbableElements.map(el => el.getAttribute('data-testid'));
      expect(tabOrder).toEqual([
        'chat-input',
        'send-button',
        'clear-button',
        'help-button',
        'settings-button'
      ]);
      
      // Test Enter key activation
      const sendButton = chatInterface.getByTestId('send-button');
      await testUtils.pressKey('Enter', sendButton);
      expect(sendButton.getAttribute('aria-pressed')).toBe('true');
    });

    test('should handle arrow key navigation in lists and menus', async () => {
      const suggestionList = await testUtils.renderSuggestionList([
        'Create RSI strategy',
        'Create MA crossover',
        'Create MACD strategy'
      ]);
      
      // Test arrow key navigation
      await testUtils.pressKey('ArrowDown');
      expect(suggestionList.getActiveItem().textContent).toBe('Create RSI strategy');
      
      await testUtils.pressKey('ArrowDown');
      expect(suggestionList.getActiveItem().textContent).toBe('Create MA crossover');
      
      await testUtils.pressKey('ArrowUp');
      expect(suggestionList.getActiveItem().textContent).toBe('Create RSI strategy');
      
      // Test Enter key selection
      await testUtils.pressKey('Enter');
      expect(suggestionList.getSelectedItem().textContent).toBe('Create RSI strategy');
    });

    test('should support Escape key for modal dismissal', async () => {
      const modal = await testUtils.openModal('strategy-help');
      expect(modal.isVisible()).toBe(true);
      
      await testUtils.pressKey('Escape');
      expect(modal.isVisible()).toBe(false);
    });

    test('should maintain focus management during dynamic content changes', async () => {
      const chatInterface = await testUtils.renderChatInterface();
      
      // Focus on input
      const input = chatInterface.getByTestId('chat-input');
      input.focus();
      expect(document.activeElement).toBe(input);
      
      // Send message and check focus is maintained appropriately
      await testUtils.sendMessage('Create RSI strategy');
      
      // Focus should return to input after response
      await testUtils.waitForResponse();
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Screen Reader Compatibility', () => {
    test('should provide proper ARIA labels and descriptions', async () => {
      const chatInterface = await testUtils.renderChatInterface();
      
      // Check input has proper labeling
      const input = chatInterface.getByTestId('chat-input');
      expect(input.getAttribute('aria-label')).toBe('Enter your strategy request');
      expect(input.getAttribute('aria-describedby')).toBe('input-help-text');
      
      // Check buttons have proper labels
      const sendButton = chatInterface.getByTestId('send-button');
      expect(sendButton.getAttribute('aria-label')).toBe('Send message');
      
      // Check complex components have proper structure
      const messageList = chatInterface.getByTestId('message-list');
      expect(messageList.getAttribute('role')).toBe('log');
      expect(messageList.getAttribute('aria-live')).toBe('polite');
    });

    test('should announce dynamic content changes', async () => {
      const announcements = testUtils.createAriaLiveRegion();
      const chatInterface = await testUtils.renderChatInterface();
      
      // Send message
      await testUtils.sendMessage('Create RSI strategy');
      
      // Should announce AI is thinking
      expect(announcements.getLastAnnouncement()).toContain('AI is processing your request');
      
      // Should announce when response is ready
      await testUtils.waitForResponse();
      expect(announcements.getLastAnnouncement()).toContain('Response received');
    });

    test('should provide alternative text for visual elements', async () => {
      const strategyPreview = await testUtils.renderStrategyPreview({
        type: 'rsi-strategy',
        nodes: 5,
        connections: 4
      });
      
      // Check images have alt text
      const previewImage = strategyPreview.getByTestId('strategy-diagram');
      expect(previewImage.getAttribute('alt')).toBe(
        'RSI strategy diagram with 5 nodes and 4 connections'
      );
      
      // Check complex visuals have descriptions
      const description = strategyPreview.getByTestId('strategy-description');
      expect(description.textContent).toContain('This strategy uses RSI indicator');
    });

    test('should maintain logical heading structure', async () => {
      const helpPage = await testUtils.renderHelpPage();
      
      const headings = helpPage.getAllByRole('heading');
      const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)));
      
      // Should start with h1
      expect(headingLevels[0]).toBe(1);
      
      // Should not skip levels
      for (let i = 1; i < headingLevels.length; i++) {
        const diff = headingLevels[i] - headingLevels[i - 1];
        expect(diff).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Mobile Responsiveness', () => {
    test('should adapt to mobile screen sizes', async () => {
      // Test different viewport sizes
      const viewports = [
        { width: 320, height: 568 }, // iPhone SE
        { width: 375, height: 667 }, // iPhone 8
        { width: 414, height: 896 }, // iPhone 11
        { width: 768, height: 1024 }, // iPad
      ];
      
      for (const viewport of viewports) {
        testUtils.setViewport(viewport.width, viewport.height);
        const chatInterface = await testUtils.renderChatInterface();
        
        // Should be fully visible
        expect(chatInterface.isFullyVisible()).toBe(true);
        
        // Should have touch-friendly targets
        const buttons = chatInterface.getAllByRole('button');
        buttons.forEach(button => {
          const rect = button.getBoundingClientRect();
          expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44); // 44px minimum
        });
        
        // Should not require horizontal scrolling
        expect(document.body.scrollWidth).toBeLessThanOrEqual(viewport.width);
      }
    });

    test('should support touch interactions', async () => {
      testUtils.setViewport(375, 667); // Mobile viewport
      const chatInterface = await testUtils.renderChatInterface();
      
      // Test touch events
      const sendButton = chatInterface.getByTestId('send-button');
      
      await testUtils.touchStart(sendButton);
      expect(sendButton.classList.contains('touch-active')).toBe(true);
      
      await testUtils.touchEnd(sendButton);
      expect(sendButton.getAttribute('aria-pressed')).toBe('true');
    });

    test('should handle virtual keyboard properly', async () => {
      testUtils.setViewport(375, 667);
      const chatInterface = await testUtils.renderChatInterface();
      
      const input = chatInterface.getByTestId('chat-input');
      
      // Simulate virtual keyboard opening
      await testUtils.focusInput(input);
      testUtils.simulateVirtualKeyboard(true);
      
      // Interface should adjust for reduced viewport
      const visibleHeight = testUtils.getVisibleViewportHeight();
      expect(visibleHeight).toBeLessThan(667);
      
      // Input should remain visible
      expect(testUtils.isElementInViewport(input)).toBe(true);
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    test('should meet WCAG color contrast requirements', async () => {
      const chatInterface = await testUtils.renderChatInterface();
      
      // Test text contrast ratios
      const textElements = chatInterface.getAllByRole('text');
      
      for (const element of textElements) {
        const contrast = testUtils.getColorContrast(element);
        
        // Normal text should have 4.5:1 ratio
        if (testUtils.isNormalText(element)) {
          expect(contrast).toBeGreaterThanOrEqual(4.5);
        }
        
        // Large text should have 3:1 ratio
        if (testUtils.isLargeText(element)) {
          expect(contrast).toBeGreaterThanOrEqual(3.0);
        }
      }
    });

    test('should support high contrast mode', async () => {
      testUtils.enableHighContrastMode();
      const chatInterface = await testUtils.renderChatInterface();
      
      // Should apply high contrast styles
      expect(chatInterface.classList.contains('high-contrast')).toBe(true);
      
      // Should maintain readability
      const textElements = chatInterface.getAllByRole('text');
      textElements.forEach(element => {
        const contrast = testUtils.getColorContrast(element);
        expect(contrast).toBeGreaterThanOrEqual(7.0); // Higher standard for high contrast
      });
    });

    test('should not rely solely on color for information', async () => {
      const validationMessage = await testUtils.renderValidationMessage({
        type: 'error',
        message: 'Invalid parameter value'
      });
      
      // Should have icon in addition to color
      const errorIcon = validationMessage.getByTestId('error-icon');
      expect(errorIcon).toBeDefined();
      
      // Should have text description
      expect(validationMessage.textContent).toContain('Error:');
    });
  });

  describe('Reduced Motion Support', () => {
    test('should respect prefers-reduced-motion setting', async () => {
      testUtils.setPrefersReducedMotion(true);
      
      const animation = await testUtils.createStrategyAnimation();
      
      // Should disable or reduce animations
      expect(animation.isAnimationReduced()).toBe(true);
      expect(animation.getAnimationDuration()).toBeLessThan(200); // Very short duration
    });

    test('should provide alternative to motion-based interactions', async () => {
      testUtils.setPrefersReducedMotion(true);
      
      const dragDropInterface = await testUtils.renderDragDropInterface();
      
      // Should provide keyboard alternative
      const keyboardInstructions = dragDropInterface.getByTestId('keyboard-instructions');
      expect(keyboardInstructions.textContent).toContain('Use arrow keys');
      
      // Should provide button-based alternative
      const moveButtons = dragDropInterface.getAllByTestId(/move-\w+-button/);
      expect(moveButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Internationalization and Localization', () => {
    test('should support right-to-left languages', async () => {
      testUtils.setLanguage('ar'); // Arabic
      const chatInterface = await testUtils.renderChatInterface();
      
      // Should apply RTL layout
      expect(chatInterface.getAttribute('dir')).toBe('rtl');
      
      // Should maintain proper text alignment
      const messages = chatInterface.getAllByTestId('message');
      messages.forEach(message => {
        expect(message.style.textAlign).toBe('right');
      });
    });

    test('should handle different text lengths gracefully', async () => {
      const languages = ['en', 'de', 'fi', 'zh']; // Different text expansion ratios
      
      for (const lang of languages) {
        testUtils.setLanguage(lang);
        const chatInterface = await testUtils.renderChatInterface();
        
        // Should not break layout
        expect(chatInterface.isLayoutBroken()).toBe(false);
        
        // Should maintain readability
        const buttons = chatInterface.getAllByRole('button');
        buttons.forEach(button => {
          expect(testUtils.isTextTruncated(button)).toBe(false);
        });
      }
    });
  });

  describe('Performance and Usability', () => {
    test('should maintain responsive interactions', async () => {
      const chatInterface = await testUtils.renderChatInterface();
      
      // Test input responsiveness
      const input = chatInterface.getByTestId('chat-input');
      const startTime = performance.now();
      
      await testUtils.typeText(input, 'Create RSI strategy');
      
      const responseTime = performance.now() - startTime;
      expect(responseTime).toBeLessThan(100); // 100ms for typing response
    });

    test('should provide loading states and feedback', async () => {
      const chatInterface = await testUtils.renderChatInterface();
      
      // Send message
      testUtils.sendMessage('Create complex strategy');
      
      // Should show loading indicator
      const loadingIndicator = chatInterface.getByTestId('loading-indicator');
      expect(loadingIndicator.isVisible()).toBe(true);
      
      // Should show progress if operation takes long
      await testUtils.wait(2000);
      const progressBar = chatInterface.queryByTestId('progress-bar');
      if (progressBar) {
        expect(progressBar.getAttribute('aria-valuenow')).toBeDefined();
      }
    });

    test('should handle errors gracefully with user-friendly messages', async () => {
      // Simulate network error
      testUtils.simulateNetworkError();
      
      const chatInterface = await testUtils.renderChatInterface();
      await testUtils.sendMessage('Create strategy');
      
      // Should show user-friendly error
      const errorMessage = await chatInterface.findByTestId('error-message');
      expect(errorMessage.textContent).not.toContain('500');
      expect(errorMessage.textContent).not.toContain('undefined');
      expect(errorMessage.textContent).toContain('try again');
      
      // Should provide retry option
      const retryButton = chatInterface.getByTestId('retry-button');
      expect(retryButton).toBeDefined();
    });
  });
});