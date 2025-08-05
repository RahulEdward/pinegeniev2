/**
 * Subscription Gate Component
 * 
 * Protects features based on user's subscription plan
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Zap, 
  CreditCard, 
  ArrowRight,
  Sparkles,
  Crown
} from 'lucide-react';

interface SubscriptionGateProps {
  feature: 'ai_chat' | 'script_storage' | string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export default function SubscriptionGate({ 
  feature, 
  children, 
  fallback,
  redirectTo = '/billing'
}: SubscriptionGateProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessInfo, setAccessInfo] = useState<any>({});

  useEffect(() => {
    if (session?.user?.id) {
      checkAccess();
    }
  }, [session, feature]);

  const checkAccess = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subscription/check-access?feature=${feature}`);
      
      if (response.ok) {
        const data = await response.json();
        setHasAccess(data.hasAccess);
        setAccessInfo(data);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Checking access...</p>
        </div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full p-8 w-32 h-32 mx-auto mb-8 flex items-center justify-center">
          {feature === 'ai_chat' ? (
            <Sparkles className="h-16 w-16 text-blue-400" />
          ) : (
            <Lock className="h-16 w-16 text-blue-400" />
          )}
        </div>

        {/* Title & Description */}
        <h1 className="text-4xl font-bold text-white mb-4">
          {feature === 'ai_chat' ? 'Pine Genie AI Chat' : 'Premium Feature'}
        </h1>
        
        <p className="text-xl text-slate-400 mb-8">
          {feature === 'ai_chat' 
            ? 'Get AI-powered Pine Script assistance and advanced strategy optimization'
            : 'This feature requires a premium subscription'
          }
        </p>

        {/* Feature Benefits */}
        {feature === 'ai_chat' && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">What you get with Pine Genie AI:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500/20 rounded-full p-2 mt-1">
                  <Zap className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">AI-Powered Assistance</h3>
                  <p className="text-slate-400 text-sm">
                    Get instant help with Pine Script coding and strategy development
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-purple-500/20 rounded-full p-2 mt-1">
                  <Crown className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Strategy Optimization</h3>
                  <p className="text-slate-400 text-sm">
                    Advanced AI suggestions to improve your trading strategies
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-500/20 rounded-full p-2 mt-1">
                  <Sparkles className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Code Generation</h3>
                  <p className="text-slate-400 text-sm">
                    Generate complex Pine Script code from natural language
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-orange-500/20 rounded-full p-2 mt-1">
                  <CreditCard className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Unlimited Usage</h3>
                  <p className="text-slate-400 text-sm">
                    No limits on AI conversations and code generation
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Plan Info */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6 mb-8">
          <p className="text-slate-400 text-sm mb-2">Your current plan:</p>
          <p className="text-white font-medium text-lg">Free Plan</p>
          <p className="text-slate-500 text-sm">
            • Visual Builder Access
            • Save 1 Script
            • Basic Templates
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push(redirectTo)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-medium transition-all hover:from-blue-600 hover:to-purple-600 shadow-lg flex items-center justify-center"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade to Pro
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Pricing Preview */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm mb-2">Starting at</p>
          <p className="text-3xl font-bold text-white">₹2,499<span className="text-lg text-slate-400">/month</span></p>
          <p className="text-slate-500 text-sm">or ₹24,999/year (save 17%)</p>
        </div>
      </div>
    </div>
  );
}