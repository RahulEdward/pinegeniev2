/**
 * Pricing Page
 * 
 * Public pricing page showing subscription plans with PayU integration
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PayUPaymentForm } from '@/components/payment/PayUPaymentForm';
import { 
  Check, 
  Star, 
  Zap, 
  Users, 
  Shield,
  ArrowRight,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

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
  limits: {
    strategiesPerMonth: number | 'unlimited';
    templatesAccess: 'basic' | 'all';
    aiGenerations: number | 'unlimited';
    aiChatAccess: boolean;
    scriptStorage: number | 'unlimited';
    exportFormats: string[];
    supportLevel: 'community' | 'priority' | 'dedicated';
    customSignatures: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
    teamCollaboration: boolean;
    advancedIndicators: boolean;
    backtesting: boolean;
  };
  isPopular: boolean;
  trialDays: number;
  isActive: boolean;
}

export default function PricingPage() {
  const { data: session } = useSession();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    fetchPlans();
    if (session?.user) {
      fetchCurrentSubscription();
    }
  }, [session]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load pricing plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/current');
      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching current subscription:', error);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!session?.user) {
      toast.error('Please sign in to subscribe to a plan');
      return;
    }

    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    toast.success('Subscription activated successfully!');
    fetchCurrentSubscription();
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const formatPrice = (price: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const getDiscountPercentage = (monthly: number, annual: number) => {
    if (monthly === 0 || annual === 0) return 0;
    const monthlyTotal = monthly * 12;
    return Math.round(((monthlyTotal - annual) / monthlyTotal) * 100);
  };

  const isCurrentPlan = (planName: string) => {
    return currentSubscription?.planName === planName;
  };

  if (showPaymentForm && selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Complete Your Subscription
            </h1>
            <p className="text-gray-600">
              You're subscribing to {selectedPlan.displayName}
            </p>
          </div>
          
          <PayUPaymentForm
            planId={selectedPlan.id}
            planName={selectedPlan.name}
            planDisplayName={selectedPlan.displayName}
            amount={billingCycle === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.annualPrice}
            currency={selectedPlan.currency}
            billingCycle={billingCycle}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Choose Your <span className="text-blue-600">PineGenie</span> Plan
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Unlock the full power of AI-driven Pine Script generation with our flexible pricing plans. 
          Start free and upgrade as you grow.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <Badge className="ml-2 bg-green-100 text-green-800">Save up to 20%</Badge>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pricing plans...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
              const discount = getDiscountPercentage(plan.monthlyPrice, plan.annualPrice);
              const isCurrent = isCurrentPlan(plan.name);
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    plan.isPopular 
                      ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                      : 'hover:shadow-lg'
                  } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-medium">
                      <Star className="w-4 h-4 inline mr-1" />
                      Most Popular
                    </div>
                  )}
                  
                  {isCurrent && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center py-2 text-sm font-medium">
                      <Check className="w-4 h-4 inline mr-1" />
                      Current Plan
                    </div>
                  )}

                  <CardHeader className={`text-center ${plan.isPopular || isCurrent ? 'pt-12' : 'pt-6'}`}>
                    <CardTitle className="text-2xl font-bold">{plan.displayName}</CardTitle>
                    <CardDescription className="text-gray-600 min-h-[3rem]">
                      {plan.description}
                    </CardDescription>
                    
                    <div className="py-4">
                      <div className="text-4xl font-bold text-gray-900">
                        {price === 0 ? 'Free' : formatPrice(price, plan.currency)}
                        {price > 0 && (
                          <span className="text-lg font-normal text-gray-500">
                            /{billingCycle === 'monthly' ? 'month' : 'year'}
                          </span>
                        )}
                      </div>
                      
                      {billingCycle === 'annual' && discount > 0 && price > 0 && (
                        <div className="text-sm text-green-600 font-medium mt-1">
                          Save {discount}% with annual billing
                        </div>
                      )}
                      
                      {plan.trialDays > 0 && (
                        <div className="text-sm text-blue-600 font-medium mt-1">
                          {plan.trialDays} days free trial
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Key Features */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Strategies per month</span>
                        <span className="font-medium">
                          {plan.limits.strategiesPerMonth === 'unlimited' 
                            ? 'Unlimited' 
                            : plan.limits.strategiesPerMonth}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">AI Generations</span>
                        <span className="font-medium">
                          {plan.limits.aiGenerations === 'unlimited' 
                            ? 'Unlimited' 
                            : plan.limits.aiGenerations}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">AI Chat Access</span>
                        {plan.limits.aiChatAccess ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Script Storage</span>
                        <span className="font-medium">
                          {plan.limits.scriptStorage === 'unlimited' 
                            ? 'Unlimited' 
                            : plan.limits.scriptStorage}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Templates Access</span>
                        <span className="font-medium capitalize">
                          {plan.limits.templatesAccess}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Support Level</span>
                        <span className="font-medium capitalize">
                          {plan.limits.supportLevel}
                        </span>
                      </div>
                    </div>

                    {/* Advanced Features */}
                    <div className="border-t pt-4 space-y-2">
                      {[
                        { key: 'backtesting', label: 'Backtesting' },
                        { key: 'advancedIndicators', label: 'Advanced Indicators' },
                        { key: 'apiAccess', label: 'API Access' },
                        { key: 'teamCollaboration', label: 'Team Collaboration' },
                        { key: 'whiteLabel', label: 'White Label' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{label}</span>
                          {plan.limits[key as keyof typeof plan.limits] ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      {isCurrent ? (
                        <Button className="w-full" variant="outline" disabled>
                          <Check className="w-4 h-4 mr-2" />
                          Current Plan
                        </Button>
                      ) : session?.user ? (
                        <Button 
                          className="w-full" 
                          onClick={() => handleSelectPlan(plan)}
                          variant={plan.isPopular ? 'default' : 'outline'}
                        >
                          {price === 0 ? 'Get Started Free' : 'Subscribe Now'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <Link href="/login">
                          <Button className="w-full" variant="outline">
                            Sign In to Subscribe
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Trust Indicators */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Trusted by Pine Script Developers Worldwide
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Secure Payments</h4>
              <p className="text-gray-600 text-sm">
                All payments processed securely through PayU with 256-bit SSL encryption
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <Users className="w-12 h-12 text-green-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">10,000+ Users</h4>
              <p className="text-gray-600 text-sm">
                Join thousands of traders using PineGenie for their Pine Script needs
              </p>
            </div>
            
            <div className="flex flex-col items-center">
              <Zap className="w-12 h-12 text-purple-600 mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Instant Activation</h4>
              <p className="text-gray-600 text-sm">
                Your subscription is activated immediately after successful payment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}