/**
 * Template Access Guard Component
 * 
 * Controls access to premium templates based on subscription plan
 */

'use client';

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TemplateAccessGuardProps {
  template: {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isOfficial: boolean;
    category: string;
  };
  children: React.ReactNode;
  onUpgradeClick?: () => void;
}

export function TemplateAccessGuard({ 
  template, 
  children, 
  onUpgradeClick 
}: TemplateAccessGuardProps) {
  const { checkTemplateAccess, isFreePlan, loading } = useSubscription();
  const router = useRouter();

  if (loading) {
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Check if user has access to this template
  const hasAccess = checkTemplateAccess(template.difficulty === 'beginner' ? 'basic' : 'premium');

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show premium template overlay for restricted access
  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-purple-50/90 backdrop-blur-sm border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-3">
          <Crown className="h-6 w-6 text-white" />
        </div>
        
        <h3 className="font-bold text-gray-900 mb-2">
          Premium Template
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 max-w-xs">
          {template.name} is available in Pro plan
        </p>

        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              template.difficulty === 'beginner' ? 'bg-green-400' :
              template.difficulty === 'intermediate' ? 'bg-yellow-400' : 'bg-red-400'
            }`}></div>
            <span className="capitalize">{template.difficulty}</span>
          </div>
          {template.isOfficial && (
            <div className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3 text-blue-500" />
              <span>Official</span>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            onUpgradeClick?.();
            router.push('/billing?feature=premium_templates');
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Crown className="h-4 w-4" />
          <span>Upgrade to Access</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// Template card component with built-in access control
interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isOfficial: boolean;
    category: string;
    hasAccess?: boolean;
    requiresUpgrade?: boolean;
  };
  onUse?: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
  className?: string;
}

export function TemplateCard({ 
  template, 
  onUse, 
  onPreview, 
  className = '' 
}: TemplateCardProps) {
  const { checkTemplateAccess } = useSubscription();
  const router = useRouter();

  const hasAccess = template.hasAccess ?? checkTemplateAccess(
    template.difficulty === 'beginner' ? 'basic' : 'premium'
  );

  const handleUseTemplate = () => {
    if (hasAccess) {
      onUse?.(template.id);
    } else {
      router.push('/billing?feature=premium_templates');
    }
  };

  const handlePreviewTemplate = () => {
    if (hasAccess) {
      onPreview?.(template.id);
    } else {
      router.push('/billing?feature=premium_templates');
    }
  };

  return (
    <div className={`relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow ${className}`}>
      {/* Premium Badge */}
      {!hasAccess && (
        <div className="absolute top-3 right-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
            <Crown className="h-3 w-3" />
            <span>Pro</span>
          </div>
        </div>
      )}

      {/* Template Info */}
      <div className="mb-4">
        <h3 className={`text-lg font-semibold text-gray-900 mb-2 ${!hasAccess ? 'opacity-60' : ''}`}>
          {template.name}
        </h3>
        <p className={`text-gray-600 text-sm mb-3 ${!hasAccess ? 'opacity-60' : ''}`}>
          {template.description}
        </p>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              template.difficulty === 'beginner' ? 'bg-green-400' :
              template.difficulty === 'intermediate' ? 'bg-yellow-400' : 'bg-red-400'
            }`}></div>
            <span className="text-gray-500 capitalize">{template.difficulty}</span>
          </div>
          
          <div className="text-gray-400">•</div>
          
          <span className="text-gray-500 capitalize">{template.category}</span>
          
          {template.isOfficial && (
            <>
              <div className="text-gray-400">•</div>
              <div className="flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-blue-500" />
                <span className="text-blue-600">Official</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={handlePreviewTemplate}
          className={`flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            hasAccess 
              ? 'hover:bg-gray-50' 
              : 'opacity-60 cursor-not-allowed'
          }`}
        >
          Preview
        </button>
        
        <button
          onClick={handleUseTemplate}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            hasAccess
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
          } flex items-center justify-center space-x-2`}
        >
          {hasAccess ? (
            <span>Use Template</span>
          ) : (
            <>
              <Crown className="h-4 w-4" />
              <span>Upgrade to Use</span>
            </>
          )}
        </button>
      </div>

      {/* Overlay for restricted templates */}
      {!hasAccess && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-20 rounded-xl pointer-events-none"></div>
      )}
    </div>
  );
}