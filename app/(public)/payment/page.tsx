'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaymentMethod } from '@/lib/chargily';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const [selectedPlan, setSelectedPlan] = useState(plan || 'STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('edahabia');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Check auth on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth?action=me', { credentials: 'include' });
        if (response.ok) {
          setAccessToken('present');
          setIsCheckingAuth(false);
          return;
        }
      } catch (err) {
        console.warn('Could not check auth', err);
      }
      // No token found, redirect to login
      setIsCheckingAuth(false);
      router.push('/auth/login?callbackUrl=/payment');
    };

    checkAuth();
  }, [router]);

  const handlePayment = async () => {
    if (!accessToken) {
      setError('You must be logged in to proceed with payment');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod: paymentMethod
        }),
      });

      console.log('Payment response status:', response.status);

      // Handle authentication errors returned from server
      if (response.status === 401) {
        console.error('Payment API returned 401 Unauthorized');
        setIsLoading(false);
        router.push('/auth/login?callbackUrl=/payment');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment session');
      }

      // Handle free plan activation
      if (data.isFreePlan) {
        alert('Free plan activated successfully!');
        router.push('/dashboard');
        return;
      }

      // Redirect to Chargily checkout for paid plans
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (err: any) {
      setError(err.message);
      console.error('Payment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: 'FREE',
      name: 'Free',
      price: 0,
      features: [
        '1 Active Profile',
        'Basic Menu Features',
        'Standard Support',
        'Limited Analytics'
      ]
    },
    {
      id: 'STANDARD',
      name: 'Standard',
      price: 2500,
      features: [
        '5 Active Profiles',
        'Advanced Menu Features',
        'Priority Support',
        'Full Analytics Access',
        'Custom Domain'
      ]
    },
    {
      id: 'CUSTOM',
      name: 'Custom',
      price: 4000,
      features: [
        'Unlimited Profiles',
        'All Advanced Features',
        '24/7 Dedicated Support',
        'Advanced Analytics',
        'Custom Branding',
        'API Access'
      ]
    }
  ];

  const currentPlan = plans.find(p => p.id === selectedPlan);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your digital menu needs. All plans include our core features with no hidden fees.
          </p>
        </div>

        {error && (
          <div className="mb-6 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((planItem) => (
            <div
              key={planItem.id}
              className={`bg-white rounded-xl shadow-lg p-8 border-2 transition-all duration-200 ${selectedPlan === planItem.id
                  ? 'border-blue-500 transform scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                }`}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {planItem.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {planItem.price === 0 ? 'Free' : `${planItem.price} DA`}
                  </span>
                  {planItem.price > 0 && (
                    <span className="text-gray-600 text-lg">/month</span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {planItem.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-gray-600">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelectedPlan(planItem.id)}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${selectedPlan === planItem.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {selectedPlan === planItem.id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {currentPlan && currentPlan.price > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-md p-8 mb-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Payment Method
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setPaymentMethod('edahabia')}
                  className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${paymentMethod === 'edahabia'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'edahabia'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                        }`}
                    >
                      {paymentMethod === 'edahabia' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">EDAHABIA</p>
                      <p className="text-gray-600">Algerie Poste</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('cib')}
                  className={`p-6 border-2 rounded-xl text-left transition-all duration-200 ${paymentMethod === 'cib'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${paymentMethod === 'cib'
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                        }`}
                    >
                      {paymentMethod === 'cib' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">CIB</p>
                      <p className="text-gray-600">SATIM</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6 max-w-2xl mx-auto">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Order Summary</h4>
                <div className="flex justify-between items-center text-gray-600">
                  <span>{currentPlan.name} Plan</span>
                  <span className="font-semibold">{currentPlan.price} DA</span>
                </div>
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between items-center font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-blue-600">{currentPlan.price} DA</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="bg-blue-600 text-white py-4 px-12 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Processing...
                  </div>
                ) : (
                  `Pay ${currentPlan.price} DA`
                )}
              </button>

              <p className="text-sm text-gray-500 mt-4">
                You will be redirected to secure payment page
              </p>
            </div>
          </>
        )}

        {currentPlan && currentPlan.price === 0 && (
          <div className="text-center">
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="bg-green-600 text-white py-4 px-12 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Activating...
                </div>
              ) : (
                'Activate Free Plan'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}