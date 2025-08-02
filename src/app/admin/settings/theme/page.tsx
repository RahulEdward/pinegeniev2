'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useRealTheme, type ThemeMode, type PrimaryColor, type BorderRadius, type FontFamily } from '@/lib/theme-manager';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const colorOptions: { name: string; value: PrimaryColor; class: string }[] = [
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
  { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
];

const radiusOptions: { name: string; value: BorderRadius }[] = [
  { name: 'Small', value: 'sm' },
  { name: 'Medium', value: 'md' },
  { name: 'Large', value: 'lg' },
  { name: 'Extra Large', value: 'xl' },
];

const fontOptions: { name: string; value: FontFamily }[] = [
  { name: 'Default', value: 'default' },
  { name: 'Serif', value: 'serif' },
  { name: 'Monospace', value: 'mono' },
];

export default function ThemeSettingsPage() {
  const { config, updateConfig, resetConfig } = useRealTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleModeChange = (mode: ThemeMode) => {
    updateConfig({ mode });
    toast.success(`Theme mode changed to ${mode}`);
  };

  const handleColorChange = (primaryColor: PrimaryColor) => {
    updateConfig({ primaryColor });
    toast.success(`Primary color changed to ${primaryColor}`);
  };

  const handleRadiusChange = (borderRadius: BorderRadius) => {
    updateConfig({ borderRadius });
    toast.success(`Border radius changed to ${borderRadius}`);
  };

  const handleFontChange = (fontFamily: FontFamily) => {
    updateConfig({ fontFamily });
    toast.success(`Font family changed to ${fontFamily}`);
  };

  const handleAnimationToggle = () => {
    const newAnimation = !config.animation;
    updateConfig({ animation: newAnimation });
    toast.success(`Animations ${newAnimation ? 'enabled' : 'disabled'}`);
  };

  const handleSave = () => {
    toast.success('Theme settings saved successfully!');
  };

  const handleReset = () => {
    resetConfig();
    toast.success('Theme settings reset to defaults!');
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
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 admin-rounded hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="admin-button-primary px-4 py-2 text-sm font-medium"
          >
            Save Changes
          </button>
        </div>
      }
    >
      <div className="admin-layout space-y-8">
        <div className="theme-rounded-lg bg-white dark:bg-gray-800 shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Theme Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleModeChange('light')}
              className={`theme-rounded flex flex-col items-center p-4 border transition-all ${
                config.mode === 'light' 
                  ? 'theme-border-primary theme-bg-primary-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Sun className="w-8 h-8 text-gray-900 dark:text-white mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Light Mode</span>
              {config.mode === 'light' && (
                <div className="mt-2 theme-text-primary">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </button>
            
            <button
              onClick={() => handleModeChange('dark')}
              className={`theme-rounded flex flex-col items-center p-4 border transition-all ${
                config.mode === 'dark' 
                  ? 'theme-border-primary theme-bg-primary-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Moon className="w-8 h-8 text-gray-900 dark:text-white mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</span>
              {config.mode === 'dark' && (
                <div className="mt-2 theme-text-primary">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </button>
            
            <button
              onClick={() => handleModeChange('system')}
              className={`theme-rounded flex flex-col items-center p-4 border transition-all ${
                config.mode === 'system' 
                  ? 'theme-border-primary theme-bg-primary-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Monitor className="w-8 h-8 text-gray-900 dark:text-white mb-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">System Preference</span>
              {config.mode === 'system' && (
                <div className="mt-2 theme-text-primary">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </button>
          </div>
        </div>
        
        <div className="theme-rounded-lg bg-white dark:bg-gray-800 shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Primary Color</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className={`theme-rounded flex flex-col items-center p-2 border transition-all ${
                  config.primaryColor === color.value 
                    ? 'theme-border-primary ring-2 ring-offset-2' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                style={config.primaryColor === color.value ? { ringColor: 'var(--theme-primary)' } : {}}
              >
                <div className={`w-8 h-8 theme-rounded ${color.class} mb-2`}></div>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{color.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="admin-card bg-white dark:bg-gray-800 shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Border Radius</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {radiusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRadiusChange(option.value)}
                className={`theme-preview flex flex-col items-center p-4 border transition-all ${
                  config.borderRadius === option.value 
                    ? 'selected admin-border-primary admin-bg-primary-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className={`w-12 h-12 admin-bg-primary rounded-${option.value} mb-2`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="admin-card bg-white dark:bg-gray-800 shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Font Family</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fontOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFontChange(option.value)}
                className={`theme-preview flex flex-col items-center p-4 border transition-all ${
                  config.fontFamily === option.value 
                    ? 'selected admin-border-primary admin-bg-primary-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span 
                  className={`text-xl font-medium text-gray-900 dark:text-white mb-2 font-preview-${option.value}`}
                >
                  Aa
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="admin-card bg-white dark:bg-gray-800 shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Animations</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enable or disable UI animations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={config.animation} 
                onChange={handleAnimationToggle} 
                className="sr-only peer" 
              />
              <div className={`admin-toggle w-11 h-6 rounded-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 ${
                config.animation ? 'checked admin-bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                <div className={`admin-toggle-thumb absolute top-[2px] left-[2px] h-5 w-5 transition-transform ${
                  config.animation ? 'translate-x-full' : 'translate-x-0'
                }`}></div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}