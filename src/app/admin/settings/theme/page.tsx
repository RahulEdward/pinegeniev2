'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { ThemeMode } from '@/lib/theme-config';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

const colorOptions = [
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
];

const radiusOptions = [
  { name: 'Small', value: 'sm' },
  { name: 'Medium', value: 'md' },
  { name: 'Large', value: 'lg' },
  { name: 'Extra Large', value: 'xl' },
];

const fontOptions = [
  { name: 'Default', value: 'default' },
  { name: 'Serif', value: 'serif' },
  { name: 'Monospace', value: 'mono' },
];

export default function ThemeSettingsPage() {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [primaryColor, setPrimaryColor] = useState('blue');
  const [borderRadius, setBorderRadius] = useState('md');
  const [animation, setAnimation] = useState(true);
  const [fontFamily, setFontFamily] = useState('default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      // Get theme from localStorage
      const storedConfig = localStorage.getItem('theme-config');
      if (storedConfig) {
        const config = JSON.parse(storedConfig);
        setMode(config.mode || 'system');
        setPrimaryColor(config.primaryColor || 'blue');
        setBorderRadius(config.borderRadius || 'md');
        setAnimation(config.animation !== undefined ? config.animation : true);
        setFontFamily(config.fontFamily || 'default');
      }
    } catch (error) {
      console.error('Error initializing theme settings:', error);
    }
  }, []);

  const saveSettings = () => {
    try {
      const config = {
        mode,
        primaryColor,
        borderRadius,
        animation,
        fontFamily,
      };
      
      localStorage.setItem('theme-config', JSON.stringify(config));
      
      // Apply theme
      if (mode === 'dark') {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
      } else if (mode === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
      }
      
      // Apply primary color
      document.documentElement.style.setProperty('--color-primary', `var(--color-${primaryColor}-500)`);
      
      // Apply border radius
      document.documentElement.style.setProperty('--border-radius', `var(--radius-${borderRadius})`);
      
      // Apply animations
      document.documentElement.classList.toggle('reduce-motion', !animation);
      
      // Apply font family
      document.documentElement.style.setProperty('--font-family', `var(--font-${fontFamily})`);
      
      alert('Theme settings saved successfully!');
    } catch (error) {
      console.error('Error saving theme settings:', error);
      alert('Failed to save theme settings.');
    }
  };

  const resetSettings = () => {
    setMode('system');
    setPrimaryColor('blue');
    setBorderRadius('md');
    setAnimation(true);
    setFontFamily('default');
    
    try {
      localStorage.removeItem('theme-config');
      
      // Apply default theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
      
      // Reset custom properties
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--border-radius');
      document.documentElement.classList.remove('reduce-motion');
      document.documentElement.style.removeProperty('--font-family');
      
      alert('Theme settings reset to defaults!');
    } catch (error) {
      console.error('Error resetting theme settings:', error);
      alert('Failed to reset theme settings.');
    }
  };

  if (!mounted) return null;

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Settings', href: '/admin/settings' },
    { label: 'Theme' },
  ];

  return (
    <AdminLayout 
      title="Theme Settings" 
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex space-x-2">
          <button
            onClick={resetSettings}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Reset
          </button>
          <button
            onClick={saveSettings}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Theme Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setMode('light')}
              className={`flex flex-col items-center p-4 rounded-lg border ${
                mode === 'light' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <Sun className="w-8 h-8 text-gray-900 dark:text-white mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Light Mode</span>
              {mode === 'light' && (
                <div className="mt-2 text-blue-600 dark:text-blue-400">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </button>
            
            <button
              onClick={() => setMode('dark')}
              className={`flex flex-col items-center p-4 rounded-lg border ${
                mode === 'dark' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <Moon className="w-8 h-8 text-gray-900 dark:text-white mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</span>
              {mode === 'dark' && (
                <div className="mt-2 text-blue-600 dark:text-blue-400">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </button>
            
            <button
              onClick={() => setMode('system')}
              className={`flex flex-col items-center p-4 rounded-lg border ${
                mode === 'system' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <Monitor className="w-8 h-8 text-gray-900 dark:text-white mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">System Preference</span>
              {mode === 'system' && (
                <div className="mt-2 text-blue-600 dark:text-blue-400">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Primary Color</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => setPrimaryColor(color.value)}
                className={`flex flex-col items-center p-2 rounded-lg border ${
                  primaryColor === color.value 
                    ? 'border-blue-500' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${color.class} mb-2`}></div>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{color.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Border Radius</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {radiusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setBorderRadius(option.value)}
                className={`flex flex-col items-center p-4 rounded-lg border ${
                  borderRadius === option.value 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`w-12 h-12 bg-blue-500 rounded-${option.value} mb-2`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Font Family</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fontOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFontFamily(option.value)}
                className={`flex flex-col items-center p-4 rounded-lg border ${
                  fontFamily === option.value 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <span 
                  className={`text-xl font-medium text-gray-900 dark:text-white mb-2 ${
                    option.value === 'serif' ? 'font-serif' : 
                    option.value === 'mono' ? 'font-mono' : 'font-sans'
                  }`}
                >
                  Aa
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Animations</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enable or disable UI animations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={animation} 
                onChange={() => setAnimation(!animation)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}