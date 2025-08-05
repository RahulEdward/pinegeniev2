/**
 * Billing Page
 * 
 * Shows subscription plans and manages user billing
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Check, 
  Star, 
  ArrowLeft,
  Zap,
  Users,
  Shield,
  Sparkles
} from 'lucide-react';

interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  features: PlanFeature[];
  isPopular: boolean;
  trialDays: number;
}

interface UserSubscription {
  id: string;
  planName: string;
  planDisplayName: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  isActive: boolean;
}

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session) {
      fetchPlansAndSubscription();
    }
  }, [session, status, router]);

  const fetchPlansAndSubscription = async () => {
    try {
      setLoading(true);
      
      // Fetch subscription plans
      const plansResponse = await fetch('/api/subscription/plans');
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData.plans || []);
      }

      // Fetch current subscription
      const subscriptionResponse = await fetch('/api/subscription/current');
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        setCurrentSubscription(subscriptionData.subscription);
      }

    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingCycle
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.payment?.payuForm) {
          // Create and submit PayU form
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = 'https://secure.payu.in/_payment';
          
          const payuData = data.payment.payuForm;
          Object.keys(payuData).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = payuData[key];
            form.appendChild(input);
          });
          
          document.body.appendChild(form);
          form.submit();
        } else {
          // Free plan or trial - refresh subscription info
          fetchPlansAndSubscription();
        }
      } else {
        const errorData = await response.json();
        alert('Failed to create subscription: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Failed to create subscription. Please try again.');
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'free':
        return <Sparkles className="h-6 w-6" />;
      case 'pro':
        return <Zap className="h-6 w-6" />;
      case 'premium':
        return <Shield className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const formatPrice = (price: number, currency: string = 'INR') => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`border-b transition-colors ${
        darkMode ? 'bg-slate-800/90 backdrop-blur-xl border-slate-700/50' : 'bg-white/95 backdrop-blur-xl border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <CreditCard className="h-8 w-8 text-blue-400" />
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Billing & Subscription
                  </h1>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Manage your subscription and billing information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Subscription */}
        {currentSubscription && (
          <div className={`mb-8 p-6 rounded-2xl border ${
            darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/70 border-gray-200/50'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Current Subscription
            </h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getPlanIcon(currentSubscription.planName)}
                <div>
                  <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentSubscription.planDisplayName}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Status: {currentSubscription.status}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {currentSubscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'} on
                </p>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className={`p-1 rounded-lg border ${
            darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-500 text-white'
                  : darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-blue-500 text-white'
                  : darkMode ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="ml-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            const isCurrentPlan = currentSubscription?.planName === plan.name;
            
            return (
              <div
                key={plan.id}
                className={`relative p-6 rounded-2xl border transition-all ${
                  plan.isPopular
                    ? 'border-blue-500/50 bg-gradient-to-b from-blue-500/10 to-transparent'
                    : darkMode
                    ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                    : 'bg-white/70 border-gray-200/50 hover:border-gray-300'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex p-3 rounded-full mb-4 ${
                    plan.name === 'free' ? 'bg-green-500/20 text-green-400' :
                    plan.name === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {getPlanIcon(plan.name)}
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {plan.displayName}
                  </h3>
                  <p className={`text-sm mb-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPrice(price)}
                    </span>
                    {price > 0 && (
                      <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        /{billingCycle === 'monthly' ? 'month' : 'year'}
                      </span>
                    )}
                  </div>
                  {plan.trialDays > 0 && (
                    <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {plan.trialDays} days free trial
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.slice(0, 6).map((feature) => (
                    <div key={feature.id} className="flex items-start space-x-3">
                      <Check className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                        feature.included ? 'text-green-400' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`text-sm ${
                          feature.included 
                            ? darkMode ? 'text-white' : 'text-gray-900'
                            : darkMode ? 'text-slate-500' : 'text-gray-500'
                        }`}>
                          {feature.name}
                        </p>
                        {feature.description && (
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            {feature.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    isCurrentPlan
                      ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                      : plan.isPopular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg'
                      : darkMode
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : 
                   price === 0 ? 'Get Started' : 
                   `Subscribe ${billingCycle === 'annual' ? 'Annually' : 'Monthly'}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Payment Info */}
        <div className={`mt-8 p-6 rounded-2xl border ${
          darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/70 border-gray-200/50'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Payment Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Secure Payments
              </h4>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                All payments are processed securely through PayU Money. We support all major payment methods including credit cards, debit cards, net banking, and UPI.
              </p>
            </div>
            <div>
              <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Billing Currency
              </h4>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                All prices are in Indian Rupees (₹). GST will be added as applicable during checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}