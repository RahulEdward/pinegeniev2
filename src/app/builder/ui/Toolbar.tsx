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
import { Layers, Sun, Moon, Trash2, Code, Save, ZoomIn, ZoomOut, RotateCcw, ArrowLeft, Book, Bot, Sparkles } from 'lucide-react';
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
  openAIAssistant: () => void;
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
  openUserManual,
  openAIAssistant
}) => {
  const { colors } = useTheme();

  const handleZoomIn = () => setZoom(Math.min(3, zoom * 1.2));
  const handleZoomOut = () => setZoom(Math.max(0.1, zoom / 1.2));
  const handleResetZoom = () => setZoom(1);

  // AI Model Testing Function
  const testAIModels = async () => {
    const testResults = {
      pineGenieAI: { status: 'unknown', response: '', time: 0 },
      chatGPT4: { status: 'unknown', response: '', time: 0 }
    };

    try {
      // Show loading toast
      console.log('🧪 Starting AI Model Tests...');
      
      // Test 1: PineGenie AI (Free) - General Chat
      console.log('Testing PineGenie AI...');
      const startTime1 = Date.now();
      try {
        const response1 = await fetch('/api/builder/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'hello' }],
            modelId: 'pine-genie'
          })
        });
        const data1 = await response1.json();
        testResults.pineGenieAI = {
          status: data1.success ? 'success' : 'error',
          response: data1.response?.message || 'No response',
          time: Date.now() - startTime1
        };
      } catch (error) {
        testResults.pineGenieAI = {
          status: 'error',
          response: `Error: ${error}`,
          time: Date.now() - startTime1
        };
      }

      // Test 2: ChatGPT-4 (Premium) - Strategy Request
      console.log('Testing ChatGPT-4...');
      const startTime2 = Date.now();
      try {
        const response2 = await fetch('/api/builder/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'create simple RSI strategy' }],
            modelId: 'gpt-4'
          })
        });
        const data2 = await response2.json();
        testResults.chatGPT4 = {
          status: data2.success ? 'success' : 'error',
          response: data2.response?.message || 'No response',
          time: Date.now() - startTime2
        };
      } catch (error) {
        testResults.chatGPT4 = {
          status: 'error',
          response: `Error: ${error}`,
          time: Date.now() - startTime2
        };
      }

      // Display Results
      const resultMessage = `
🧪 AI MODEL TEST RESULTS:

📊 PineGenie AI (Free):
Status: ${testResults.pineGenieAI.status.toUpperCase()}
Response Time: ${testResults.pineGenieAI.time}ms
Response: ${testResults.pineGenieAI.response.substring(0, 100)}...

🤖 ChatGPT-4 (Premium):
Status: ${testResults.chatGPT4.status.toUpperCase()}
Response Time: ${testResults.chatGPT4.time}ms
Response: ${testResults.chatGPT4.response.substring(0, 100)}...

✅ Test completed! Check console for full details.
      `;

      alert(resultMessage);
      console.log('🧪 Full Test Results:', testResults);

    } catch (error) {
      console.error('❌ Test failed:', error);
      alert(`❌ AI Model Test Failed: ${error}`);
    }
  };

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
        {/* PineGenie AI Button */}
        <button
          onClick={() => {
            console.log('🤖 Toolbar button clicked!');
            openAIAssistant();
          }}
          className={`flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white rounded-xl transition-all duration-200 shadow-lg animate-pulse`}
          title="Open PineGenie AI - Create strategies with natural language"
        >
          <Sparkles className="w-4 h-4" />
          PineGenie AI
        </button>
        
        {/* TEST AI MODEL Button */}
        <button
          onClick={async () => {
            console.log('🧪 Testing AI Models...');
            await testAIModels();
          }}
          className={`flex items-center gap-2 px-3 py-2 text-xs bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white rounded-lg transition-all duration-200 shadow-md`}
          title="Test AI Model Connections and Responses"
        >
          <Bot className="w-4 h-4" />
          TEST AI MODEL
        </button>
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