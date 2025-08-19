/**
 * Upgrade Prompt Component
 * 
 * Displays contextual upgrade prompts with plan benefits and pricing
 */

'use client';

import React, { useState } from 'react';
import { X, Check, Crown, Zap, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  trigger: string;
  title: string;
  description: string;
  benefits: string[];
  ctaText?: string;
  dismissible?: boolean;
  showComparison?: boolean;
  onDismiss?: () => void;
  onUpgrade?: () => void;
}

export function UpgradePrompt({
  trigger,
  title,
  description,
  benefits,
  ctaText = 'Upgrade Now',
  dismissible = true,
  showComparison = false,
  onDismiss,
  onUpgrade
}: UpgradePromptProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    onUpgrade?.();
    router.push('/billing');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 relative">
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Crown className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 mb-4">
            {description}
          </p>

          <div className="space-y-2 mb-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>

          {showComparison && (
            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Compare Plans</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 mb-2">Free</div>
                  <div className="text-2xl font-bold text-gray-900">₹0</div>
                  <div className="text-xs text-gray-500">Forever</div>
                  <div className="mt-3 space-y-1">
                    <div className="text-xs text-gray-600">• 1 Strategy</div>
                    <div className="text-xs text-gray-600">• Basic Templates</div>
                    <div className="text-xs text-gray-600">• No AI Support</div>
                  </div>
                </div>
                <div className="text-center border-l border-gray-200 pl-4">
                  <div className="text-sm font-medium text-blue-600 mb-2 flex items-center justify-center">
                    <Star className="h-3 w-3 mr-1" />
                    Pro
                  </div>
                  <div className="text-2xl font-bold text-gray-900">₹1,499</div>
                  <div className="text-xs text-gray-500">per month</div>
                  <div className="mt-3 space-y-1">
                    <div className="text-xs text-gray-600">• Unlimited Strategies</div>
                    <div className="text-xs text-gray-600">• All Templates</div>
                    <div className="text-xs text-gray-600">• AI Chat Support</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>{ctaText}</span>
            </button>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Maybe Later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}