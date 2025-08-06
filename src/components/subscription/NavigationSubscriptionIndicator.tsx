/**
 * Navigation Subscription Indicator Component
 * 
 * Shows subscription status and restrictions in navigation menus
 */

'use client';

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Lock, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavigationSubscriptionIndicatorProps {
  menuItem: {
    id: string;
    label: string;
    icon: React.ComponentType<any>;
    path: string;
  };
  darkMode?: boolean;
  onClick?: () => void;
}

export function NavigationSubscriptionIndicator({ 
  menuItem, 
  darkMode = false,
  onClick 
}: NavigationSubscriptionIndicatorProps) {
  const { checkFeatureAccess, isFreePlan } = useSubscription();
  const router = useRouter();

  // Check if this menu item requires subscription access
  const getFeatureAccess = (itemId: string) => {
    switch (itemId) {
      case 'pinegenie-ai':
      case 'ai-chat':
        return {
          hasAccess: checkFeatureAccess('ai_chat'),
          feature: 'ai_chat',
          upgradeReason: 'AI features require Pro plan'
        };
      case 'templates':
        return {
          hasAccess: true, // Templates page is accessible, but premium templates are restricted
          feature: 'premium_templates',
          upgradeReason: 'Premium templates require Pro plan',
          partialAccess: true
        };
      default:
        return {
          hasAccess: true,
          feature: null,
          upgradeReason: null
        };
    }
  };

  const accessInfo = getFeatureAccess(menuItem.id);
  const IconComponent = menuItem.icon;

  const handleClick = () => {
    if (accessInfo.hasAccess) {
      onClick?.();
      router.push(menuItem.path);
    } else {
      // Show upgrade prompt or redirect to billing
      router.push(`/billing?feature=${accessInfo.feature}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all group ${
        !accessInfo.hasAccess
          ? darkMode
            ? 'text-slate-500 hover:text-slate-400 hover:bg-slate-700/30'
            : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100/50'
          : darkMode
            ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}
      title={!accessInfo.hasAccess ? accessInfo.upgradeReason : undefined}
    >
      <div className="relative">
        <IconComponent className={`h-5 w-5 ${!accessInfo.hasAccess ? 'opacity-50' : ''}`} />
        
        {/* Restriction indicator */}
        {!accessInfo.hasAccess && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <Lock className="h-2 w-2 text-white" />
          </div>
        )}
        
        {/* Partial access indicator */}
        {accessInfo.partialAccess && isFreePlan() && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
            <Crown className="h-2 w-2 text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 text-left">
        <span className={`${!accessInfo.hasAccess ? 'opacity-50' : ''}`}>
          {menuItem.label}
        </span>
        
        {/* Pro indicator */}
        {!accessInfo.hasAccess && (
          <div className="flex items-center space-x-1 mt-0.5">
            <Crown className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-yellow-500">Pro</span>
          </div>
        )}
        
        {/* Partial access indicator */}
        {accessInfo.partialAccess && isFreePlan() && (
          <div className="flex items-center space-x-1 mt-0.5">
            <Zap className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-blue-500">Limited</span>
          </div>
        )}
      </div>

      {/* Upgrade arrow for restricted items */}
      {!accessInfo.hasAccess && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            darkMode 
              ? 'bg-blue-500/20 text-blue-400' 
              : 'bg-blue-100 text-blue-600'
          }`}>
            Upgrade
          </div>
        </div>
      )}
    </button>
  );
}

// Sidebar menu items with subscription awareness
export const getSidebarItemsWithSubscription = () => [
  { id: 'dashboard', label: 'Dashboard', icon: 'Home', path: '/dashboard' },
  { id: 'scripts', label: 'My Scripts', icon: 'Code', path: '/scripts' },
  { id: 'builder', label: 'Script Builder', icon: 'Zap', path: '/builder' },
  { id: 'pinegenie-ai', label: 'Pine Genie AI', icon: 'Bot', path: '/ai-chat', requiresPro: true },
  { id: 'templates', label: 'Templates', icon: 'FileText', path: '/templates', partialAccess: true },
  { id: 'library', label: 'Library', icon: 'BookOpen', path: '/library' },
  { id: 'projects', label: 'Projects', icon: 'Folder', path: '/projects' },
];

// Quick subscription status for header
export function HeaderSubscriptionStatus({ darkMode = false }: { darkMode?: boolean }) {
  const { subscription, isFreePlan, loading } = useSubscription();
  const router = useRouter();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-16 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      {isFreePlan() ? (
        <button
          onClick={() => router.push('/billing')}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            darkMode
              ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>Free</span>
          <Crown className="h-3 w-3 text-yellow-500" />
        </button>
      ) : (
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
          darkMode
            ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400'
            : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700'
        }`}>
          <Crown className="h-3 w-3" />
          <span>Pro</span>
        </div>
      )}
    </div>
  );
}