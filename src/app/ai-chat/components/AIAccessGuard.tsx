/**
 * AI Access Guard Component
 * 
 * Protects AI chat page with subscription-based access control
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/hooks/useSubscription';
// Removed lucide-react imports to fix the error

interface AIAccessGuardProps {
  children: React.ReactNode;
}

export function AIAccessGuard({ children }: AIAccessGuardProps) {
  const { checkAIChatAccess, loading } = useSubscription();
  const router = useRouter();

  // Aggressive scroll fix for upgrade page
  React.useEffect(() => {
    // Force scroll on body and html
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.body.style.maxHeight = 'none';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.documentElement.style.maxHeight = 'none';

    // Remove any CSS that blocks scroll
    const style = document.createElement('style');
    style.id = 'scroll-fix-upgrade';
    style.innerHTML = `
      * { 
        overflow: visible !important; 
        max-height: none !important;
      }
      body, html { 
        overflow: auto !important; 
        height: auto !important; 
        max-height: none !important;
      }
      .min-h-screen, 
      .h-screen,
      [class*="min-h-screen"],
      [class*="h-screen"] { 
        height: auto !important; 
        min-height: 100vh !important; 
        max-height: none !important;
      }
      .flex { 
        display: block !important; 
      }
      .items-center,
      .justify-center {
        align-items: flex-start !important;
        justify-content: flex-start !important;
      }
    `;
    document.head.appendChild(style);

    // Force scroll on all elements
    const forceScroll = () => {
      const allElements = document.querySelectorAll('*');
      allElements.forEach((element) => {
        const el = element as HTMLElement;
        if (el.style.overflow === 'hidden') {
          el.style.overflow = 'visible';
        }
        if (el.style.height === '100vh') {
          el.style.height = 'auto';
          el.style.minHeight = '100vh';
        }
      });
    };

    forceScroll();
    setTimeout(forceScroll, 100);
    setTimeout(forceScroll, 500);

    return () => {
      const existingStyle = document.getElementById('scroll-fix-upgrade');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

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

  // Always allow access for now (free users get AI chat)
  return <>{children}</>;

  // if (hasAccess) {
  //   return <>{children}</>;
  // }

  // Show upgrade prompt for free users
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      padding: '20px',
      minHeight: '100vh',
      height: 'auto',
      overflow: 'visible',
      display: 'block',
      position: 'relative',
      width: '100%',
      maxWidth: '100vw'
    }}>
      {/* Back Button */}
      <div style={{
        position: 'fixed',
        top: '24px',
        left: '24px',
        zIndex: 1001
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: 'rgba(55, 65, 81, 0.9)',
            color: 'white',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease'
          }}
          title="Back to Dashboard"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.9)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(55, 65, 81, 0.9)';
            e.currentTarget.style.transform = 'translateY(0px)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      <div className="max-w-4xl mx-auto text-center px-4">
        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
          <div className="relative bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-white text-3xl">✨</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">🔒</span>
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
              <span className="mr-2">👑</span>
              <span className="font-medium">Premium Feature</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 px-2 max-w-6xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center overflow-hidden">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-blue-400 text-xl">💬</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Unlimited AI Conversations</h3>
            <p className="text-slate-400 text-sm">
              Chat with our AI assistant as much as you need. No daily limits or restrictions.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center overflow-hidden">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-purple-400 text-xl">💻</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Smart Code Generation</h3>
            <p className="text-slate-400 text-sm">
              Transform your trading ideas into professional Pine Script code with natural language.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 text-center overflow-hidden sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <span className="text-green-400 text-xl">📈</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Strategy Optimization</h3>
            <p className="text-slate-400 text-sm">
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
                <span className="mr-1 text-yellow-400">👑</span>
                Pro Plan
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Section - Moved Up */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Plan</h2>
          <div className="flex flex-col items-center space-y-4 max-w-md mx-auto">
            {/* Pro Plan */}
            <div className="w-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Pro Plan</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">₹1,499</span>
                  <span className="text-lg text-slate-400">/month</span>
                </div>
                <button
                  onClick={() => router.push('/billing')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:from-blue-600 hover:to-purple-600 shadow-lg flex items-center justify-center group"
                >
                  <span className="mr-2">👑</span>
                  Upgrade to Pro
                  <span className="ml-2">→</span>
                </button>
              </div>
            </div>

            <div className="text-slate-500 text-sm">or</div>

            {/* Premium Plan */}
            <div className="w-full bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2">Premium Plan</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-white">₹2,998</span>
                  <span className="text-lg text-slate-400">/month</span>
                </div>
                <button
                  onClick={() => router.push('/billing')}
                  className="w-full bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Choose Premium
                </button>
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-6 text-center">
            ✨ 14-day free trial • Cancel anytime • No hidden fees
          </p>
        </div>



        {/* Final CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Unlock AI Power?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of traders using Pine Genie AI to create winning strategies
          </p>
          <button
            onClick={() => router.push('/billing')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-12 py-4 rounded-xl font-medium text-lg hover:from-blue-600 hover:to-purple-600 shadow-lg"
          >
            Start Your Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}