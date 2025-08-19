import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Zap, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

interface SaveStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (strategyData: {
    title: string;
    description: string;
    type: 'INDICATOR' | 'STRATEGY' | 'LIBRARY';
    tags: string[];
  }) => Promise<void>;
  nodes: any[];
  connections: any[];
  darkMode?: boolean;
  existingStrategy?: {
    id: string;
    title: string;
    description: string;
    type: string;
  } | null;
}

export default function SaveStrategyModal({ 
  isOpen, 
  onClose, 
  onSave, 
  nodes, 
  connections, 
  darkMode = true,
  existingStrategy 
}: SaveStrategyModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'INDICATOR' | 'STRATEGY' | 'LIBRARY'>('STRATEGY');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (existingStrategy) {
        setTitle(existingStrategy.title);
        setDescription(existingStrategy.description);
        setType(existingStrategy.type as 'INDICATOR' | 'STRATEGY' | 'LIBRARY');
      } else {
        // Generate default title based on components
        const indicatorCount = nodes.filter(n => n.type === 'indicator').length;
        const conditionCount = nodes.filter(n => n.type === 'condition').length;
        const actionCount = nodes.filter(n => n.type === 'action').length;
        
        let defaultTitle = '';
        if (indicatorCount > 0 && actionCount > 0) {
          defaultTitle = 'Trading Strategy';
        } else if (indicatorCount > 0) {
          defaultTitle = 'Custom Indicator';
        } else {
          defaultTitle = 'Pine Script';
        }
        
        setTitle(defaultTitle);
        setDescription(`Generated strategy with ${nodes.length} components and ${connections.length} connections`);
        setType(actionCount > 0 ? 'STRATEGY' : 'INDICATOR');
      }
      setTags([]);
      setTagInput('');
      setError('');
    }
  }, [isOpen, existingStrategy, nodes, connections]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title for your strategy');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        type,
        tags
      });
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save strategy');
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (strategyType: string) => {
    switch (strategyType) {
      case 'STRATEGY': return <Zap className="h-4 w-4" />;
      case 'INDICATOR': return <FileText className="h-4 w-4" />;
      case 'LIBRARY': return <BookOpen className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (strategyType: string) => {
    switch (strategyType) {
      case 'STRATEGY': return 'from-purple-500 to-blue-500';
      case 'INDICATOR': return 'from-blue-500 to-cyan-500';
      case 'LIBRARY': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-2xl rounded-2xl border transition-colors ${
        darkMode
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b transition-colors ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${getTypeColor(type)} rounded-lg flex items-center justify-center`}>
              <Save className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold transition-colors ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {existingStrategy ? 'Update Strategy' : 'Save Strategy'}
              </h2>
              <p className={`text-sm transition-colors ${
                darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
                {nodes.length} components • {connections.length} connections
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className={`p-4 rounded-lg border transition-colors ${
              darkMode 
                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                darkMode
                  ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Enter strategy title"
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className={`block text-sm font-medium mb-3 transition-colors ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['STRATEGY', 'INDICATOR', 'LIBRARY'] as const).map((strategyType) => (
                <button
                  key={strategyType}
                  onClick={() => setType(strategyType)}
                  className={`p-3 border rounded-lg transition-all ${
                    type === strategyType
                      ? `bg-gradient-to-r ${getTypeColor(strategyType)} text-white border-transparent`
                      : darkMode
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    {getTypeIcon(strategyType)}
                    <span className="text-sm font-medium">{strategyType}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                darkMode
                  ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Describe your strategy"
            />
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-sm font-medium mb-2 transition-colors ${
              darkMode ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-1 text-xs rounded-full flex items-center space-x-1 transition-colors ${
                    darkMode
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  darkMode
                    ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                }`}
                placeholder="Add tags (press Enter)"
              />
              <button
                onClick={handleAddTag}
                className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                  darkMode
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Add
              </button>
            </div>
          </div>

          {/* Strategy Summary */}
          <div className={`p-4 rounded-lg transition-colors ${
            darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
          }`}>
            <h4 className={`font-medium mb-2 transition-colors ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Strategy Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className={`transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Components:
                </span>
                <span className={`ml-2 font-medium transition-colors ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {nodes.length}
                </span>
              </div>
              <div>
                <span className={`transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Connections:
                </span>
                <span className={`ml-2 font-medium transition-colors ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {connections.length}
                </span>
              </div>
              <div>
                <span className={`transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Indicators:
                </span>
                <span className={`ml-2 font-medium transition-colors ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {nodes.filter(n => n.type === 'indicator').length}
                </span>
              </div>
              <div>
                <span className={`transition-colors ${
                  darkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  Actions:
                </span>
                <span className={`ml-2 font-medium transition-colors ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {nodes.filter(n => n.type === 'action').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-6 border-t transition-colors ${
          darkMode ? 'border-slate-700' : 'border-gray-200'
        }`}>
          <div className={`text-sm transition-colors ${
            darkMode ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {existingStrategy ? 'Update existing strategy' : 'Save as new strategy'}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={saving}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                darkMode
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className={`px-4 py-2 bg-gradient-to-r ${getTypeColor(type)} text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>{existingStrategy ? 'Update' : 'Save'} Strategy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}