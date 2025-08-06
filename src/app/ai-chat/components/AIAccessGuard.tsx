/**
 * AI Access Guard Component
 * 
 * Protects AI chat page with subscription-based access control
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  Sparkles, 
  Crown, 
  Zap, 
  MessageSquare, 
  Code, 
  TrendingUp,
  ArrowRight,
  Lock
} from 'lucide-react';

interface AIAccessGuardProps {
  children: React.ReactNode;
}

export function AIAccessGuard({ children }: AIAccessGuardProps) {
  const { checkAIChatAccess, isFreePlan, loading } = useSubscription();
  const router = useRouter();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading AI Chat...</p>
        </div>
      </div>
    );
  }

  // Check if user has AI access
  const hasAccess = checkAIChatAccess();

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show upgrade prompt for free users
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <Lock className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-4">
              Pine Genie AI Chat
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Unlock the power of AI-driven Pine Script development. Get instant assistance, 
              code generation, and strategy optimization from our advanced AI assistant.
            </p>

            <div className="inline-flex items-center bg-orange-500/20 border border-orange-500/30 rounded-full px-6 py-3 text-orange-300">
              <Crown className="h-5 w-5 mr-2" />
              <span className="font-medium">Premium Feature</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Unlimited AI Conversations</h3>
            <p className="text-slate-400">
              Chat with our AI assistant as much as you need. No daily limits or restrictions.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Smart Code Generation</h3>
            <p className="text-slate-400">
              Transform your trading ideas into professional Pine Script code with natural language.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Strategy Optimization</h3>
            <p className="text-slate-400">
              Get AI-powered suggestions to improve your trading strategies and performance.
            </p>
          </div>
        </div>

        {/* What You Get */}
        <div className="bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">What you get with Pro Plan:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            {[
              'Unlimited AI chat conversations',
              'Advanced Pine Script code generation',
              'Strategy optimization suggestions',
              'Real-time coding assistance',
              'Custom indicator recommendations',
              'Market analysis insights',
              'Error debugging help',
              'Performance optimization tips'
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Plan */}
        <div className="bg-slate-800/20 border border-slate-700/20 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div>
              <p className="text-slate-400 text-sm">Your current plan:</p>
              <p className="text-white font-bold text-lg">Free Plan</p>
            </div>
            <div className="text-slate-500">→</div>
            <div>
              <p className="text-blue-400 text-sm">Upgrade to:</p>
              <p className="text-white font-bold text-lg flex items-center">
                <Crown className="h-4 w-4 mr-1 text-yellow-400" />
                Pro Plan
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={() => router.push('/billing')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-medium transition-all hover:from-blue-600 hover:to-purple-600 shadow-lg flex items-center justify-center group"
          >
            <Crown className="h-5 w-5 mr-2" />
            Upgrade to Pro
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-white px-8 py-4 rounded-xl font-medium transition-all"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Pricing */}
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-2">Starting at</p>
          <div className="flex items-center justify-center space-x-4">
            <div>
              <p className="text-3xl font-bold text-white">₹24.99<span className="text-lg text-slate-400">/month</span></p>
              <p className="text-slate-500 text-sm">Monthly billing</p>
            </div>
            <div className="text-slate-500">or</div>
            <div>
              <p className="text-3xl font-bold text-white">₹249.99<span className="text-lg text-slate-400">/year</span></p>
              <p className="text-green-400 text-sm">Save 17%</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-4">
            ✨ 14-day free trial • Cancel anytime • No hidden fees
          </p>
        </div>
      </div>
    </div>
  );
}