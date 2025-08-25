"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import {
  Code,
  FileText,
  Settings,
  Zap,
  Search,
  Bell,
  Moon,
  Sun,
  Home,
  Folder,
  BookOpen,
  HelpCircle,
  Bot,
  CreditCard,
  LogOut,
  User,
  ChevronDown,
  Plus,
  Sparkles,
  Edit,
  Trash2,
  Eye,
  Crown,
  AlertTriangle,

} from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';



// Sidebar menu items - will be filtered based on subscription
const allSidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'scripts', label: 'My Scripts', icon: Code, path: '/scripts' },
  { id: 'builder', label: 'Script Builder', icon: Zap, path: '/builder' },
  { id: 'pinegenie-ai', label: 'Pine Genie AI', icon: Bot, path: '/simple-ai-chat', requiresAI: true },
  { id: 'templates', label: 'Templates', icon: FileText, path: '/templates' },
  { id: 'library', label: 'Library', icon: BookOpen, path: '/library' },
  { id: 'projects', label: 'Projects', icon: Folder, path: '/projects' },
];

const bottomSidebarItems = [
  { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/help' },
  { id: 'billing', label: 'Billing', icon: CreditCard, path: '/billing' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
];



// My Scripts Section Component
function MyScriptsSection({ darkMode, setActivePage }: { darkMode: boolean; setActivePage: (page: string) => void }) {
  const { data: session } = useSession();
  const { subscription, checkScriptStorageLimit } = useSubscription();
  const [scripts, setScripts] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [scriptLimitInfo, setScriptLimitInfo] = useState<any>({});
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });
  const [newScript, setNewScript] = useState({
    title: '',
    description: '',
    type: 'INDICATOR'
  });

  useEffect(() => {
    console.log('Session in MyScriptsSection:', session);
    if (session) {
      fetchScripts();
      checkScriptLimits();
    }
  }, [filters, session]); // eslint-disable-line react-hooks/exhaustive-deps

  const checkScriptLimits = async () => {
    try {
      const limitInfo = await checkScriptStorageLimit();
      setScriptLimitInfo(limitInfo);
    } catch (error) {
      console.error('Error checking script limits:', error);
    }
  };

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
      });

      const response = await fetch(`/api/scripts?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Scripts API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Scripts API response data:', data);
        setScripts(data.data?.scripts || []);
      } else {
        const errorData = await response.json();
        console.error('Scripts API error:', errorData);
        setScripts([]);
      }
    } catch (error) {
      console.error('Failed to fetch scripts:', error);
      setScripts([]);
    } finally {
      setLoading(false);
    }
  };

  const createScript = async () => {
    // Check script storage limit first
    if (!scriptLimitInfo.hasAccess) {
      alert('You have reached your script storage limit. Please upgrade to create more scripts.');
      return;
    }

    try {
      const scriptData = {
        ...newScript,
        code: newScript.code || '//@version=6\nindicator("' + newScript.title + '", overlay=true)\n\n// Your Pine Script v6 code will be generated here\nplot(close, "Close", color=color.blue)',
        status: newScript.code ? 'DRAFT' : 'DRAFT'
      };

      const response = await fetch('/api/scripts', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scriptData),
      });

      console.log('Create script response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Script created successfully:', data);
        setShowCreateModal(false);
        setNewScript({ title: '', description: '', type: 'INDICATOR' });
        fetchScripts();
        checkScriptLimits(); // Refresh limits

        // If no code, redirect to builder
        if (!newScript.code) {
          setTimeout(() => {
            setActivePage('builder');
          }, 500);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to create script:', errorData);
        alert('Failed to create script: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to create script:', error);
      alert('Failed to create script: ' + error.message);
    }
  };

  const deleteScript = async (id: string) => {
    if (!confirm('Are you sure you want to delete this script?')) return;

    try {
      const response = await fetch(`/api/scripts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Delete script response status:', response.status);

      if (response.ok) {
        console.log('Script deleted successfully');
        fetchScripts();
      } else {
        const errorData = await response.json();
        console.error('Failed to delete script:', errorData);
        alert('Failed to delete script: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to delete script:', error);
      alert('Failed to delete script: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500/20 text-green-400';
      case 'DRAFT': return 'bg-yellow-500/20 text-yellow-400';
      case 'ARCHIVED': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-blue-500/20 text-blue-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'STRATEGY': return 'bg-purple-500/20 text-purple-400';
      case 'INDICATOR': return 'bg-blue-500/20 text-blue-400';
      case 'LIBRARY': return 'bg-orange-500/20 text-orange-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Free Plan Notice */}
      {!subscription?.limits?.aiChatAccess && (
        <div className={`backdrop-blur-xl rounded-2xl border p-6 transition-colors ${darkMode
            ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20'
            : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50 shadow-lg'
          }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Welcome to Pine Genie - Free Plan</h3>
                <p className={`transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'
                  }`}>
                  ✅ Visual drag-and-drop builder • ✅ Save 1 strategy • ✅ Basic templates only • ❌ No AI support
                </p>
              </div>
            </div>
            <button
              onClick={() => window.open('/billing', '_blank')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`backdrop-blur-xl rounded-2xl border p-6 transition-colors ${darkMode
          ? 'bg-slate-800/50 border-slate-700/50'
          : 'bg-white/70 border-gray-200/50 shadow-lg'
        }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Code className="h-8 w-8 text-blue-400" />
            <div>
              <h2 className={`text-2xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'
                }`}>My Scripts</h2>
              <p className={`transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'
                }`}>
                Manage your Pine Script indicators and strategies
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (scriptLimitInfo.hasAccess) {
                setShowCreateModal(true);
              } else {
                window.open('/billing', '_blank');
              }
            }}
            className={`px-6 py-2 rounded-lg transition-all shadow-lg flex items-center space-x-2 ${
              scriptLimitInfo.hasAccess
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
            }`}
          >
            {scriptLimitInfo.hasAccess ? (
              <>
                <Plus className="h-4 w-4" />
                <span>New Script</span>
              </>
            ) : (
              <>
                <Crown className="h-4 w-4" />
                <span>Upgrade to Create</span>
              </>
            )}
          </button>
        </div>

        {/* Script Limit Warning */}
        {scriptLimitInfo.limit !== 'unlimited' && (
          <div className={`mb-4 p-4 border rounded-lg transition-colors ${
            scriptLimitInfo.remaining === 0
              ? 'bg-red-500/10 border-red-500/20'
              : scriptLimitInfo.remaining <= 1
              ? 'bg-yellow-500/10 border-yellow-500/20'
              : 'bg-blue-500/10 border-blue-500/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {scriptLimitInfo.remaining === 0 ? (
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                ) : (
                  <Crown className="h-5 w-5 text-blue-400" />
                )}
                <div>
                  <p className={`font-medium ${
                    scriptLimitInfo.remaining === 0 ? 'text-red-400' : 'text-white'
                  }`}>
                    {scriptLimitInfo.remaining === 0 
                      ? 'Script limit reached' 
                      : `${scriptLimitInfo.remaining} script${scriptLimitInfo.remaining === 1 ? '' : 's'} remaining`
                    }
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {subscription?.planDisplayName || 'Free'} plan: {scriptLimitInfo.currentCount}/{scriptLimitInfo.limit} scripts used
                  </p>
                </div>
              </div>
              {scriptLimitInfo.remaining <= 1 && (
                <button
                  onClick={() => window.open('/billing', '_blank')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search scripts..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className={`w-full pl-10 pr-4 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode
                    ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400'
                    : 'border-gray-300 bg-white/50 text-gray-900 placeholder-gray-400'
                  }`}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className={`px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode
                  ? 'border-slate-600 bg-slate-700/50 text-white'
                  : 'border-gray-300 bg-white/50 text-gray-900'
                }`}
            >
              <option value="">All Types</option>
              <option value="INDICATOR">Indicator</option>
              <option value="STRATEGY">Strategy</option>
              <option value="LIBRARY">Library</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className={`px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode
                  ? 'border-slate-600 bg-slate-700/50 text-white'
                  : 'border-gray-300 bg-white/50 text-gray-900'
                }`}
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Scripts Grid */}
      <div className={`backdrop-blur-xl rounded-2xl border transition-colors ${darkMode
          ? 'bg-slate-800/50 border-slate-700/50'
          : 'bg-white/70 border-gray-200/50 shadow-lg'
        }`}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className={`mt-2 transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>Loading scripts...</p>
          </div>
        ) : scripts.length === 0 ? (
          <div className="p-8 text-center">
            <Code className={`h-16 w-16 mx-auto mb-4 transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-400'
              }`} />
            <h3 className={`text-lg font-medium mb-2 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'
              }`}>No scripts yet</h3>
            <p className={`mb-4 transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'
              }`}>
              Create your first Pine Script v6 indicator or strategy using our visual builder
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
              >
                Create Script
              </button>
              <button
                onClick={() => setActivePage('builder')}
                className={`px-6 py-2 border rounded-lg transition-colors ${darkMode
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Open Builder
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scripts.map((script) => (
                <div
                  key={script.id}
                  className={`p-4 border rounded-lg hover:border-blue-500/50 transition-colors ${darkMode
                      ? 'bg-slate-700/30 border-slate-600/50'
                      : 'bg-gray-50/50 border-gray-200/50'
                    }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className={`font-medium transition-colors ${darkMode ? 'text-white' : 'text-gray-900'
                      }`}>{script.title}</h4>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {/* View script */ }}
                        className={`p-1 rounded hover:bg-blue-500/20 transition-colors ${darkMode ? 'text-slate-400 hover:text-blue-400' : 'text-gray-400 hover:text-blue-600'
                          }`}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {script.code && script.code.includes('// Your Pine Script v6 code will be generated here') ? (
                        <button
                          onClick={() => {
                            // Navigate to builder with script ID
                            setActivePage('builder');
                          }}
                          className={`p-1 rounded hover:bg-purple-500/20 transition-colors ${darkMode ? 'text-slate-400 hover:text-purple-400' : 'text-gray-400 hover:text-purple-600'
                            }`}
                          title="Complete in Builder"
                        >
                          <Zap className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {/* Edit script */ }}
                          className={`p-1 rounded hover:bg-green-500/20 transition-colors ${darkMode ? 'text-slate-400 hover:text-green-400' : 'text-gray-400 hover:text-green-600'
                            }`}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteScript(script.id)}
                        className={`p-1 rounded hover:bg-red-500/20 transition-colors ${darkMode ? 'text-slate-400 hover:text-red-400' : 'text-gray-400 hover:text-red-600'
                          }`}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {script.description && (
                    <p className={`text-sm mb-3 transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                      {script.description.length > 100
                        ? `${script.description.substring(0, 100)}...`
                        : script.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${getTypeColor(script.type)}`}>
                        {script.type}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(script.status)}`}>
                        {script.status}
                      </span>
                      {(!script.code || script.code.includes('// Your Pine Script v6 code will be generated here')) && (
                        <span className="px-2 py-1 text-xs rounded bg-orange-500/20 text-orange-400">
                          USE BUILDER
                        </span>
                      )}
                    </div>
                    <p className={`text-xs transition-colors ${darkMode ? 'text-slate-500' : 'text-gray-400'
                      }`}>
                      {new Date(script.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Script Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-2xl border transition-colors ${darkMode
              ? 'bg-slate-800 border-slate-700'
              : 'bg-white border-gray-200'
            }`}>
            <div className={`p-6 border-b transition-colors ${darkMode ? 'border-slate-700' : 'border-gray-200'
              }`}>
              <h3 className={`text-lg font-semibold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'
                }`}>Create New Pine Script v6</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                  Title *
                </label>
                <input
                  type="text"
                  value={newScript.title}
                  onChange={(e) => setNewScript(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode
                      ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                    }`}
                  placeholder="Enter script title"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                  Type
                </label>
                <select
                  value={newScript.type}
                  onChange={(e) => setNewScript(prev => ({ ...prev, type: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode
                      ? 'border-slate-600 bg-slate-700 text-white'
                      : 'border-gray-300 bg-white text-gray-900'
                    }`}
                >
                  <option value="INDICATOR">Indicator</option>
                  <option value="STRATEGY">Strategy</option>
                  <option value="LIBRARY">Library</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                  Description
                </label>
                <textarea
                  value={newScript.description}
                  onChange={(e) => setNewScript(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode
                      ? 'border-slate-600 bg-slate-700 text-white placeholder-slate-400'
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                    }`}
                  placeholder="Describe your script"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                  Script Source
                </label>
                <div className={`p-4 border rounded-md transition-colors ${darkMode
                    ? 'border-slate-600 bg-slate-700/50'
                    : 'border-gray-300 bg-gray-50'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium transition-colors ${darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                        Use Script Builder
                      </p>
                      <p className={`text-xs transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}>
                        Create your Pine Script v6 code using our visual builder
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        // Navigate to script builder
                        setActivePage('builder');
                        setShowCreateModal(false);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-md hover:from-purple-600 hover:to-blue-600 transition-all text-sm"
                    >
                      Open Builder
                    </button>
                  </div>


                </div>
              </div>
            </div>

            <div className={`p-6 border-t flex justify-end space-x-3 transition-colors ${darkMode ? 'border-slate-700' : 'border-gray-200'
              }`}>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`px-4 py-2 border rounded-md transition-colors ${darkMode
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={createScript}
                disabled={!newScript.title}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Script
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PineGenieDashboard() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false); // Initialize with light theme
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // NextAuth session management
  const { data: session, status } = useSession();
  
  // Subscription management
  const { subscription, checkAIChatAccess } = useSubscription();
  
  // Filter sidebar items based on subscription
  const sidebarItems = allSidebarItems.filter(item => {
    if (item.requiresAI) {
      return checkAIChatAccess();
    }
    return true;
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const initializeTheme = () => {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      try {
        const storedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        let shouldBeDark = false;
        
        if (storedTheme === 'dark') {
          shouldBeDark = true;
        } else if (storedTheme === 'light') {
          shouldBeDark = false;
        } else {
          // No stored preference, use system preference but default to light
          shouldBeDark = systemPrefersDark;
          localStorage.setItem('theme', shouldBeDark ? 'dark' : 'light');
        }
        
        setDarkMode(shouldBeDark);
        
        // Ensure HTML class matches
        if (shouldBeDark) {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Error initializing theme:', error);
        // Fallback to light theme
        setDarkMode(false);
        if (typeof document !== 'undefined') {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      }
    };

    initializeTheme();
  }, []);

  useEffect(() => {
    // Update theme when darkMode state changes
    if (typeof window === 'undefined') return;
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleSignOut = async () => {
    try {
      console.log('Signing out...');
      // Use NextAuth signOut
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Sign out error:', error);
      router.push('/');
    }
  };

  // Show loading or redirect if not authenticated
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Router redirect will handle this
  }

  return (
    <div className={`min-h-screen transition-colors duration-300`}>
      <div className={`min-h-screen flex transition-colors duration-300 ${darkMode
          ? 'bg-slate-900'
          : 'bg-gray-50'
        }`} style={{
          backgroundImage: darkMode
            ? 'radial-gradient(circle, rgba(100, 116, 139, 0.1) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}>
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 border-r transition-all duration-300 ${darkMode
            ? 'bg-slate-800/90 backdrop-blur-xl border-slate-700/50'
            : 'bg-white/95 backdrop-blur-xl border-gray-200/50'
          } ${sidebarOpen ? 'w-64' : 'w-16'}`}>
          {/* Sidebar Header */}
          <div className={`flex items-center justify-between h-16 px-4 border-b transition-colors ${darkMode ? 'border-slate-700/50' : 'border-gray-200'
            }`}>
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PG</span>
                </div>
                <span className={`text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}>
                  PineGenie
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded border transition-colors ${darkMode
                  ? 'border-slate-600 hover:bg-slate-700/50 text-slate-300 hover:text-white'
                  : 'border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
            >
              {sidebarOpen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* User Profile Section */}
          {sidebarOpen && session && (
            <div className={`p-4 border-b transition-colors ${darkMode ? 'border-slate-700/50' : 'border-gray-200'
              }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full ring-2 ring-blue-500/20 overflow-hidden">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {session.user.name?.charAt(0)?.toUpperCase() || session.user.email?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate transition-colors ${darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    {session.user.name || 'User'}
                  </p>
                  <p className={`text-xs truncate transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                    {session.user.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <div className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                
                // Special handling for Projects - show as "Invite Only"
                if (item.id === 'projects') {
                  return (
                    <div
                      key={item.id}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg cursor-not-allowed opacity-60 ${darkMode
                          ? 'text-slate-400'
                          : 'text-gray-500'
                        }`}
                      title={!sidebarOpen ? 'Projects - Invite Only' : ''}
                    >
                      <Icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                      {sidebarOpen && (
                        <div className="flex items-center justify-between w-full">
                          <span className={`${darkMode
                              ? 'text-white'
                              : 'text-gray-600'
                            }`}>
                            Invite Only
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.path && (item.id === 'builder' || item.id === 'pinegenie-ai')) {
                        router.push(item.path);
                      } else {
                        setActivePage(item.id);
                      }
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : darkMode
                          ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <Icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                    {sidebarOpen && (
                      <div className="flex items-center justify-between w-full">
                        <span>{item.label}</span>
                        {item.id === 'pinegenie-ai' && (
                          <Crown className="h-3 w-3 text-yellow-400" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Navigation */}
          <div className={`px-3 py-4 border-t transition-colors ${darkMode ? 'border-slate-700/50' : 'border-gray-200'
            }`}>
            <nav className="space-y-1">
              {bottomSidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.path && (item.id === 'billing' || item.id === 'help' || item.id === 'settings')) {
                        router.push(item.path);
                      } else {
                        setActivePage(item.id);
                      }
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : darkMode
                          ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <Icon className={`h-5 w-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`} style={{ zIndex: 1 }}>
          {/* Top Navigation Bar */}
          <header className={`shadow-sm border-b transition-colors relative ${darkMode
              ? 'bg-slate-800/80 backdrop-blur-xl border-slate-700/50'
              : 'bg-white/95 backdrop-blur-xl border-gray-200/50'
            }`} style={{ zIndex: 10 }}>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Left Side - Page Title */}
                <div className="flex items-center">
                  <h1 className={`text-xl font-semibold capitalize flex items-center gap-2 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    <Sparkles className="h-6 w-6 text-blue-400" />
                    {activePage === 'dashboard' ? 'Dashboard' :
                      activePage === 'scripts' ? 'My Scripts' :
                        activePage === 'builder' ? 'Script Builder' :
                          activePage === 'pinegenie-ai' ? 'Pine Genie AI' :
                            activePage === 'templates' ? 'Templates' :
                              activePage === 'library' ? 'Library' :
                                activePage === 'projects' ? 'Projects' :
                                  activePage === 'help' ? 'Help & Support' :
                                    activePage === 'billing' ? 'Billing' :
                                      activePage === 'settings' ? 'Settings' : 'Dashboard'}
                  </h1>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="hidden md:block relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className={`h-4 w-4 transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-400'
                        }`} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search strategies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-lg leading-5 backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${darkMode
                          ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400'
                          : 'border-gray-300 bg-white/50 text-gray-900 placeholder-gray-400'
                        }`}
                    />
                  </div>

                  {/* Notifications */}
                  <button className={`p-2 transition-colors relative ${darkMode
                      ? 'text-slate-400 hover:text-slate-300'
                      : 'text-gray-400 hover:text-gray-500'
                    }`}>
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                  </button>

                  {/* Theme Toggle */}
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2 transition-colors ${darkMode
                        ? 'text-slate-400 hover:text-slate-300'
                        : 'text-gray-400 hover:text-gray-500'
                      }`}
                  >
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>

                  {/* User Menu */}
                  <div className="relative ml-2" style={{ zIndex: 99999 }}>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
                        {session?.user?.image ? (
                          <div className="relative w-8 h-8">
                            <Image
                              src={session.user.image}
                              alt={session.user.name || 'User'}
                              fill
                              className="object-cover rounded-full"
                              sizes="32px"
                            />
                          </div>
                        ) : (
                          <User className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isUserMenuOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div
                        className={`fixed right-4 top-16 w-56 rounded-lg shadow-2xl py-1 ring-1 focus:outline-none border transition-colors ${darkMode
                            ? 'bg-slate-800 backdrop-blur-xl ring-slate-700/50 border-slate-700/50'
                            : 'bg-white backdrop-blur-xl ring-gray-200/50 border-gray-200/50'
                          }`}
                        style={{ zIndex: 999999 }}
                      >
                        <div className={`px-4 py-3 border-b transition-colors ${darkMode ? 'border-slate-700/50' : 'border-gray-200/50'
                          }`}>
                          <p className={`text-sm font-medium transition-colors ${darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                            {session?.user?.name || 'User'}
                          </p>
                          <p className={`text-xs truncate transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-500'
                            }`}>
                            {session?.user?.email || ''}
                          </p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setActivePage('settings');
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors ${darkMode
                                ? 'text-slate-300 hover:bg-slate-700/50'
                                : 'text-gray-700 hover:bg-gray-100'
                              }`}
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Settings
                          </button>
                          <button
                            onClick={() => {
                              handleSignOut();
                              setIsUserMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors ${darkMode
                                ? 'text-red-400 hover:bg-red-900/20'
                                : 'text-red-600 hover:bg-red-50'
                              }`}
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            {/* Dashboard Content */}
            {activePage === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome Section */}
                <div className={`backdrop-blur-xl rounded-2xl border p-8 transition-colors ${darkMode
                    ? 'bg-slate-800/30 border-slate-700/30'
                    : 'bg-white/60 border-gray-200/40 shadow-lg'
                  }`}>
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse" />
                      <div className="relative p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full inline-block">
                        <Home className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                      Welcome to PineGenie Dashboard! 🚀
                    </h2>
                    <p className={`mb-8 text-lg transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>
                      Your AI-powered Pine Script builder and trading assistant.
                    </p>
                    <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-blue-500/25">
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Scripts Content */}
            {activePage === 'scripts' && <MyScriptsSection darkMode={darkMode} setActivePage={setActivePage} />}

            {/* Script Builder Content */}
            {activePage === 'builder' && (
              <div className="space-y-6">
                <div className={`backdrop-blur-xl rounded-2xl border p-8 transition-colors ${darkMode
                    ? 'bg-slate-800/50 border-slate-700/50'
                    : 'bg-white/70 border-gray-200/50 shadow-lg'
                  }`}>
                  <div className="text-center">
                    <Zap className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <h2 className={`text-2xl font-bold mb-2 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'
                      }`}>Script Builder</h2>
                    <p className={`mb-6 transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>
                      Build professional Pine Script indicators without coding knowledge.
                    </p>
                    <a
                      href="/builder"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all inline-block shadow-lg no-underline"
                    >
                      Launch Builder
                    </a>
                  </div>
                </div>


              </div>
            )}



            {/* Other pages with similar styling... */}
            {(activePage === 'templates' || activePage === 'library' || activePage === 'projects' || activePage === 'help' || activePage === 'billing' || activePage === 'settings') && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
                  <div className="text-center">
                    <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">
                        {activePage.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 capitalize">{activePage}</h2>
                    <p className="text-slate-300 mb-6">
                      {activePage === 'templates' && 'Browse and use pre-built Pine Script templates for quick start.'}
                      {activePage === 'library' && 'Access community scripts and share your own creations.'}
                      {activePage === 'projects' && 'Organize your scripts into projects for better management.'}
                      {activePage === 'help' && 'Get help with Pine Genie features and Pine Script development.'}
                      {activePage === 'billing' && 'Manage your subscription and billing information.'}
                      {activePage === 'settings' && 'Update your account preferences and settings.'}
                    </p>
                    <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg">
                      {activePage === 'settings' ? 'Save Changes' : 'Get Started'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}