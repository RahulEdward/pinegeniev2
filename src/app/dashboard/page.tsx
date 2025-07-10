"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Code, 
  FileText, 
  Settings, 
  Zap,
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  Home,
  Folder,
  BookOpen,
  HelpCircle,
  Bot,
  CreditCard,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';

// Mock session data for demo
const mockSession = {
  user: {
    name: "Rahul Singh",
    email: "rahul@pinegenie.com",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"
  }
};

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
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Mock authentication check
  const session = mockSession;
  const status = 'authenticated';

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSignOut = async () => {
    try {
      const { signOut } = await import('next-auth/react');
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Sign out error:', error);
      window.location.href = '/api/auth/signout';
    }
  };

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PG</span>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Pine Genie
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* User Profile Section */}
          {sidebarOpen && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Image 
                  src={session.user.image} 
                  alt={session.user.name} 
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {session.user.email}
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
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
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
          <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
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
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
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
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          {/* Top Navigation Bar */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                {/* Left Side - Page Title */}
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
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
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  {/* Notifications */}
                  <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>

                  {/* Theme Toggle */}
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  >
                    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>

                  {/* User Menu */}
                  <div className="relative ml-2">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 focus:outline-none"
                    >
                      <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center overflow-hidden">
                        {session?.user?.image ? (
                          <Image 
                            src={session.user.image} 
                            alt={session.user.name || 'User'} 
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                        )}
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {session?.user?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {session?.user?.email || ''}
                          </p>
                        </div>
                        <div className="py-1">
                          <button
                            onClick={() => setActivePage('settings')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Settings
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
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
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="text-center">
                    <Home className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Welcome to Pine Genie Dashboard! 🚀
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Your AI-powered Pine Script builder and trading assistant.
                    </p>
                    <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Scripts Content */}
            {activePage === 'scripts' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="text-center">
                    <Code className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Scripts</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Manage and view all your Pine Script indicators and strategies.
                    </p>
                    <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
                      Create New Script
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Script Builder Content */}
            {activePage === 'builder' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="text-center">
                    <Zap className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Script Builder</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Build professional Pine Script indicators without coding knowledge.
                    </p>
                    <Link href="/builder" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all inline-block">
                      Launch Builder
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Pine Genie AI Content */}
            {activePage === 'pinegenie-ai' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="text-center">
                    <Bot className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pine Genie AI</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      AI-powered assistant for Pine Script development and trading strategies.
                    </p>
                    <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
                      Chat with AI
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Templates Content */}
            {activePage === 'templates' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Script Templates</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Browse and use pre-built Pine Script templates for quick start.
                    </p>
                    <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
                      Browse Templates
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Library Content */}
            {activePage === 'library' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="text-center">
                    <BookOpen className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Script Library</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Access community scripts and share your own creations.
                    </p>
                    <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
                      Explore Library
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Projects Content */}
            {activePage === 'projects' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="text-center">
                    <Folder className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Projects</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Organize your scripts into projects for better management.
                    </p>
                    <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
                      Create Project
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Help Content */}
            {activePage === 'help' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="text-center">
                    <HelpCircle className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Help & Support</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Get help with Pine Genie features and Pine Script development.
                    </p>
                    <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
                      Contact Support
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Content */}
            {activePage === 'billing' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="text-center">
                    <CreditCard className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Billing & Subscription</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Manage your subscription and billing information.
                    </p>
                    <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all">
                      Manage Subscription
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Content */}
            {activePage === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                  <div className="text-center">
                    <Settings className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Update your account preferences and settings.
                    </p>
                    <div className="space-x-4">
                      <button className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                        Save Changes
                      </button>
                      <button 
                        onClick={handleSignOut}
                        className="border border-red-500 text-red-500 px-6 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
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
