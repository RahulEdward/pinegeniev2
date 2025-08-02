/**
 * Tests for Claude Layout Store
 */

import { renderHook, act } from '@testing-library/react';
import { useClaudeLayoutStore } from '../claude-layout-store';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('useClaudeLayoutStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useClaudeLayoutStore.setState({
      sidebarCollapsed: false,
      codePanelOpen: false,
      specPanelOpen: false,
      currentConversation: null,
      activeSpecSession: null,
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 1200,
      sidebarWidth: 280,
      codePanelWidth: 400,
      isDarkMode: true,
      fontSize: 14,
      autoOpenCodePanel: true,
    });
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useClaudeLayoutStore());
    
    expect(result.current.sidebarCollapsed).toBe(false);
    expect(result.current.codePanelOpen).toBe(false);
    expect(result.current.specPanelOpen).toBe(false);
    expect(result.current.currentConversation).toBe(null);
    expect(result.current.activeSpecSession).toBe(null);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isDarkMode).toBe(true);
  });

  it('should toggle sidebar correctly', () => {
    const { result } = renderHook(() => useClaudeLayoutStore());
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.sidebarCollapsed).toBe(true);
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.sidebarCollapsed).toBe(false);
  });

  it('should toggle code panel correctly', () => {
    const { result } = renderHook(() => useClaudeLayoutStore());
    
    act(() => {
      result.current.toggleCodePanel();
    });
    
    expect(result.current.codePanelOpen).toBe(true);
    
    act(() => {
      result.current.toggleCodePanel();
    });
    
    expect(result.current.codePanelOpen).toBe(false);
  });

  it('should set current conversation', () => {
    const { result } = renderHook(() => useClaudeLayoutStore());
    
    act(() => {
      result.current.setCurrentConversation('test-conversation-id');
    });
    
    expect(result.current.currentConversation).toBe('test-conversation-id');
  });

  it('should set active spec session', () => {
    const { result } = renderHook(() => useClaudeLayoutStore());
    
    act(() => {
      result.current.setActiveSpecSession('test-spec-id');
    });
    
    expect(result.current.activeSpecSession).toBe('test-spec-id');
  });

  it('should update screen size and responsive breakpoints', () => {
    const { result } = renderHook(() => useClaudeLayoutStore());
    
    // Test mobile breakpoint
    act(() => {
      result.current.updateScreenSize(600);
    });
    
    expect(result.current.screenWidth).toBe(600);
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    
    // Test tablet breakpoint
    act(() => {
      result.current.updateScreenSize(900);
    });
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    
    // Test desktop breakpoint
    act(() => {
      result.current.updateScreenSize(1200);
    });
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should generate correct layout class', () => {
    const { result } = renderHook(() => useClaudeLayoutStore());
    
    const layoutClass = result.current.getLayoutClass();
    expect(layoutClass).toContain('claude-interface');
    expect(layoutClass).toContain('desktop');
    expect(layoutClass).toContain('dark');
    
    act(() => {
      result.current.setSidebarCollapsed(true);
      result.current.setCodePanelOpen(true);
    });
    
    const updatedLayoutClass = result.current.getLayoutClass();
    expect(updatedLayoutClass).toContain('sidebar-collapsed');
    expect(updatedLayoutClass).toContain('code-panel-open');
  });

  it('should generate correct grid template', () => {
    const { result } = renderHook(() => useClaudeLayoutStore());
    
    // Desktop with sidebar expanded, code panel closed
    let gridTemplate = result.current.getGridTemplate();
    expect(gridTemplate).toBe('280px 1fr 0px');
    
    // Desktop with sidebar collapsed, code panel open
    act(() => {
      result.current.setSidebarCollapsed(true);
      result.current.setCodePanelOpen(true);
    });
    
    gridTemplate = result.current.getGridTemplate();
    expect(gridTemplate).toBe('60px 1fr 400px');
  });

  it('should handle panel width constraints', () => {
    const { result } = renderHook(() => useClaudeLayoutStore());
    
    // Test sidebar width constraints
    act(() => {
      result.current.setSidebarWidth(100); // Below minimum
    });
    expect(result.current.sidebarWidth).toBe(200); // Should be clamped to minimum
    
    act(() => {
      result.current.setSidebarWidth(500); // Above maximum
    });
    expect(result.current.sidebarWidth).toBe(400); // Should be clamped to maximum
    
    // Test code panel width constraints
    act(() => {
      result.current.setCodePanelWidth(200); // Below minimum
    });
    expect(result.current.codePanelWidth).toBe(300); // Should be clamped to minimum
    
    act(() => {
      result.current.setCodePanelWidth(700); // Above maximum
    });
    expect(result.current.codePanelWidth).toBe(600); // Should be clamped to maximum
  });

  it('should toggle theme correctly', () => {
    const { result } = renderHook(() => useClaudeLayoutStore());
    
    expect(result.current.isDarkMode).toBe(true);
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.isDarkMode).toBe(false);
  });

  it('should handle font size constraints', () => {
    const { result } = renderHook(() => useClaudeLayoutStore());
    
    act(() => {
      result.current.setFontSize(10); // Below minimum
    });
    expect(result.current.fontSize).toBe(12); // Should be clamped to minimum
    
    act(() => {
      result.current.setFontSize(25); // Above maximum
    });
    expect(result.current.fontSize).toBe(20); // Should be clamped to maximum
    
    act(() => {
      result.current.setFontSize(16); // Valid value
    });
    expect(result.current.fontSize).toBe(16);
  });
});