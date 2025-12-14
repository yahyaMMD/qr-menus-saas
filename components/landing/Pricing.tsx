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
  const [loginPrompt, setLoginPrompt] = useState<{ open: boolean; planId: string | null }>({ open: false, planId: null });
  const [freePlanSuccess, setFreePlanSuccess] = useState<{ open: boolean; planName: string; message: string }>({
    open: false,
    planName: '',
    message: '',
  });

  // Check auth on component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        let token: string | null = localStorage.getItem('accessToken');
        if (!token) {
          const authRaw = localStorage.getItem('authTokens') || localStorage.getItem('auth');
          if (authRaw) {
            const auth = JSON.parse(authRaw);
            token = auth?.accessToken || auth?.tokens?.accessToken || null;
          }
        }
        if (token) {
          setAccessToken(token);
        }
      } catch (err) {
        console.warn('Could not read auth from localStorage', err);
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  const handlePayment = async (planId: string, planName: string) => {
    if (!accessToken) {
      setError('');
      setLoginPrompt({ open: true, planId });
      return;
    }

    if (planId === 'FREE') {
      await processPayment(planId, planName);
      return;
    }

    setSelectedPlan(planId);
    setShowPaymentMethods(true);
  };

  const processPayment = async (planId: string, planName: string) => {
    setIsLoading(true);
    setError('');

    try {
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

      if (data.isFreePlan) {
        setShowPaymentMethods(false);
        setFreePlanSuccess({
          open: true,
          planName,
          message: data.message || 'Your Free plan is now active.',
        });
        return;
      }

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
      buttonStyle: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700',
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

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/admin/plans');
        if (response.ok) {
          const data = await response.json();
          if (data.plans && data.plans.length > 0) {
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
      }
    };

    fetchPlans();
  }, [])

  const currentPlan = plans.find(p => p.id === selectedPlan);

  if (isCheckingAuth) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden" id="pricing">
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
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden" id="pricing">
      {/* Decorative elements */}
      <div className="absolute top-0 right-20 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-20 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Login prompt modal */}
        {loginPrompt.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sign in required</h3>
              <p className="text-gray-600 mb-6">
                You need to log in to subscribe to a plan. Continue to login and come back to complete your purchase.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setLoginPrompt({ open: false, planId: null })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const callback = '/pricing';
                    router.push(`/auth/login?callbackUrl=${encodeURIComponent(callback)}`);
                  }}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Go to login
                </button>
              </div>
            </div>
          </div>
        )}

        {freePlanSuccess.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4 text-center">
              <h3 className="text-xl font-bold text-gray-900">Free plan activated</h3>
              <p className="text-gray-600">
                {freePlanSuccess.message} You are now on the {freePlanSuccess.planName} plan.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => setFreePlanSuccess({ open: false, planName: '', message: '' })}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
              Pricing Plans
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that fits your restaurant
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl">
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose Payment Method</h3>
              <p className="text-gray-600 mb-6">Select your preferred payment method for the {currentPlan.name} plan</p>
              
              <div className="space-y-4 mb-6">
                <button
                  onClick={() => setPaymentMethod('edahabia')}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-300 ${
                    paymentMethod === 'edahabia'
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                        paymentMethod === 'edahabia'
                          ? 'border-orange-500 bg-orange-500 shadow-sm'
                          : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'edahabia' && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">EDAHABIA</p>
                      <p className="text-gray-600 text-sm">Algerie Poste</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setPaymentMethod('cib')}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all duration-300 ${
                    paymentMethod === 'cib'
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center transition-all duration-200 ${
                        paymentMethod === 'cib'
                          ? 'border-orange-500 bg-orange-500 shadow-sm'
                          : 'border-gray-300'
                      }`}
                    >
                      {paymentMethod === 'cib' && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">CIB</p>
                      <p className="text-gray-600 text-sm">SATIM</p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentMethods(false)}
                  className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleProceedToPayment}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
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
              className={`bg-white rounded-2xl p-8 relative transition-all duration-500 hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-2 border-orange-500 shadow-2xl scale-105 hover:shadow-orange-200' 
                  : 'border border-gray-200 shadow-lg hover:shadow-xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ⭐ Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6 pt-2">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {plan.price}
                  </span>
                </div>
                <p className="text-gray-500 text-sm font-medium">{plan.period}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment(plan.id, plan.name)}
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 ${plan.buttonStyle} ${
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
          <Link href="/pricing" className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:text-orange-700 transition-colors group">
            View All Plans
            <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
