/**
 * Claude Layout State Management - Zustand Store for Claude-style Interface
 * 
 * This file contains:
 * - Layout state management for Claude-style interface
 * - Sidebar and panel state management
 * - Responsive breakpoint handling
 * - Conversation and spec session management
 * - Theme and UI state persistence
 */

import React from 'react';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface LayoutState {
  // Panel States
  sidebarCollapsed: boolean;
  codePanelOpen: boolean;
  specPanelOpen: boolean;
  
  // Current Session States
  currentConversation: string | null;
  activeSpecSession: string | null;
  
  // Responsive States
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  
  // Panel Dimensions
  sidebarWidth: number;
  codePanelWidth: number;
  
  // Theme and UI States
  isDarkMode: boolean;
  fontSize: number;
  autoOpenCodePanel: boolean;
  
  // Actions
  toggleSidebar: () => void;
  toggleCodePanel: () => void;
  toggleSpecPanel: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCodePanelOpen: (open: boolean) => void;
  setSpecPanelOpen: (open: boolean) => void;
  
  // Session Management
  setCurrentConversation: (conversationId: string | null) => void;
  setActiveSpecSession: (specId: string | null) => void;
  
  // Responsive Management
  updateScreenSize: (width: number) => void;
  setResponsiveBreakpoints: () => void;
  
  // Panel Sizing
  setSidebarWidth: (width: number) => void;
  setCodePanelWidth: (width: number) => void;
  
  // Theme Management
  toggleTheme: () => void;
  setFontSize: (size: number) => void;
  setAutoOpenCodePanel: (auto: boolean) => void;
  
  // Utility Functions
  getLayoutClass: () => string;
  shouldShowSidebar: () => boolean;
  shouldShowCodePanel: () => boolean;
  getGridTemplate: () => string;
}

// Responsive breakpoints (matching CSS)
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
};

// Default panel widths
const DEFAULT_WIDTHS = {
  sidebar: 280,
  codePanel: 400
};

// Initial state - consistent for SSR
const initialState = {
  sidebarCollapsed: false,
  codePanelOpen: false,
  specPanelOpen: false,
  currentConversation: null,
  activeSpecSession: null,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  screenWidth: 1200, // Default to desktop width for SSR consistency
  sidebarWidth: DEFAULT_WIDTHS.sidebar,
  codePanelWidth: DEFAULT_WIDTHS.codePanel,
  isDarkMode: true,
  fontSize: 14,
  autoOpenCodePanel: true,
};

