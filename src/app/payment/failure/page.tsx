/**
 * Payment Failure Page
 * 
 * Displays payment failure information and retry options
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  XCircle, 
  CreditCard, 
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface PaymentFailureDetails {
  txnid: string;
  amount: string;
  status: string;
  error: string;
  error_Message: string;
  productinfo: string;
  firstname: string;
  email: string;
}

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [failureDetails, setFailureDetails] = useState<PaymentFailureDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract payment failure details from URL parameters
    const details: PaymentFailureDetails = {
      txnid: searchParams.get('txnid') || '',
      amount: searchParams.get('amount') || '',
      status: searchParams.get('status') || '',
      error: searchParams.get('error') || '',
      error_Message: searchParams.get('error_Message') || '',
      productinfo: searchParams.get('productinfo') || '',
      firstname: searchParams.get('firstname') || '',
      email: searchParams.get('email') || ''
    };

    if (details.txnid) {
      setFailureDetails(details);
    }
    
    setLoading(false);
  }, [searchParams]);

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getErrorMessage = (error: string, errorMessage: string) => {
    if (errorMessage) return errorMessage;
    
    switch (error) {
      case 'E001':
        return 'Payment method not supported. Please try a different payment method.';
      case 'E002':
        return 'Invalid merchant configuration. Please contact support.';
      case 'E003':
        return 'Transaction ID error. Please try again.';
      case 'E004':
        return 'Invalid amount. Please check the payment amount.';
      default:
        return 'Payment failed due to an unknown error. Please try again or contact support.';
    }
  };

  const getRetryRecommendations = () => {
    return [
      'Check your internet connection and try again',
      'Verify your card details are correct',
      'Ensure you have sufficient balance in your account',
      'Try using a different payment method',
      'Contact your bank if the issue persists'
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!failureDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-6">
            <XCircle className="h-8 w-8 text-red-400 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Payment Information Not Found
          </h1>
          <p className="text-slate-400 mb-6">
            We couldn&apos;t find the payment details. Please try making the payment again.
          </p>
          <button
            onClick={() => router.push('/billing')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go to Billing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Failure Header */}
        <div className="text-center mb-12">
          <div className="bg-red-500/20 rounded-full p-6 w-24 h-24 mx-auto mb-6">
            <XCircle className="h-12 w-12 text-red-400 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Payment Failed
          </h1>
          <p className="text-xl text-slate-400">
            We couldn&apos;t process your payment. Don&apos;t worry, no charges were made.
          </p>
        </div>

        {/* Failure Details Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <AlertTriangle className="h-6 w-6 mr-3 text-red-400" />
            Payment Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Transaction ID</label>
              <p className="text-white font-mono text-sm bg-slate-700/50 px-3 py-2 rounded">
                {failureDetails.txnid}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-slate-400 block mb-1">Status</label>
              <p className="text-red-400 font-medium capitalize">
                {failureDetails.status}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-slate-400 block mb-1">Amount</label>
              <p className="text-2xl font-bold text-white">
                {formatAmount(failureDetails.amount)}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-slate-400 block mb-1">Subscription Plan</label>
              <p className="text-white font-medium">
                {failureDetails.productinfo}
              </p>
            </div>
          </div>

          {/* Error Message */}
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <h3 className="text-red-400 font-medium mb-2">Error Details</h3>
            <p className="text-slate-300 text-sm">
              {getErrorMessage(failureDetails.error, failureDetails.error_Message)}
            </p>
          </div>
        </div>

        {/* Retry Recommendations */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <HelpCircle className="h-6 w-6 mr-3 text-blue-400" />
            What You Can Do
          </h2>
          
          <div className="space-y-3">
            {getRetryRecommendations().map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="bg-blue-500/20 rounded-full p-1 mt-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
                <p className="text-slate-300 text-sm">
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/billing')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-medium transition-all hover:from-blue-600 hover:to-purple-600 shadow-lg flex items-center justify-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Payment Again
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Support Info */}
        <div className="text-center mt-12 p-6 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <p className="text-slate-400 text-sm mb-2">
            Still having trouble with your payment?
          </p>
          <p className="text-slate-300 text-sm">
            Contact our support team at{' '}
            <a 
              href="mailto:support@pinegenie.com" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              support@pinegenie.com
            </a>
            {' '}and we&apos;ll help you resolve the issue quickly.
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Reference Transaction ID: {failureDetails.txnid}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading payment information...</p>
        </div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}