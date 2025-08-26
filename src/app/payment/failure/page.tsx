'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentFailurePage() {
  const router = useRouter();

  useEffect(() => {
    // Handle payment failure
    const handlePaymentFailure = async () => {
      const pendingPayment = localStorage.getItem('pendingPayment');
      if (pendingPayment) {
        const paymentData = JSON.parse(pendingPayment);
        
        // Update payment status to failed
        try {
          await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              paymentId: paymentData.paymentId,
              status: 'failed'
            })
          });
        } catch (error) {
          console.error('Error updating payment status:', error);
        }
        
        // Clear pending payment data
        localStorage.removeItem('pendingPayment');
      }
    };

    handlePaymentFailure();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <div className="text-red-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          We couldn't process your payment. Please try again or contact support if the issue persists.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}