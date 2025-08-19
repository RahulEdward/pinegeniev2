"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Zap, Crown, Star } from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '₹0',
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        'Visual drag-and-drop builder',
        'Save 1 strategy',
        'Basic templates only',
        'No AI support'
      ],
      buttonText: 'Get Started Free',
      buttonStyle: 'bg-gray-600 hover:bg-gray-700',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₹1,499',
      period: '/month',
      description: 'For serious traders',
      features: [
        '500 AI credits monthly - auto-refreshed, no extra charges!',
        'Unlimited indicators, strategies & screeners',
        'Unlimited inputs, conditions, alerts & plots',
        '100+ technical analysis indicators included',
        'Multi-timeframe & multi-symbol support',
        'Import & customize your existing code',
        'Priority support via exclusive Discord'
      ],
      buttonText: 'Get Pro Plan',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700',
      popular: true
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    if (planId === 'free') {
      router.push('/register');
    } else {
      // Handle Pro plan payment
      console.log('Redirecting to payment gateway for Pro plan');
      // Add payment gateway integration here
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PG</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                PineGenie
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/login')}
                className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Start free and upgrade as you scale. All plans include our core features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-slate-800/30 backdrop-blur-xl rounded-3xl p-8 border transition-all duration-300 hover:scale-105 ${
                plan.popular 
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/20' 
                  : 'border-slate-700/50 hover:border-slate-600/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  {plan.id === 'pro' ? (
                    <Crown className="w-8 h-8 text-blue-400" />
                  ) : (
                    <Zap className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className={`text-4xl font-bold ${
                    plan.id === 'pro' 
                      ? 'bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent' 
                      : 'text-white'
                  }`}>
                    {plan.price}
                  </span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                
                <p className="text-slate-400">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-slate-300">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      plan.id === 'pro' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className={feature.includes('500 AI credits') ? 'font-semibold' : ''}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelect(plan.id)}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 ${plan.buttonStyle} text-white shadow-lg`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm mb-4">
            All plans include Pine Script v6 generation • 30-day money-back guarantee
          </p>
          <p className="text-slate-500 text-xs">
            Start with our free plan and upgrade when you need more features.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">
                What are AI credits?
              </h3>
              <p className="text-slate-400">
                AI credits are used for generating Pine Script code with our AI. Each strategy generation uses approximately 1 credit. Pro plan includes 500 credits monthly.
              </p>
            </div>
            
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-400">
                Yes! You can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
              </p>
            </div>
            
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">
                Do unused credits roll over?
              </h3>
              <p className="text-slate-400">
                No, credits are refreshed monthly and don&apos;t roll over. This keeps your subscription simple with no extra charges.
              </p>
            </div>
            
            <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-3">
                Is there a free trial?
              </h3>
              <p className="text-slate-400">
                Our free plan lets you try the core features. Upgrade to Pro when you need unlimited access and AI features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}