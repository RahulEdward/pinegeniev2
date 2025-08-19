/**
 * PayU Payment Form Component
 * 
 * Renders a form that submits to PayU for payment processing
 */

'use client';

import { useEffect, useRef } from 'react';
import type { PayUPaymentRequest } from '@/lib/payu-config';

interface PayUPaymentFormProps {
  paymentData: PayUPaymentRequest;
  onSubmit?: () => void;
  autoSubmit?: boolean;
  className?: string;
}

export default function PayUPaymentForm({ 
  paymentData, 
  onSubmit, 
  autoSubmit = false,
  className = ''
}: PayUPaymentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (autoSubmit && formRef.current) {
      // Auto-submit the form after a short delay
      const timer = setTimeout(() => {
        formRef.current?.submit();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [autoSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    if (onSubmit) {
      onSubmit();
    }
    // Form will submit naturally to PayU
  };

  return (
    <div className={`payu-payment-form ${className}`}>
      <form
        ref={formRef}
        action="https://secure.payu.in/_payment"
        method="POST"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* PayU Required Fields */}
        <input type="hidden" name="key" value={paymentData.key} />
        <input type="hidden" name="txnid" value={paymentData.txnid} />
        <input type="hidden" name="amount" value={paymentData.amount} />
        <input type="hidden" name="productinfo" value={paymentData.productinfo} />
        <input type="hidden" name="firstname" value={paymentData.firstname} />
        <input type="hidden" name="email" value={paymentData.email} />
        <input type="hidden" name="phone" value={paymentData.phone || ''} />
        <input type="hidden" name="surl" value={paymentData.surl} />
        <input type="hidden" name="furl" value={paymentData.furl} />
        <input type="hidden" name="hash" value={paymentData.hash} />
        
        {/* Optional UDF Fields */}
        <input type="hidden" name="udf1" value={paymentData.udf1 || ''} />
        <input type="hidden" name="udf2" value={paymentData.udf2 || ''} />
        <input type="hidden" name="udf3" value={paymentData.udf3 || ''} />
        <input type="hidden" name="udf4" value={paymentData.udf4 || ''} />
        <input type="hidden" name="udf5" value={paymentData.udf5 || ''} />

        {!autoSubmit && (
          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-lg font-medium transition-all hover:from-blue-600 hover:to-purple-600 shadow-lg"
            >
              Proceed to Payment
            </button>
          </div>
        )}
      </form>

      {autoSubmit && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Redirecting to PayU for secure payment...</p>
          <p className="text-sm text-slate-500 mt-2">
            If you&apos;re not redirected automatically, click the button below.
          </p>
          <button
            onClick={() => formRef.current?.submit()}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      )}
    </div>
  );
}