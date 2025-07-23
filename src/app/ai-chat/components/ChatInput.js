'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    };
    
    textarea.addEventListener('input', adjustHeight);
    return () => textarea.removeEventListener('input', adjustHeight);
  }, []);
  
  // Update character count
  const handleInput = (e) => {
    const value = e.target.value;
    setInput(value);
    setCharCount(value.length);
  };
  
  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        // Send message logic would go here
        console.log('Sending message:', input);
        setInput('');
        setCharCount(0);
        
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    }
  };
  
  return (
    <div className="relative">
      <textarea 
        ref={textareaRef}
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyPress}
        placeholder="Ask Pine Genie about Pine Script v6, trading strategies, or code help..."
        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg py-3 px-4 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-12"
        rows={1}
      ></textarea>
      <div className="absolute right-3 bottom-3 flex items-center gap-2 text-xs text-gray-500">
        <span>Press Enter to send, Shift+Enter for new line</span>
        <span>{charCount}/2000</span>
        <button 
          className={`w-8 h-8 rounded-md flex items-center justify-center text-white ${input.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed'}`}
          disabled={!input.trim()}
          onClick={() => {
            if (input.trim()) {
              console.log('Sending message:', input);
              setInput('');
              setCharCount(0);
              
              // Reset textarea height
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
              }
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z"></path>
            <path d="M22 2 11 13"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}