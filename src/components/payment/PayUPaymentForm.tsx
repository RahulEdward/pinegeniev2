/**
 * PayU Payment Form Component
 * 
 * Handles PayU payment integration for subscription purchases
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PayUPaymentFormProps {
  planId: string;
  planName: string;
  planDisplayName: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'annual';
  onSuccess?: (paymentData: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export function PayUPaymentForm({
  planId,
  planName,
  planDisplayName,
  amount,
  currency,
  billingCycle,
  onSuccess,
  onError,
  onCancel
}: PayUPaymentFormProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    country: 'IN'
  });
  
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [step, setStep] = useState<'form' | 'processing' | 'redirect'>('form');

  useEffect(() => {
    // Pre-fill user data if available
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.email) {
      setCustomerInfo(prev => ({
        ...prev,
        email: userData.email,
        firstName: userData.name?.split(' ')[0] || '',
        lastName: userData.name?.split(' ').slice(1).join(' ') || ''
      }));
    }
  }, []);

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    const required = ['firstName', 'email', 'phone'];
    const missing = required.filter(field => !customerInfo[field as keyof CustomerInfo]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`);
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // Validate phone (Indian format)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(customerInfo.phone.replace(/\D/g, ''))) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setStep('processing');

      // Create payment request
      const paymentRequest = {
        planId,
        billingCycle,
        customerInfo: {
          ...customerInfo,
          phone: customerInfo.phone.replace(/\D/g, '') // Clean phone number
        }
      };

      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentRequest)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create payment');
      }

      if (result.paymentUrl) {
        // Redirect to PayU payment page using direct link
        setStep('redirect');
        setPaymentData(result.payment);
        
        // Store payment data for return handling
        localStorage.setItem('pendingPayment', JSON.stringify({
          paymentId: result.payment.id,
          planId,
          planName,
          amount,
          currency,
          customerInfo
        }));

        // Redirect to PayU payment link
        setTimeout(() => {
          window.location.href = result.paymentUrl;
        }, 2000);
      } else {
        // Free plan or direct activation
        toast.success('Subscription activated successfully!');
        onSuccess?.(result);
      }

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      toast.error(errorMessage);
      onError?.(errorMessage);
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const submitPayUForm = (payuData: any) => {
    // Create a form and submit it to PayU
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://test.payu.in/_payment'; // Use https://secure.payu.in/_payment for production
    
    // Add all PayU parameters as hidden inputs
    Object.keys(payuData).forEach(key => {
      if (payuData[key]) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = payuData[key];
        form.appendChild(input);
      }
    });
    
    // Add form to document and submit
    document.body.appendChild(form);
    form.submit();
  };

  if (step === 'processing') {
    return (
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Processing Payment</h3>
          <p className="text-gray-600 dark:text-slate-400">
            Please wait while we prepare your payment...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'redirect') {
    return (
      <Card className="w-full max-w-md mx-auto bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardContent className="p-8 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Redirecting to PayU</h3>
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            You will be redirected to PayU to complete your payment securely.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <Lock className="w-4 h-4 inline mr-1" />
              Your payment is secured by PayU's 256-bit SSL encryption
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
            <span>{planDisplayName}</span>
            <Badge variant="outline" className="border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300">{billingCycle}</Badge>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-slate-400">
            Complete your subscription to {planName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-white">
            <span>Total Amount:</span>
            <span>{formatAmount(amount, currency)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information Form */}
      <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Billing Information</CardTitle>
          <CardDescription className="text-gray-600 dark:text-slate-400">
            Please provide your details for the subscription
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-gray-900 dark:text-white">First Name *</Label>
              <Input
                id="firstName"
                value={customerInfo.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter first name"
                className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-gray-900 dark:text-white">Last Name</Label>
              <Input
                id="lastName"
                value={customerInfo.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter last name"
                className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-gray-900 dark:text-white">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={customerInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-gray-900 dark:text-white">Mobile Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={customerInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter 10-digit mobile number"
              className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
              maxLength={10}
              required
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-gray-900 dark:text-white">Address</Label>
            <Input
              id="address"
              value={customerInfo.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter address (optional)"
              className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="text-gray-900 dark:text-white">City</Label>
              <Input
                id="city"
                value={customerInfo.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter city"
                className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
              />
            </div>
            <div>
              <Label htmlFor="state" className="text-gray-900 dark:text-white">State</Label>
              <Input
                id="state"
                value={customerInfo.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Enter state"
                className="bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-300">Secure Payment</h4>
              <p className="text-sm text-green-700 dark:text-green-400">
                Your payment is processed securely through PayU with 256-bit SSL encryption. 
                We support all major payment methods including UPI, Net Banking, Credit/Debit Cards, and Wallets.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePayment}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Pay {formatAmount(amount, currency)}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}