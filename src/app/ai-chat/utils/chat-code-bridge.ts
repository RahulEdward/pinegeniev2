/**
 * Chat-Code Bridge
 * 
 * Utility to facilitate communication between the chat interface and code editor
 */

// Event names
export const EVENTS = {
  CODE_GENERATED: 'pine-code-generated',
  CODE_EXECUTED: 'pine-code-executed',
  CODE_ERROR: 'pine-code-error'
};

// Interface for code generation event
export interface CodeGeneratedEvent {
  code: string;
  title: string;
  description?: string;
}

// Function to dispatch code generated event
export function dispatchCodeGenerated(data: CodeGeneratedEvent): void {
  const event = new CustomEvent(EVENTS.CODE_GENERATED, { 
    detail: data,
    bubbles: true 
  });
  document.dispatchEvent(event);
}

// Function to listen for code generated events
export function listenForCodeGenerated(callback: (data: CodeGeneratedEvent) => void): () => void {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<CodeGeneratedEvent>;
    callback(customEvent.detail);
  };
  
  document.addEventListener(EVENTS.CODE_GENERATED, handler);
  
  // Return cleanup function
  return () => {
    document.removeEventListener(EVENTS.CODE_GENERATED, handler);
  };
}

// Function to update code in editor
export function updateCodeInEditor(code: string): void {
  const codeElement = document.querySelector('#code-editor-panel code');
  if (codeElement) {
    codeElement.textContent = code;
    
    // Make the code editor visible if it's hidden
    const editorPanel = document.getElementById('code-editor-panel');
    if (editorPanel?.classList.contains('hidden')) {
      editorPanel.classList.remove('hidden');
    }
  }
}

// Simple syntax highlighting for Pine Script (basic implementation)
export function highlightPineScript(code: string): string {
  // This is a very basic implementation
  // In a real app, you would use a proper syntax highlighter like Prism.js
  
  const keywords = ['strategy', 'indicator', 'if', 'else', 'for', 'to', 'by', 'while', 'var', 'const', 'input', 'study', 'plot', 'plotshape', 'plotchar', 'plotarrow', 'fill', 'hline', 'vline', 'line', 'label', 'table', 'color', 'true', 'false', 'na'];
  const functions = ['ta\\.\\w+', 'math\\.\\w+', 'strategy\\.\\w+', 'color\\.\\w+', 'time\\.\\w+', 'input\\.\\w+'];
  
  let highlighted = code
    // Comments
    .replace(/(\/\/.*$)/gm, '<span class="pine-comment">$1</span>')
    // Strings
    .replace(/"([^"]*)"/g, '<span class="pine-string">"$1"</span>')
    // Numbers
    .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="pine-number">$1</span>');
  
  // Keywords
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="pine-keyword">$1</span>');
  });
  
  // Functions
  functions.forEach(func => {
    const regex = new RegExp(`(${func})\\(`, 'g');
    highlighted = highlighted.replace(regex, '<span class="pine-function">$1</span>(');
  });
  
  return highlighted;
}