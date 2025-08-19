/**
 * Payment Success Page
 * 
 * Displays payment confirmation and subscription activation
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  CheckCircle, 
  CreditCard, 
  Download,
  ArrowRight,
  Home,
  Receipt
} from 'lucide-react';

interface PaymentDetails {
  txnid: string;
  amount: string;
  status: string;
  mihpayid: string;
  productinfo: string;
  firstname: string;
  email: string;
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract payment details from URL parameters
    const details: PaymentDetails = {
      txnid: searchParams.get('txnid') || '',
      amount: searchParams.get('amount') || '',
      status: searchParams.get('status') || '',
      mihpayid: searchParams.get('mihpayid') || '',
      productinfo: searchParams.get('productinfo') || '',
      firstname: searchParams.get('firstname') || '',
      email: searchParams.get('email') || ''
    };

    if (details.txnid && details.status === 'success') {
      setPaymentDetails(details);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Processing payment confirmation...</p>
        </div>
      </div>
    );
  }

  if (!paymentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-red-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-6">
            <CreditCard className="h-8 w-8 text-red-400 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Payment Information Not Found
          </h1>
          <p className="text-slate-400 mb-6">
            We couldn&apos;t find the payment details. Please check your email for confirmation or contact support.
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
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="bg-green-500/20 rounded-full p-6 w-24 h-24 mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-slate-400">
            Thank you for your subscription to Pine Genie
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Receipt className="h-6 w-6 mr-3 text-blue-400" />
            Payment Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Transaction ID</label>
              <p className="text-white font-mono text-sm bg-slate-700/50 px-3 py-2 rounded">
                {paymentDetails.txnid}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-slate-400 block mb-1">PayU Payment ID</label>
              <p className="text-white font-mono text-sm bg-slate-700/50 px-3 py-2 rounded">
                {paymentDetails.mihpayid}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-slate-400 block mb-1">Amount Paid</label>
              <p className="text-2xl font-bold text-green-400">
                {formatAmount(paymentDetails.amount)}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-slate-400 block mb-1">Subscription Plan</label>
              <p className="text-white font-medium">
                {paymentDetails.productinfo}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-slate-400 block mb-1">Customer Name</label>
              <p className="text-white">
                {paymentDetails.firstname}
              </p>
            </div>
            
            <div>
              <label className="text-sm text-slate-400 block mb-1">Email</label>
              <p className="text-white">
                {paymentDetails.email}
              </p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            What&apos;s Next?
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/20 rounded-full p-2 mt-1">
                <CheckCircle className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Subscription Activated</h3>
                <p className="text-slate-400 text-sm">
                  Your subscription has been activated and you now have access to all premium features.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/20 rounded-full p-2 mt-1">
                <Receipt className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Invoice Sent</h3>
                <p className="text-slate-400 text-sm">
                  A detailed invoice has been sent to your email address for your records.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/20 rounded-full p-2 mt-1">
                <Download className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Start Building</h3>
                <p className="text-slate-400 text-sm">
                  You can now access the visual strategy builder and all premium templates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/builder')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-medium transition-all hover:from-blue-600 hover:to-purple-600 shadow-lg flex items-center justify-center"
          >
            Start Building Strategies
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
          
          <button
            onClick={() => router.push('/billing')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Manage Subscription
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Dashboard
          </button>
        </div>

        {/* Support Info */}
        <div className="text-center mt-12 p-6 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <p className="text-slate-400 text-sm mb-2">
            Need help or have questions about your subscription?
          </p>
          <p className="text-slate-300 text-sm">
            Contact us at{' '}
            <a 
              href="mailto:support@pinegenie.com" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              support@pinegenie.com
            </a>
            {' '}or visit our{' '}
            <a 
              href="/help" 
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              help center
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}