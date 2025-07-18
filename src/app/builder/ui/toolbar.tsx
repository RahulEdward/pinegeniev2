/**
* Toolbar Component - Strategy Builder Controls
* 
* This file contains:
* - Main toolbar for strategy builder interface
* - Save, export, and clear functionality
* - Theme toggle and zoom controls
* - Integration with builder state management
* - Pine Script export functionality
* - Toast notifications for user feedback
*/

import React from 'react';
import Link from 'next/link';
import { Layers, Sun, Moon, Trash2, Code, Save, ZoomIn, ZoomOut, RotateCcw, ArrowLeft, Book } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export interface ToolbarProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  isDark: boolean;
  toggleTheme: () => void;
  clearCanvas: () => void;
  generateScript: () => void;
  saveStrategy: () => void;
  backgroundType: 'grid' | 'dots' | 'lines' | 'clean';
  setBackgroundType: (type: 'grid' | 'dots' | 'lines' | 'clean') => void;
  openUserManual: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  zoom,
  setZoom,
  isDark,
  toggleTheme,
  clearCanvas,
  generateScript,
  saveStrategy,
  backgroundType,
  setBackgroundType,
  openUserManual
}) => {
  const { colors } = useTheme();

  const handleZoomIn = () => setZoom(Math.min(3, zoom * 1.2));
  const handleZoomOut = () => setZoom(Math.max(0.1, zoom / 1.2));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className={`flex items-center justify-between p-4 border-b transition-colors ${
      isDark ? 'bg-slate-800/80 backdrop-blur-xl border-slate-700/50' : 'bg-white/80 backdrop-blur-xl border-gray-200/50'
    }`}>
      {/* Left side - Back Button and Branding */}
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <Link href="/dashboard" className="mr-2">
          <button
            className={`p-2 rounded-full border transition-colors ${
              isDark ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            title="Back to Dashboard"
            style={{ minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl`}>
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}>
              PineGenie Builder
            </h1>
            <p className={`text-xs transition-colors ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Visual Strategy Builder
            </p>
          </div>
        </div>
      </div>
      {/* Right side - Controls */}
      <div className="flex items-center gap-3">
        {/* Background type selector */}
        <div className={`flex items-center gap-1 rounded-xl p-1 border transition-colors ${
          isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-100/50 border-gray-300'
        }`}>
          <button 
            onClick={() => setBackgroundType('clean')}
            className={`p-2 rounded-lg transition-all text-xs font-medium ${
              backgroundType === 'clean' 
                ? isDark ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-900'
                : isDark ? 'text-slate-400 hover:bg-slate-600/50' : 'text-gray-600 hover:bg-gray-200/50'
            }`}
            title="Clean Background"
          >
            Clean
          </button>
          <button 
            onClick={() => setBackgroundType('dots')}
            className={`p-2 rounded-lg transition-all text-xs font-medium ${
              backgroundType === 'dots' 
                ? isDark ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-900'
                : isDark ? 'text-slate-400 hover:bg-slate-600/50' : 'text-gray-600 hover:bg-gray-200/50'
            }`}
            title="Dotted Background"
          >
            Dots
          </button>
          <button 
            onClick={() => setBackgroundType('grid')}
            className={`p-2 rounded-lg transition-all text-xs font-medium ${
              backgroundType === 'grid' 
                ? isDark ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-900'
                : isDark ? 'text-slate-400 hover:bg-slate-600/50' : 'text-gray-600 hover:bg-gray-200/50'
            }`}
            title="Grid Background"
          >
            Grid
          </button>
          <button 
            onClick={() => setBackgroundType('lines')}
            className={`p-2 rounded-lg transition-all text-xs font-medium ${
              backgroundType === 'lines' 
                ? isDark ? 'bg-slate-600 text-white' : 'bg-gray-200 text-gray-900'
                : isDark ? 'text-slate-400 hover:bg-slate-600/50' : 'text-gray-600 hover:bg-gray-200/50'
            }`}
            title="Line Background"
          >
            Lines
          </button>
        </div>
        {/* Zoom controls */}
        <div className={`flex items-center gap-1 rounded-xl p-1 border transition-colors ${
          isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-100/50 border-gray-300'
        }`}>
          <button onClick={handleZoomOut} className={`p-2 hover:${colors.bg.tertiary} rounded-lg transition-all ${colors.text.secondary}`}>
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className={`text-sm px-3 font-mono ${colors.text.secondary} min-w-[60px] text-center`}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={handleZoomIn} className={`p-2 hover:${colors.bg.tertiary} rounded-lg transition-all ${colors.text.secondary}`}>
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className={`w-px h-6 ${colors.border.secondary} mx-1`} />
          <button onClick={handleResetZoom} className={`p-2 hover:${colors.bg.tertiary} rounded-lg transition-all ${colors.text.secondary}`}>
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        {/* User Manual Button */}
        <button
          onClick={openUserManual}
          className={`p-2 ${colors.bg.secondary} hover:${colors.bg.tertiary} ${colors.border.primary} border rounded-xl transition-all duration-200`}
          title="Open User Manual"
        >
          <Book className={`w-5 h-5 ${colors.text.secondary}`} />
        </button>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 ${colors.bg.secondary} hover:${colors.bg.tertiary} ${colors.border.primary} border rounded-xl transition-all duration-200`}
        >
          {isDark ? (
            <Sun className={`w-5 h-5 ${colors.text.secondary}`} />
          ) : (
            <Moon className={`w-5 h-5 ${colors.text.secondary}`} />
          )}
        </button>
        {/* Action buttons */}
        <button
          onClick={clearCanvas}
          className={`flex items-center gap-2 px-4 py-2 text-sm ${colors.bg.secondary} hover:${colors.bg.tertiary} ${colors.border.primary} border ${colors.text.secondary} rounded-xl transition-all duration-200`}
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
        <button
          onClick={generateScript}
          className={`flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r ${colors.accent.blue} hover:opacity-90 text-white rounded-xl transition-all duration-200 shadow-lg`}
        >
          <Code className="w-4 h-4" />
          Generate Script
        </button>
        <button
          onClick={saveStrategy}
          className={`flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r ${colors.accent.green} hover:opacity-90 text-white rounded-xl transition-all duration-200 shadow-lg`}
        >
          <Save className="w-4 h-4" />
          Save Strategy
        </button>
      </div>
    </div>
  );
};

export default Toolbar;