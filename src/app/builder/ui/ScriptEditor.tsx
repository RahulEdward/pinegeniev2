import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Eye, Code, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ScriptEditorProps {
  isOpen: boolean;
  onClose: () => void;
  generatedCode: string;
  metadata?: {
    codeLines?: number;
    nodeCount?: number;
    strategyName?: string;
  };
  warnings?: string[];
  darkMode?: boolean;
}

export default function ScriptEditor({ 
  isOpen, 
  onClose, 
  generatedCode, 
  metadata, 
  warnings = [], 
  darkMode = true 
}: ScriptEditorProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'info' | 'warnings'>('code');

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata?.strategyName || 'pine-script'}.pine`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openInTradingView = () => {
    // Copy code to clipboard first
    navigator.clipboard.writeText(generatedCode);
    // Open TradingView Pine Editor
    window.open('https://www.tradingview.com/pine-editor/', '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-4xl h-[85vh] rounded-2xl border shadow-xl transition-colors ${
        darkMode
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b transition-colors ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold transition-colors ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Pine Script Generated Successfully!
              </h2>
              <p className={`text-sm transition-colors ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                {metadata?.codeLines || 0} lines • {metadata?.nodeCount || 0} components • Pine Script v6
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b transition-colors ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'code'
                ? 'border-blue-500 text-blue-500'
                : darkMode
                ? 'border-transparent text-slate-400 hover:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Code className="h-4 w-4 inline mr-2" />
            Pine Script Code
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-blue-500 text-blue-500'
                : darkMode
                ? 'border-transparent text-slate-400 hover:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Info className="h-4 w-4 inline mr-2" />
            Information
          </button>
          {warnings.length > 0 && (
            <button
              onClick={() => setActiveTab('warnings')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'warnings'
                  ? 'border-yellow-500 text-yellow-500'
                  : darkMode
                  ? 'border-transparent text-slate-400 hover:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertCircle className="h-4 w-4 inline mr-2" />
              Warnings ({warnings.length})
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'code' && (
            <div className="h-full flex flex-col">
              {/* Code Actions */}
              <div className={`flex items-center justify-between p-4 border-b transition-colors ${
                darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className={`text-sm font-medium transition-colors ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Ready for TradingView
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleCopy}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      copied
                        ? 'bg-green-500 text-white'
                        : darkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Copy className="h-4 w-4" />
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={openInTradingView}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Open in TradingView</span>
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 overflow-auto">
                <pre className={`p-6 text-sm font-mono leading-relaxed transition-colors ${
                  darkMode
                    ? 'bg-slate-900 text-slate-300'
                    : 'bg-gray-50 text-gray-800'
                }`}>
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="p-6 space-y-6">
              <div className={`p-4 rounded-lg transition-colors ${
                darkMode ? 'bg-slate-700/50' : 'bg-blue-50'
              }`}>
                <h3 className={`font-semibold mb-2 transition-colors ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Generation Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className={`text-sm transition-colors ${
                      darkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Lines of Code
                    </p>
                    <p className={`text-lg font-semibold transition-colors ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {metadata?.codeLines || 0}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm transition-colors ${
                      darkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Components Used
                    </p>
                    <p className={`text-lg font-semibold transition-colors ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {metadata?.nodeCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm transition-colors ${
                      darkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Pine Script Version
                    </p>
                    <p className={`text-lg font-semibold transition-colors ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      v6
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm transition-colors ${
                      darkMode ? 'text-slate-400' : 'text-gray-600'
                    }`}>
                      Status
                    </p>
                    <p className="text-lg font-semibold text-green-500">
                      Ready
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg transition-colors ${
                darkMode ? 'bg-slate-700/50' : 'bg-green-50'
              }`}>
                <h3 className={`font-semibold mb-3 transition-colors ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Next Steps
                </h3>
                <ol className={`space-y-2 text-sm transition-colors ${
                  darkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>Copy the generated Pine Script code using the &quot;Copy Code&quot; button</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>Open TradingView and navigate to the Pine Editor</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>Paste the code and click &quot;Add to Chart&quot; to test your strategy</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                    <span>Backtest and optimize your strategy in TradingView</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'warnings' && warnings.length > 0 && (
            <div className="p-6">
              <div className={`p-4 rounded-lg transition-colors ${
                darkMode ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <h3 className={`font-semibold mb-3 text-yellow-600 transition-colors ${
                  darkMode ? 'text-yellow-400' : 'text-yellow-700'
                }`}>
                  Warnings
                </h3>
                <ul className="space-y-2">
                  {warnings.map((warning, index) => (
                    <li key={index} className={`flex items-start space-x-2 text-sm transition-colors ${
                      darkMode ? 'text-yellow-300' : 'text-yellow-800'
                    }`}>
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t transition-colors ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className={`text-sm transition-colors ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            Generated with PineGenie • Zero-Error Pine Script v6
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                darkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Close
            </button>
            <button
              onClick={openInTradingView}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
            >
              Use in TradingView
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}