/**
 * Subscription Status Component
 * 
 * Shows user's current subscription status, token usage, and upgrade options
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Zap, 
  Calendar,
  TrendingUp,
  AlertTriangle,
  Upgrade,
  Settings,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface SubscriptionInfo {
  id: string;
  planName: string;
  planDisplayName: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  isActive: boolean;
  limits: {
    strategiesPerMonth: number | 'unlimited';
    aiGenerations: number | 'unlimited';
    aiChatAccess: boolean;
    scriptStorage: number | 'unlimited';
  };
}

interface UsageStats {
  strategiesGenerated: { current: number; limit: number | 'unlimited' };
  aiGenerations: { current: number; limit: number | 'unlimited' };
  templatesUsed: { current: number; limit: number | 'unlimited' };
}

interface TokenInfo {
  totalAllocated: number;
  totalUsed: number;
  remaining: number;
  lastUsed?: string;
}

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [tokens, setTokens] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      // Fetch current subscription
      const subResponse = await fetch('/api/subscription/current');
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setSubscription(subData.subscription);
      }

      // Fetch usage statistics
      const usageResponse = await fetch('/api/subscription/usage');
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsage(usageData.usage);
      }

      // Fetch token information
      const tokenResponse = await fetch('/api/user/tokens');
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        setTokens(tokenData.tokens);
      }

    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  };

  const getUsagePercentage = (current: number, limit: number | 'unlimited'): number => {
    if (limit === 'unlimited') return 0;
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanColor = (planName: string): string => {
    switch (planName.toLowerCase()) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="w-6 h-6 text-yellow-500" />
              <div>
                <CardTitle>Subscription Status</CardTitle>
                <CardDescription>
                  Your current plan and billing information
                </CardDescription>
              </div>
            </div>
            <Badge className={getPlanColor(subscription?.planName || 'free')}>
              {subscription?.planDisplayName || 'Free Plan'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {subscription.status}
                  </div>
                  <div className="text-sm text-gray-500">Status</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    <Calendar className="w-5 h-5 inline mr-1" />
                    {formatDate(subscription.currentPeriodEnd)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {subscription.cancelAtPeriodEnd ? 'Cancels on' : 'Renews on'}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {subscription.limits.aiChatAccess ? 'Enabled' : 'Disabled'}
                  </div>
                  <div className="text-sm text-gray-500">AI Chat Access</div>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Subscription Ending</h4>
                      <p className="text-sm text-yellow-700">
                        Your subscription will end on {formatDate(subscription.currentPeriodEnd)}. 
                        Reactivate to continue using premium features.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Crown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Subscription</h3>
              <p className="text-gray-600 mb-4">
                Upgrade to a paid plan to unlock premium features and higher limits.
              </p>
              <Link href="/pricing">
                <Button>
                  <Upgrade className="w-4 h-4 mr-2" />
                  View Plans
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      {usage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Usage Statistics
            </CardTitle>
            <CardDescription>
              Your current usage for this billing period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Strategies Generated */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Strategies Generated</span>
                <span className="text-sm text-gray-500">
                  {usage.strategiesGenerated.current} / {
                    usage.strategiesGenerated.limit === 'unlimited' 
                      ? '∞' 
                      : usage.strategiesGenerated.limit
                  }
                </span>
              </div>
              {usage.strategiesGenerated.limit !== 'unlimited' && (
                <Progress 
                  value={getUsagePercentage(usage.strategiesGenerated.current, usage.strategiesGenerated.limit)}
                  className="h-2"
                />
              )}
            </div>

            {/* AI Generations */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">AI Generations</span>
                <span className="text-sm text-gray-500">
                  {usage.aiGenerations.current} / {
                    usage.aiGenerations.limit === 'unlimited' 
                      ? '∞' 
                      : usage.aiGenerations.limit
                  }
                </span>
              </div>
              {usage.aiGenerations.limit !== 'unlimited' && (
                <Progress 
                  value={getUsagePercentage(usage.aiGenerations.current, usage.aiGenerations.limit)}
                  className="h-2"
                />
              )}
            </div>

            {/* Templates Used */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Templates Used</span>
                <span className="text-sm text-gray-500">
                  {usage.templatesUsed.current} / {
                    usage.templatesUsed.limit === 'unlimited' 
                      ? '∞' 
                      : usage.templatesUsed.limit
                  }
                </span>
              </div>
              {usage.templatesUsed.limit !== 'unlimited' && (
                <Progress 
                  value={getUsagePercentage(usage.templatesUsed.current, usage.templatesUsed.limit)}
                  className="h-2"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Information */}
      {tokens && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              AI Token Balance
            </CardTitle>
            <CardDescription>
              Your available AI tokens for chat and generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {tokens.totalAllocated.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">Total Allocated</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {tokens.remaining.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">Remaining</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {tokens.totalUsed.toLocaleString()}
                </div>
                <div className="text-sm text-gray-700">Used</div>
              </div>
            </div>

            {tokens.remaining < 1000 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Low Token Balance</h4>
                    <p className="text-sm text-yellow-700">
                      You're running low on AI tokens. Consider upgrading your plan for more tokens.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/pricing">
              <Button variant="outline" className="w-full">
                <Upgrade className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
            
            <Link href="/billing">
              <Button variant="outline" className="w-full">
                <CreditCard className="w-4 h-4 mr-2" />
                Billing History
              </Button>
            </Link>
            
            <Link href="/settings/subscription">
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Manage Subscription
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}