// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PaymentMethod } from '@/lib/chargily'
import Link from 'next/link'

export default function Pricing() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('edahabia');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  // Check auth on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authRaw = localStorage.getItem('auth');
        console.log('Pricing section - Auth raw:', authRaw ? authRaw.substring(0, 100) + '...' : 'null');
        if (authRaw) {
          const auth = JSON.parse(authRaw);
          console.log('Pricing section - Auth parsed:', { 
            hasTokens: !!auth?.tokens,
            hasAccessToken: !!auth?.tokens?.accessToken,
            tokenStart: auth?.tokens?.accessToken?.substring(0, 30)
          });
          const token = auth?.tokens?.accessToken || null;
          if (token) {
            console.log('Pricing section - Token found:', token.substring(0, 30) + '...');
            setAccessToken(token);
            setIsCheckingAuth(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not read auth from localStorage', err);
      }
      // No token found, we'll handle it when user tries to purchase
      console.warn('Pricing section - No token found');
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  const handlePayment = async (planId: string, planName: string) => {
    if (!accessToken) {
      setError('You must be logged in to proceed with payment');
      router.push('/auth/login?callbackUrl=/');
      return;
    }

    // For free plan, proceed directly
    if (planId === 'FREE') {
      await processPayment(planId, planName);
      return;
    }

    // For paid plans, show payment methods
    setSelectedPlan(planId);
    setShowPaymentMethods(true);
  };

  const processPayment = async (planId: string, planName: string) => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Payment request - Sending token:', accessToken?.substring(0, 20) + '...');
      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          plan: planId,
          paymentMethod: paymentMethod
        }),
      });

      console.log('Payment response status:', response.status);

      // Handle authentication errors returned from server
      if (response.status === 401) {
        console.error('Payment API returned 401 Unauthorized');
        setIsLoading(false);
        router.push('/auth/login?callbackUrl=/');
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

  const handleProceedToPayment = async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (plan) {
      await processPayment(plan.id, plan.name);
    }
  };

  const [plans, setPlans] = useState([
    {
      id: 'FREE',
      name: 'Free',
      price: 'Free',
      period: 'Forever',
      features: [
        '1 Restaurant Profile',
        '1 Menu',
        'QR Code Generation',
      ],
      buttonText: 'Get Started',
      buttonStyle: 'border-2 border-gray-300 text-gray-900 hover:bg-gray-50',
      popular: false,
    },
    {
      id: 'STANDARD',
      name: 'Standard',
      price: '2,500 DZD',
      period: 'per month',
      features: [
        '3 Restaurant Profiles',
        '3 Menus per Restaurant',
        'QR Code Generation',
        'Advanced Analytics',
        'Priority Support',
      ],
      buttonText: 'Get This Plan',
      buttonStyle: 'bg-orange-500 text-white hover:bg-orange-600',
      popular: true,
    },
    {
      id: 'CUSTOM',
      name: 'Custom',
      price: 'Custom',
      period: 'pricing',
      features: [
        'Unlimited Profiles',
        'Unlimited Menus',
        'QR Code Generation',
        'Custom Website',
        'Dedicated Support',
      ],
      buttonText: 'Contact Sales',
      buttonStyle: 'border-2 border-gray-300 text-gray-900 hover:bg-gray-50',
      popular: false,
    },
  ]);

  // Fetch real plan pricing from database
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/admin/plans');
        if (response.ok) {
          const data = await response.json();
          if (data.plans && data.plans.length > 0) {
            // Update plans with real pricing data
            setPlans(prevPlans => prevPlans.map(plan => {
              const dbPlan = data.plans.find((p: any) => p.plan === plan.id);
              if (dbPlan && plan.id !== 'CUSTOM') {
                const priceDisplay = plan.id === 'FREE' 
                  ? 'Free' 
                  : `${(dbPlan.priceCents / 100).toLocaleString()} ${dbPlan.currency}`;
                return {
                  ...plan,
                  price: priceDisplay,
                  priceCents: dbPlan.priceCents,
                  currency: dbPlan.currency,
                };
              }
              return plan;
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        // Continue with default hardcoded prices if fetch fails
      }
    };

    fetchPlans();
  }, [])

  const currentPlan = plans.find(p => p.id === selectedPlan);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <section className="py-20 bg-gray-50" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that fits your restaurant
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Payment Method Modal */}
        {showPaymentMethods && currentPlan && currentPlan.id !== 'FREE' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose Payment Method</h3>
              <p className="text-gray-600 mb-6">Select your preferred payment method for the {currentPlan.name} plan</p>
              
              <div className="space-y-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('edahabia')}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    paymentMethod === 'edahabia'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        paymentMethod === 'edahabia'
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'edahabia' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">EDAHABIA</p>
                      <p className="text-gray-600 text-sm">Algerie Poste</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('cib')}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    paymentMethod === 'cib'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        paymentMethod === 'cib'
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'cib' && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">CIB</p>
                      <p className="text-gray-600 text-sm">SATIM</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentMethods(false)}
                  className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToPayment}
                  disabled={isLoading}
                  className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay Now`
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-xl p-8 shadow-lg relative ${
                plan.popular ? 'border-2 border-orange-500 scale-105' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                </div>
                <p className="text-gray-600 text-sm">{plan.period}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment(plan.id, plan.name)}
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition ${plan.buttonStyle} ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  plan.buttonText
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="text-orange-500 font-semibold hover:underline">
            <Link href="/pricing">
            View All Plans
            </Link>
          </button>
        </div>
      </div>
    </section>
  )
}