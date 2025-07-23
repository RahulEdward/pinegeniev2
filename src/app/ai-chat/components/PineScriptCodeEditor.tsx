'use client';

import { useState, useEffect } from 'react';
import { pineValidator, ValidationResult } from '@/agents/pinegenie-agent/core/pine-generator/validator';

interface PineScriptCodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  readOnly?: boolean;
  showValidation?: boolean;
}

export default function PineScriptCodeEditor({ 
  code, 
  onChange, 
  readOnly = false, 
  showValidation = true 
}: PineScriptCodeEditorProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (showValidation && code.trim()) {
      const result = pineValidator.validate(code);
      setValidation(result);
    }
  }, [code, showValidation]);

  const handleCodeChange = (newCode: string) => {
    onChange(newCode);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pine-script-strategy.pine';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLineNumbers = () => {
    const lines = code.split('\n');
    return lines.map((_, index) => index + 1);
  };

  const highlightPineScript = (code: string) => {
    // Basic Pine Script syntax highlighting
    const keywords = [
      'strategy', 'indicator', 'library', 'import', 'export',
      'var', 'varip', 'if', 'else', 'for', 'while', 'switch',
      'true', 'false', 'na', 'math', 'ta', 'str', 'array',
      'matrix', 'map', 'color', 'line', 'label', 'table',
      'plot', 'plotshape', 'plotchar', 'plotcandle', 'plotbar',
      'hline', 'fill', 'bgcolor', 'barcolor'
    ];

    const functions = [
      'ta.sma', 'ta.ema', 'ta.rsi', 'ta.macd', 'ta.bb', 'ta.stoch',
      'ta.atr', 'ta.cci', 'ta.mfi', 'ta.adx', 'ta.crossover', 'ta.crossunder',
      'math.abs', 'math.max', 'math.min', 'math.round', 'math.floor', 'math.ceil',
      'strategy.entry', 'strategy.exit', 'strategy.close', 'strategy.cancel'
    ];

    let highlighted = code;

    // Highlight comments
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="text-green-400">$1</span>');

    // Highlight strings
    highlighted = highlighted.replace(/(".*?")/g, '<span class="text-yellow-300">$1</span>');
    highlighted = highlighted.replace(/('.*?')/g, '<span class="text-yellow-300">$1</span>');

    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="text-blue-300">$1</span>');

    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-purple-400 font-semibold">${keyword}</span>`);
    });

    // Highlight functions
    functions.forEach(func => {
      const regex = new RegExp(`\\b${func.replace('.', '\\.')}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-cyan-400">${func}</span>`);
    });

    return highlighted;
  };

  return (
    <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span className="text-sm text-gray-300">Pine Script v6</span>
          {validation && (
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Valid
                </span>
              ) : (
                <button
                  onClick={() => setShowErrors(!showErrors)}
                  className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {validation.errors.length} errors
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="text-gray-400 hover:text-white p-1 rounded"
            title="Copy to clipboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={downloadCode}
            className="text-gray-400 hover:text-white p-1 rounded"
            title="Download file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Panel */}
      {showErrors && validation && !validation.isValid && (
        <div className="bg-red-900/20 border-b border-red-700/50 p-3">
          <div className="text-sm text-red-300 space-y-1">
            {validation.errors.map((error, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-red-400 text-xs mt-0.5">Line {error.line}:</span>
                <span>{error.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Editor */}
      <div className="relative">
        <div className="flex">
          {/* Line Numbers */}
          <div className="bg-gray-800/50 px-3 py-4 text-xs text-gray-500 select-none border-r border-gray-700">
            {getLineNumbers().map(num => (
              <div key={num} className="leading-6 text-right">
                {num}
              </div>
            ))}
          </div>

          {/* Code Content */}
          <div className="flex-1 relative">
            {readOnly ? (
              <pre className="p-4 text-sm text-gray-100 font-mono leading-6 overflow-x-auto">
                <code dangerouslySetInnerHTML={{ __html: highlightPineScript(code) }} />
              </pre>
            ) : (
              <textarea
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full h-96 p-4 text-sm text-gray-100 bg-transparent font-mono leading-6 resize-none focus:outline-none"
                placeholder="// Pine Script v6 code here..."
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>Pine Script v6 • {code.split('\n').length} lines</span>
          {validation && (
            <span>
              {validation.warnings.length > 0 && `${validation.warnings.length} warnings`}
              {validation.suggestions.length > 0 && ` • ${validation.suggestions.length} suggestions`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}