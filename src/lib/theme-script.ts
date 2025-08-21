// Theme initialization script that runs before React hydration
export const themeScript = `
(function() {
  try {
    const theme = localStorage.getItem('theme');
    const html = document.documentElement;
    
    // Remove any existing theme classes
    html.classList.remove('light', 'dark');
    
    if (theme === 'dark') {
      html.classList.add('dark');
    } else if (theme === 'light') {
      html.classList.add('light');
    } else {
      // Default to light theme
      html.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  } catch (e) {
    // Fallback to light theme
    document.documentElement.classList.add('light');
  }
})();
`;

export const injectThemeScript = () => {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.innerHTML = themeScript;
    document.head.appendChild(script);
  }
};