export const useClaudeLayoutStore = create<LayoutState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Panel Toggle Actions
        toggleSidebar: () => {
          const state = get();
          set({ sidebarCollapsed: !state.sidebarCollapsed });
        },
        
        toggleCodePanel: () => {
          const state = get();
          set({ codePanelOpen: !state.codePanelOpen });
        },
        
        toggleSpecPanel: () => {
          const state = get();
          set({ specPanelOpen: !state.specPanelOpen });
        },
        
        setSidebarCollapsed: (collapsed) => {
          set({ sidebarCollapsed: collapsed });
        },
        
        setCodePanelOpen: (open) => {
          set({ codePanelOpen: open });
        },
        
        setSpecPanelOpen: (open) => {
          set({ specPanelOpen: open });
        },
        
        // Session Management
        setCurrentConversation: (conversationId) => {
          set({ currentConversation: conversationId });
        },
        
        setActiveSpecSession: (specId) => {
          set({ activeSpecSession: specId });
        },
        
        // Responsive Management
        updateScreenSize: (width) => {
          const state = get();
          set({ screenWidth: width });
          state.setResponsiveBreakpoints();
        },
        
        setResponsiveBreakpoints: () => {
          const state = get();
          const { screenWidth } = state;
          
          const isMobile = screenWidth < BREAKPOINTS.mobile;
          const isTablet = screenWidth >= BREAKPOINTS.mobile && screenWidth < BREAKPOINTS.tablet;
          const isDesktop = screenWidth >= BREAKPOINTS.tablet;
          
          set({
            isMobile,
            isTablet,
            isDesktop
          });
          
          // Auto-collapse sidebar on mobile
          if (isMobile && !state.sidebarCollapsed) {
            set({ sidebarCollapsed: true });
          }
          
          // Auto-close code panel on mobile/tablet if not enough space
          if ((isMobile || isTablet) && state.codePanelOpen) {
            set({ codePanelOpen: false });
          }
        },
        
        // Panel Sizing
        setSidebarWidth: (width) => {
          const clampedWidth = Math.max(200, Math.min(400, width));
          set({ sidebarWidth: clampedWidth });
        },
        
        setCodePanelWidth: (width) => {
          const clampedWidth = Math.max(300, Math.min(600, width));
          set({ codePanelWidth: clampedWidth });
        },
        
        // Theme Management
        toggleTheme: () => {
          const state = get();
          set({ isDarkMode: !state.isDarkMode });
        },
        
        setFontSize: (size) => {
          const clampedSize = Math.max(12, Math.min(20, size));
          set({ fontSize: clampedSize });
        },
        
        setAutoOpenCodePanel: (auto) => {
          set({ autoOpenCodePanel: auto });
        },
        
        // Utility Functions
        getLayoutClass: () => {
          const state = get();
          const classes = ['claude-interface'];
          
          if (state.sidebarCollapsed) classes.push('sidebar-collapsed');
          if (state.codePanelOpen) classes.push('code-panel-open');
          if (state.specPanelOpen) classes.push('spec-panel-open');
          if (state.isMobile) classes.push('mobile');
          if (state.isTablet) classes.push('tablet');
          if (state.isDesktop) classes.push('desktop');
          if (state.isDarkMode) classes.push('dark');
          
          return classes.join(' ');
        },
        
        shouldShowSidebar: () => {
          const state = get();
          return !state.isMobile || !state.sidebarCollapsed;
        },
        
        shouldShowCodePanel: () => {
          const state = get();
          return state.codePanelOpen && (state.isDesktop || (!state.isMobile && !state.isTablet));
        },
        
        getGridTemplate: () => {
          const state = get();
          
          if (state.isMobile) {
            // Mobile: Single column, sidebar overlay
            return '1fr';
          }
          
          if (state.isTablet) {
            // Tablet: Sidebar + main, code panel overlay
            const sidebarCol = state.sidebarCollapsed ? '60px' : `${state.sidebarWidth}px`;
            return `${sidebarCol} 1fr`;
          }
          
          // Desktop: All panels visible
          const sidebarCol = state.sidebarCollapsed ? '60px' : `${state.sidebarWidth}px`;
          const codePanelCol = state.codePanelOpen ? `${state.codePanelWidth}px` : '0px';
          
          return `${sidebarCol} 1fr ${codePanelCol}`;
        }
      }),
      {
        name: 'claude-layout-storage',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          codePanelOpen: state.codePanelOpen,
          specPanelOpen: state.specPanelOpen,
          sidebarWidth: state.sidebarWidth,
          codePanelWidth: state.codePanelWidth,
          isDarkMode: state.isDarkMode,
          fontSize: state.fontSize,
          autoOpenCodePanel: state.autoOpenCodePanel,
        })
      }
    ),
    {
      name: 'Claude Layout Store'
    }
  )
);

// Hook for responsive behavior
export const useResponsiveLayout = () => {
  const updateScreenSize = useClaudeLayoutStore(state => state.updateScreenSize);
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    // Mark as client-side after hydration
    setIsClient(true);
    
    const handleResize = () => {
      updateScreenSize(window.innerWidth);
    };
    
    // Set initial size after hydration
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [updateScreenSize]);
  
  return isClient;
};

export default useClaudeLayoutStore;