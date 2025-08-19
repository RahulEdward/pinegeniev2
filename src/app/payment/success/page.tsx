/**
 * Payment Success Page
 * 
 * Handles successful PayU payment redirects and subscription activation
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  CreditCard, 
  Calendar,
  User,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface PaymentDetails {
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  planName: string;
  planDisplayName: string;
  billingCycle: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  activatedAt: string;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      // Get payment parameters from URL
      const txnid = searchParams.get('txnid');
      const mihpayid = searchParams.get('mihpayid');
      const status = searchParams.get('status');

      if (!txnid || !status) {
        setError('Invalid payment parameters');
        setLoading(false);
        return;
      }

      // Verify payment status with backend
      const response = await fetch(`/api/payment/verify?txnid=${txnid}&mihpayid=${mihpayid}`);
      const result = await response.json();

      if (!result.success) {
        setError(result.error || 'Payment verification failed');
        setLoading(false);
        return;
      }

      if (result.payment.status !== 'APPROVED') {
        setError('Payment was not successful');
        setLoading(false);
        return;
      }

      setPaymentDetails(result.payment);
      
      // Clear any pending payment data from localStorage
      localStorage.removeItem('pendingPayment');
      
      // Show success message
      toast.success('Payment successful! Your subscription is now active.');

    } catch (error) {
      console.error('Error verifying payment:', error);
      setError('Failed to verify payment status');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">Verifying Payment</h3>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2 text-red-600">Payment Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Link href="/pricing">
                <Button className="w-full">
                  Try Again
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600">
            Your subscription to PineGenie has been activated successfully.
          </p>
        </div>

        {paymentDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Transaction information and receipt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Transaction ID</span>
                  <span className="font-mono text-sm">{paymentDetails.transactionId}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Method</span>
                  <span>{paymentDetails.paymentMethod}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-green-100 text-green-800">
                    {paymentDetails.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date</span>
                  <span>{new Date(paymentDetails.activatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Subscription Details
                </CardTitle>
                <CardDescription>
                  Your new subscription information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-semibold">{paymentDetails.planDisplayName}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Billing Cycle</span>
                  <span className="capitalize">{paymentDetails.billingCycle}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Customer</span>
                  <div className="text-right">
                    <div className="font-medium">{paymentDetails.customerName}</div>
                    <div className="text-sm text-gray-500">{paymentDetails.customerEmail}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Activated</span>
                  <span>{new Date(paymentDetails.activatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              What's Next?
            </CardTitle>
            <CardDescription>
              Get started with your new PineGenie subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-2">Explore Templates</h4>
                <p className="text-sm text-gray-600">
                  Browse our extensive library of Pine Script templates
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-2">Build Strategies</h4>
                <p className="text-sm text-gray-600">
                  Use our visual builder to create custom trading strategies
                </p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-2">AI Chat</h4>
                <p className="text-sm text-gray-600">
                  Get help from our AI assistant for Pine Script questions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Link href="/builder">
            <Button size="lg" className="w-full sm:w-auto">
              Start Building Strategies
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Go to Dashboard
            </Button>
          </Link>
          
          <Link href="/ai-chat">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Try AI Chat
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="text-center mt-12 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            Our support team is here to help you get the most out of PineGenie.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
            <Button variant="outline" size="sm">
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}