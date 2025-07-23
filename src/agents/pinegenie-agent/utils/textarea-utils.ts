/**
 * Textarea Utilities
 * 
 * Helper functions for textarea elements
 */

/**
 * Auto-resize a textarea based on its content
 * @param element The textarea element to resize
 */
export const autoResizeTextarea = (element: HTMLTextAreaElement | null): void => {
  if (!element) return;
  
  // Reset height to auto to get the correct scrollHeight
  element.style.height = 'auto';
  
  // Set the height to the scrollHeight
  const newHeight = Math.min(element.scrollHeight, 150);
  element.style.height = `${newHeight}px`;
};

/**
 * Handle textarea input with auto-resize
 * @param e The input event
 */
export const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
  autoResizeTextarea(e.target);
};

/**
 * Initialize auto-resize for a textarea
 * @param textareaRef React ref to the textarea element
 */
export const initAutoResize = (textareaRef: React.RefObject<HTMLTextAreaElement>): void => {
  if (textareaRef.current) {
    autoResizeTextarea(textareaRef.current);
  }
};