'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        // Get pending payment data
        const pendingPayment = localStorage.getItem('pendingPayment');
        if (pendingPayment) {
          const paymentData = JSON.parse(pendingPayment);
          
          // Verify payment status with backend
          const response = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              paymentId: paymentData.paymentId,
              status: 'success'
            })
          });

          if (response.ok) {
            // Clear pending payment data
            localStorage.removeItem('pendingPayment');
            
            // Wait a moment for subscription to be activated
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Redirect to dashboard
            router.push('/dashboard');
          } else {
            throw new Error('Payment verification failed');
          }
        } else {
          // No pending payment, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error processing payment success:', error);
        setIsProcessing(false);
      }
    };

    if (session?.user) {
      processPaymentSuccess();
    }
  }, [session, router]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-4">
            Your payment has been processed successfully. We're activating your subscription...
          </p>
          <div className="text-sm text-gray-500">
            Redirecting to your dashboard...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <div className="text-green-600 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your subscription has been activated.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}