'use client';

import { useEffect } from 'react';
import { listenForCodeGenerated, updateCodeInEditor, highlightPineScript } from './utils/chat-code-bridge';

export default function ChatLayout() {
  useEffect(() => {
    // Add ai-chat-active class to body for CSS targeting
    document.body.classList.add('ai-chat-active');

    // Function to hide sidebar when page loads
    const hideSidebar = () => {
      // Try multiple selectors to find the sidebar
      const sidebarSelectors = [
        '.sidebar', 
        'nav[role="navigation"]', 
        '.nav-sidebar', 
        '#sidebar',
        'aside',
        '.side-nav'
      ];
      
      // Try each selector
      sidebarSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          // Add both hidden class and inline style
          element.classList.add('hidden');
          element.style.display = 'none';
          element.style.width = '0';
          element.style.overflow = 'hidden';
        });
      });
      
      // Also add a class to the body for CSS targeting
      document.documentElement.classList.add('hide-sidebar');
    };

    // Function to toggle code editor panel
    const setupEditorToggle = () => {
      const toggleBtn = document.getElementById('toggle-editor-btn');
      const editorPanel = document.getElementById('code-editor-panel');
      
      if (toggleBtn && editorPanel) {
        toggleBtn.addEventListener('click', () => {
          editorPanel.classList.toggle('hidden');
          document.querySelector('.flex-1').classList.toggle('w-full');
        });
      }
    };

    // Setup code bridge to listen for code generation events
    const setupCodeBridge = () => {
      return listenForCodeGenerated((data) => {
        if (data.code) {
          // Update code in editor with syntax highlighting
          const codeElement = document.querySelector('#code-editor-panel code');
          if (codeElement) {
            codeElement.innerHTML = highlightPineScript(data.code);
            
            // Make the code editor visible if it's hidden
            const editorPanel = document.getElementById('code-editor-panel');
            if (editorPanel?.classList.contains('hidden')) {
              editorPanel.classList.remove('hidden');
            }
          }
        }
      });
    };

    // Hide sidebar when page loads
    hideSidebar();
    
    // Setup editor toggle functionality
    setupEditorToggle();
    
    // Setup code bridge
    const cleanupCodeBridge = setupCodeBridge();

    // Cleanup function
    return () => {
      // Remove the ai-chat-active class when component unmounts
      document.body.classList.remove('ai-chat-active');
      
      // Clean up event listeners
      const toggleBtn = document.getElementById('toggle-editor-btn');
      if (toggleBtn) {
        toggleBtn.removeEventListener('click', () => {});
      }
      
      // Clean up code bridge
      cleanupCodeBridge();
    };
  }, []);

  return null;
}