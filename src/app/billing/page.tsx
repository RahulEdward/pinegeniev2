/**
 * Billing Page
 * 
 * User billing dashboard with subscription management and credit system
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Star, 
  Zap, 
  Check,
  ArrowRight,
  Calendar,
  Download,
  Settings,
  Crown,
  Sparkles,
  RefreshCw,
  Moon,
  Sun,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BillingHistoryModal } from '@/components/billing/BillingHistoryModal';
import { PayUPaymentForm } from '@/components/payment/PayUPaymentForm';
import { Modal } from '@/components/ui/modal';

interface SubscriptionInfo {
  planName: string;
  planDisplayName: string;
  status: string;
  currentPeriodEnd: string;
  monthlyCredits: number;
  usedCredits: number;
  remainingCredits: number;
  isActive: boolean;
}

interface ExtraCreditsInfo {
  total: number;
  used: number;
  remaining: number;
}

interface PlanOption {
  id: string;
  name: string;
  displayName: string;
  price: number;
  originalPrice?: number;
  currency: string;
  credits: number;
  features: string[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  discount?: string;
}

export default function BillingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [extraCredits, setExtraCredits] = useState<ExtraCreditsInfo | null>(null);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode like dashboard
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    displayName: string;
    amount: number;
    currency: string;
  } | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchBillingData();
    }
  }, [session]);

  // Theme persistence
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchBillingData = async () => {
    try {
      // Fetch current subscription
      const subResponse = await fetch('/api/subscription/current');
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData.subscription);
      }

      // Fetch extra credits
      const creditsResponse = await fetch('/api/user/extra-credits');
      if (creditsResponse.ok) {
        const creditsData = await creditsResponse.json();
        setExtraCredits(creditsData.extraCredits);
      }

      // Fetch available plans
      const plansResponse = await fetch('/api/subscription/plans');
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData.plans);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const getUsagePercentage = () => {
    if (!subscription || subscription.monthlyCredits === 0) return 0;
    return (subscription.usedCredits / subscription.monthlyCredits) * 100;
  };

  const handlePurchaseCredits = () => {
    setSelectedPlan({
      id: 'extra-credits',
      name: 'extra-credits',
      displayName: '500 Extra AI Credits',
      amount: 1499,
      currency: 'INR'
    });
    setShowPaymentForm(true);
  };

  const handleBillingHistory = () => {
    setShowBillingHistory(true);
  };

  const handleDownloadInvoice = async () => {
    try {
      // Get the latest invoice from billing history
      const response = await fetch('/api/billing/history');
      if (response.ok) {
        const data = await response.json();
        const latestInvoice = data.history.find((item: any) => item.invoiceId);
        
        if (latestInvoice) {
          toast.success('Downloading latest invoice...');
          // TODO: Implement actual PDF download
          console.log('Download invoice:', latestInvoice.invoiceId);
        } else {
          toast.error('No invoices found');
        }
      } else {
        toast.error('Failed to find invoices');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handlePaymentMethods = () => {
    toast.success('Opening payment methods...');
    // TODO: Navigate to payment methods page
    console.log('Manage payment methods');
  };

  const handlePlanUpgrade = (planName: string) => {
    if (planName === 'pro') {
      const amount = billingPeriod === 'monthly' ? 1499 : 14990;
      setSelectedPlan({
        id: 'pro',
        name: 'pro',
        displayName: 'Pro Plan',
        amount: amount,
        currency: 'INR'
      });
      setShowPaymentForm(true);
    } else if (planName === 'premium') {
      const amount = billingPeriod === 'monthly' ? 2998 : 29980;
      setSelectedPlan({
        id: 'premium',
        name: 'premium',
        displayName: 'Premium Plan',
        amount: amount,
        currency: 'INR'
      });
      setShowPaymentForm(true);
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    toast.success('Payment successful! Your subscription has been activated.');
    // Refresh billing data
    fetchBillingData();
    // Redirect to success page
    router.push('/payment/success');
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handlePriorProgrammes = () => {
    toast.success('Opening prior programmes...');
    // TODO: Navigate to prior programmes page
    console.log('Show prior programmes');
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-4">
              Please sign in to view your billing information.
            </p>
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode
        ? 'bg-slate-900'
        : 'bg-gray-50'
      }`} style={{
        backgroundImage: darkMode
          ? 'radial-gradient(circle, rgba(100, 116, 139, 0.1) 1px, transparent 1px)'
          : 'radial-gradient(circle, rgba(156, 163, 175, 0.15) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}>
      
      {/* Header with Navigation */}
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b transition-colors ${darkMode
          ? 'bg-slate-800/90 border-slate-700/50'
          : 'bg-white/95 border-gray-200/50'
        }`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className={`p-2 rounded-lg border transition-colors ${darkMode
                    ? 'border-slate-600 hover:bg-slate-700/50 text-slate-300 hover:text-white'
                    : 'border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-2xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Plan
                </h1>
                <p className={`text-sm transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Manage your subscription plan.
                </p>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-xl border transition-all duration-300 ${darkMode
                  ? 'border-slate-600 bg-slate-700/50 hover:bg-slate-600/50 text-yellow-400'
                  : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-600'
                }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Current Subscription Status - Show for all users including free */}
        <div className={`mb-8 backdrop-blur-xl border transition-colors rounded-lg ${darkMode
            ? 'bg-slate-800/50 border-slate-700/50'
            : 'bg-white/70 border-gray-200/50 shadow-lg'
          }`}>
          <div className="p-6">
            <h3 className={`text-2xl font-semibold leading-none tracking-tight mb-6 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Subscription Plan
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Plan Info */}
              <div>
                <div className="flex items-center mb-4">
                  <span className={`text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    You are currently on the 
                  </span>
                  <Badge className={`ml-2 transition-colors ${darkMode 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-blue-100 text-blue-800'
                    }`}>
                    {subscription?.planDisplayName || 'Free'}
                  </Badge>
                  {subscription?.planName !== 'free' && (
                    <span className={`text-sm transition-colors ml-1 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                      - Lifetime
                    </span>
                  )}
                </div>
                <div className={`text-sm mb-4 transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Monthly AI Credits: {subscription?.monthlyCredits?.toLocaleString() || '5'} AI Credits/month
                </div>

                {/* Usage Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      AI Credits (Monthly)
                    </span>
                    <span className={`text-sm transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      You have {subscription?.remainingCredits?.toLocaleString() || '5'} credits remaining
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 mb-2 transition-colors ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${getUsagePercentage()}%` }}
                    ></div>
                  </div>
                  <div className={`text-xs transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Used {subscription?.usedCredits?.toLocaleString() || '0'} of {subscription?.monthlyCredits?.toLocaleString() || '5'} credits
                  </div>
                </div>
              </div>

              {/* Extra Credits Section */}
              <div>
                <h4 className={`font-medium mb-2 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Extra AI Credits
                </h4>
                <p className={`text-sm mb-4 transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Top up your AI credits! Purchase additional credit packages from the credit store.
                </p>
                <div className={`rounded-lg p-4 mb-4 transition-colors ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Current extra AI credits:
                    </span>
                    <span className={`font-semibold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {extraCredits?.remaining?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={handlePurchaseCredits}
                  className={`w-full p-3 rounded-lg border transition-all duration-300 flex items-center justify-center hover:scale-105 ${darkMode
                      ? 'border-blue-400/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400'
                      : 'border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600'
                    }`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  500 Credits (₹1,499)
                </button>
                <p className={`text-xs mt-2 transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  One AI credit will only be consumed after your monthly credits are used up.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            onClick={handleBillingHistory}
            variant="outline" 
            className={`transition-colors ${darkMode
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Billing History
          </Button>
          <Button 
            onClick={handleDownloadInvoice}
            variant="outline"
            className={`transition-colors ${darkMode
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
          <Button 
            onClick={handlePaymentMethods}
            variant="outline"
            className={`transition-colors ${darkMode
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            Payment Methods
          </Button>
        </div>

        {/* Plan Selection */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="flex justify-center space-x-2 mb-6">
              <Button 
                onClick={() => setBillingPeriod('monthly')}
                className={billingPeriod === 'monthly' 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600"
                  : `transition-colors ${darkMode
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent'
                    }`
                }
                variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
              >
                Monthly Plans
              </Button>
              <Button 
                onClick={() => setBillingPeriod('yearly')}
                variant={billingPeriod === 'yearly' ? 'default' : 'outline'}
                className={billingPeriod === 'yearly' 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600"
                  : `transition-colors ${darkMode
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50 bg-transparent'
                    }`
                }
              >
                Yearly Plans
              </Button>
              <Button 
                onClick={handlePriorProgrammes}
                variant="outline"
                className={`transition-colors ${darkMode
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700/50'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                Prior Programmes ↗
              </Button>
            </div>
            <h2 className={`text-2xl font-bold mb-2 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Choose Your Plan
            </h2>
            <p className={`text-lg mb-4 transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Start free and upgrade as you scale. All plans include our core features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className={`relative backdrop-blur-xl border transition-all duration-300 hover:shadow-xl rounded-lg ${darkMode
                ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
                : 'bg-white/70 border-gray-200/50 shadow-lg hover:shadow-xl'
              }`}>
              <div className="text-center p-6 pb-4">
                <h3 className={`text-lg font-semibold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Free
                </h3>
                <div className={`text-3xl font-bold mt-2 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ₹0
                </div>
                <p className={`text-sm mt-2 transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Start free and upgrade as you scale
                </p>
              </div>
              <div className="px-6 pb-6">
                <ul className="space-y-2 mb-6">
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Visual drag-and-drop builder
                  </li>
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Save 1 strategy
                  </li>
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Basic templates only
                  </li>
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    No AI support
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className={`w-full transition-colors ${
                    (!subscription || subscription?.planName === 'free')
                      ? darkMode
                        ? 'border-green-500/30 text-green-400 bg-green-500/10'
                        : 'border-green-500 text-green-700 bg-green-50'
                      : darkMode
                        ? 'border-slate-600 text-slate-300 hover:bg-slate-700/50'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={!subscription || subscription?.planName === 'free'}
                >
                  {(!subscription || subscription?.planName === 'free') ? 'Current Plan' : 'Get Started Free'}
                </Button>
              </div>
            </div>

            {/* Plus Plan */}
            <div className={`relative backdrop-blur-xl border-2 border-blue-500 shadow-xl scale-105 transition-all duration-300 rounded-lg ${darkMode
                ? 'bg-slate-800/50 shadow-blue-500/20'
                : 'bg-white/70 shadow-blue-500/20'
              }`}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 shadow-lg rounded-full text-xs font-semibold inline-flex items-center">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </div>
              </div>
              <div className="text-center p-6 pb-4 pt-8">
                <h3 className={`text-lg font-semibold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Pro
                </h3>
                <div className="flex items-center justify-center mt-2">
                  <span className={`text-3xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {billingPeriod === 'monthly' ? '₹1,499' : '₹14,990'}
                  </span>
                  <span className={`text-sm ml-1 transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingPeriod === 'yearly' && (
                  <div className="text-xs text-green-400 font-medium mt-1">
                    Save ₹3,498 per year!
                  </div>
                )}
                <div className="text-sm text-blue-400 font-medium mt-2">
                  500 AI credits monthly - auto-refreshed!
                </div>
              </div>
              <div className="px-6 pb-6">
                <ul className="space-y-2 mb-6">
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Unlimited indicators, strategies & screeners
                  </li>
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Technical analysis indicators included
                  </li>
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Multi-timeframe & multi-symbol support
                  </li>
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Priority support via exclusive Discord
                  </li>
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Import & customize your existing code
                  </li>
                </ul>
                <Button 
                  onClick={() => handlePlanUpgrade('pro')}
                  className={`w-full transition-all shadow-lg ${
                    subscription?.planName === 'pro'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                  }`}
                  disabled={subscription?.planName === 'pro'}
                >
                  {subscription?.planName === 'pro' ? 'Current Plan' : 'Get Pro Plan'}
                </Button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className={`relative backdrop-blur-xl border transition-all duration-300 hover:shadow-xl rounded-lg ${darkMode
                ? 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
                : 'bg-white/70 border-gray-200/50 shadow-lg hover:shadow-xl'
              }`}>
              <div className="text-center p-6 pb-4">
                <h3 className={`flex items-center justify-center font-semibold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
                  Premium
                </h3>
                <div className="flex items-center justify-center mt-2">
                  <span className={`text-3xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {billingPeriod === 'monthly' ? '₹2,998' : '₹29,980'}
                  </span>
                  <span className={`text-sm ml-1 transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    /{billingPeriod === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingPeriod === 'yearly' && (
                  <div className="text-xs text-green-400 font-medium mt-1">
                    Save ₹6,996 per year!
                  </div>
                )}
                <div className="text-sm text-purple-400 font-medium mt-2">
                  1000 AI credits monthly - auto-refreshed!
                </div>
              </div>
              <div className="px-6 pb-6">
                <ul className="space-y-2 mb-6">
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Unlimited indicators, strategies & screeners
                  </li>
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Technical analysis indicators included
                  </li>
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Multi-timeframe & multi-symbol support
                  </li>
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Priority support via exclusive Discord
                  </li>
                  <li className={`flex items-center text-sm transition-colors ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <Check className="w-4 h-4 text-green-400 mr-2" />
                    Import & customize your existing code
                  </li>
                </ul>
                <Button 
                  onClick={() => handlePlanUpgrade('premium')}
                  className={`w-full transition-all shadow-lg ${
                    subscription?.planName === 'premium'
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  }`}
                  disabled={subscription?.planName === 'premium'}
                >
                  {subscription?.planName === 'premium' ? 'Current Plan' : 'Contact Sales'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`backdrop-blur-xl border transition-colors rounded-lg ${darkMode
              ? 'bg-slate-800/50 border-slate-700/50'
              : 'bg-white/70 border-gray-200/50 shadow-lg'
            }`}>
            <div className="p-6">
              <h3 className={`flex items-center text-2xl font-semibold leading-none tracking-tight mb-6 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                Billing Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Current Plan
                  </span>
                  <span className={`font-medium transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {subscription?.planDisplayName || 'Free'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Status
                  </span>
                  <Badge className={subscription?.isActive 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }>
                    {subscription?.status || 'Free'}
                  </Badge>
                </div>
                {subscription?.currentPeriodEnd && (
                  <div className="flex justify-between">
                    <span className={`transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Next Billing
                    </span>
                    <span className={`font-medium transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`backdrop-blur-xl border transition-colors rounded-lg ${darkMode
              ? 'bg-slate-800/50 border-slate-700/50'
              : 'bg-white/70 border-gray-200/50 shadow-lg'
            }`}>
            <div className="p-6">
              <h3 className={`flex items-center text-2xl font-semibold leading-none tracking-tight mb-6 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Zap className="w-5 h-5 mr-2 text-blue-400" />
                Usage Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    AI Credits Used
                  </span>
                  <span className={`font-medium transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {subscription?.usedCredits.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Credits Remaining
                  </span>
                  <span className={`font-medium transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {subscription?.remainingCredits.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-colors ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Monthly Allowance
                  </span>
                  <span className={`font-medium transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {subscription?.monthlyCredits.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History Modal */}
      <BillingHistoryModal 
        isOpen={showBillingHistory}
        onClose={() => setShowBillingHistory(false)}
      />

      {/* Payment Form Modal */}
      {selectedPlan && (
        <Modal
          isOpen={showPaymentForm}
          onClose={handlePaymentCancel}
          title={`Subscribe to ${selectedPlan.displayName}`}
          size="lg"
        >
          <PayUPaymentForm
            planId={selectedPlan.id}
            planName={selectedPlan.name}
            planDisplayName={selectedPlan.displayName}
            amount={selectedPlan.amount}
            currency={selectedPlan.currency}
            billingCycle={billingPeriod}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </Modal>
      )}
    </div>
  );
}