"use client";

import { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';



// Sidebar menu items
const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
  { id: 'scripts', label: 'My Scripts', icon: Code, path: '/scripts' },
  { id: 'builder', label: 'Script Builder', icon: Zap, path: '/builder' },
  { id: 'pinegenie-ai', label: 'Pine Genie AI', icon: Bot, path: '/pinegenie-ai' },
  { id: 'templates', label: 'Templates', icon: FileText, path: '/templates' },
  { id: 'library', label: 'Library', icon: BookOpen, path: '/library' },
  { id: 'projects', label: 'Projects', icon: Folder, path: '/projects' },
];

const bottomSidebarItems = [
  { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/help' },
  { id: 'billing', label: 'Billing', icon: CreditCard, path: '/billing' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
];

export default function PineGenieDashboard() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode to match landing page
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // NextAuth session management
  const { data: session, status } = useSession();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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
      <div className={`min-h-screen flex transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-900' 
          : 'bg-gray-50'
      }`} style={{
        backgroundImage: darkMode 
          ? 'radial-gradient(circle, rgba(100, 116, 139, 0.1) 1px, transparent 1px)'
          : 'radial-gradient(circle, rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}>
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 border-r transition-all duration-300 ${
          darkMode 
            ? 'bg-slate-800/90 backdrop-blur-xl border-slate-700/50' 
            : 'bg-white/95 backdrop-blur-xl border-gray-200/50'
        } ${sidebarOpen ? 'w-64' : 'w-16'}`}>
          {/* Sidebar Header */}
          <div className={`flex items-center justify-between h-16 px-4 border-b transition-colors ${
            darkMode ? 'border-slate-700/50' : 'border-gray-200'
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
              className={`p-2 rounded border transition-colors ${
                darkMode 
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
            <div className={`p-4 border-b transition-colors ${
              darkMode ? 'border-slate-700/50' : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full ring-2 ring-blue-500/20 overflow-hidden">
                  <Image 
                    src={session.user.image || '/default-avatar.png'}
                    alt={session.user.name || 'User'}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate transition-colors ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {session.user.name || 'User'}
                  </p>
                  <p className={`text-xs truncate transition-colors ${
                    darkMode ? 'text-slate-400' : 'text-gray-500'
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
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
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

          {/* Bottom Navigation */}
          <div className={`px-3 py-4 border-t transition-colors ${
            darkMode ? 'border-slate-700/50' : 'border-gray-200'
          }`}>
            <nav className="space-y-1">
              {bottomSidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
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
          <header className={`shadow-sm border-b transition-colors relative ${
            darkMode 
              ? 'bg-slate-800/80 backdrop-blur-xl border-slate-700/50' 
              : 'bg-white/95 backdrop-blur-xl border-gray-200/50'
          }`} style={{ zIndex: 10 }}>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Left Side - Page Title */}
                <div className="flex items-center">
                  <h1 className={`text-xl font-semibold capitalize flex items-center gap-2 transition-colors ${
                    darkMode ? 'text-white' : 'text-gray-900'
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
                      <Search className={`h-4 w-4 transition-colors ${
                        darkMode ? 'text-slate-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search strategies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-lg leading-5 backdrop-blur-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        darkMode 
                          ? 'border-slate-600 bg-slate-700/50 text-white placeholder-slate-400'
                          : 'border-gray-300 bg-white/50 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  {/* Notifications */}
                  <button className={`p-2 transition-colors relative ${
                    darkMode 
                      ? 'text-slate-400 hover:text-slate-300' 
                      : 'text-gray-400 hover:text-gray-500'
                  }`}>
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                  </button>

                  {/* Theme Toggle */}
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2 transition-colors ${
                      darkMode 
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
                        className={`fixed right-4 top-16 w-56 rounded-lg shadow-2xl py-1 ring-1 focus:outline-none border transition-colors ${
                          darkMode 
                            ? 'bg-slate-800 backdrop-blur-xl ring-slate-700/50 border-slate-700/50'
                            : 'bg-white backdrop-blur-xl ring-gray-200/50 border-gray-200/50'
                        }`} 
                        style={{ zIndex: 999999 }}
                      >
                        <div className={`px-4 py-3 border-b transition-colors ${
                          darkMode ? 'border-slate-700/50' : 'border-gray-200/50'
                        }`}>
                          <p className={`text-sm font-medium transition-colors ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {session?.user?.name || 'User'}
                          </p>
                          <p className={`text-xs truncate transition-colors ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
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
                            className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors ${
                              darkMode 
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
                            className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors ${
                              darkMode 
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
                <div className={`backdrop-blur-xl rounded-2xl border p-8 transition-colors ${
                  darkMode 
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
                    <p className={`mb-8 text-lg transition-colors ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
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
            {activePage === 'scripts' && (
              <div className="space-y-6">
                <div className={`backdrop-blur-xl rounded-2xl border p-8 transition-colors ${
                  darkMode 
                    ? 'bg-slate-800/50 border-slate-700/50' 
                    : 'bg-white/70 border-gray-200/50 shadow-lg'
                }`}>
                  <div className="text-center">
                    <Code className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <h2 className={`text-2xl font-bold mb-2 transition-colors ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>My Scripts</h2>
                    <p className={`mb-6 transition-colors ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
                    }`}>
                      Manage and view all your Pine Script indicators and strategies.
                    </p>
                    <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg">
                      Create New Script
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Script Builder Content */}
            {activePage === 'builder' && (
              <div className="space-y-6">
                <div className={`backdrop-blur-xl rounded-2xl border p-8 transition-colors ${
                  darkMode 
                    ? 'bg-slate-800/50 border-slate-700/50' 
                    : 'bg-white/70 border-gray-200/50 shadow-lg'
                }`}>
                  <div className="text-center">
                    <Zap className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <h2 className={`text-2xl font-bold mb-2 transition-colors ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>Script Builder</h2>
                    <p className={`mb-6 transition-colors ${
                      darkMode ? 'text-slate-300' : 'text-gray-600'
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
                
                {/* Recent Strategies Preview */}
                <div className={`backdrop-blur-xl rounded-2xl border p-6 transition-colors ${
                  darkMode 
                    ? 'bg-slate-800/50 border-slate-700/50' 
                    : 'bg-white/70 border-gray-200/50 shadow-lg'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 transition-colors ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Recent Strategies</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 border rounded-lg hover:border-blue-500/50 transition-colors ${
                      darkMode 
                        ? 'bg-slate-700/30 border-slate-600/50' 
                        : 'bg-gray-50/50 border-gray-200/50'
                    }`}>
                      <h4 className={`font-medium mb-2 transition-colors ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>RSI Strategy</h4>
                      <p className={`text-sm transition-colors ${
                        darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>Last edited 2 hours ago</p>
                      <div className="mt-3 flex gap-2">
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">Active</span>
                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">Profitable</span>
                      </div>
                    </div>
                    <div className={`p-4 border rounded-lg hover:border-blue-500/50 transition-colors ${
                      darkMode 
                        ? 'bg-slate-700/30 border-slate-600/50' 
                        : 'bg-gray-50/50 border-gray-200/50'
                    }`}>
                      <h4 className={`font-medium mb-2 transition-colors ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>MACD Crossover</h4>
                      <p className={`text-sm transition-colors ${
                        darkMode ? 'text-slate-400' : 'text-gray-500'
                      }`}>Last edited 1 day ago</p>
                      <div className="mt-3 flex gap-2">
                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">Testing</span>
                      </div>
                    </div>
                    <div className={`p-4 border border-dashed rounded-lg hover:border-blue-500/50 transition-colors cursor-pointer ${
                      darkMode 
                        ? 'border-slate-600/50' 
                        : 'border-gray-300/50'
                    }`}>
                      <div className={`text-center transition-colors ${
                        darkMode ? 'text-slate-400' : 'text-gray-400'
                      }`}>
                        <Plus className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Create New Strategy</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pine Genie AI Content */}
            {activePage === 'pinegenie-ai' && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
                  <div className="text-center">
                    <Bot className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Pine Genie AI</h2>
                    <p className="text-slate-300 mb-6">
                      AI-powered assistant for Pine Script development and trading strategies.
                    </p>
                    <button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg">
                      Chat with AI
                    </button>
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