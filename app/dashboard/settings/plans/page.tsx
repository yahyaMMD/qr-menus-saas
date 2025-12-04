'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Check, 
  Zap, 
  Building2, 
  Rocket,
  X,
  Loader2,
  Sparkles
} from 'lucide-react';

interface PlanData {
  id: string;
  plan: 'FREE' | 'STANDARD' | 'CUSTOM';
  priceCents: number;
  currency: string;
  description: string;
  features: string[];
  limitations: string[];
}

interface Subscription {
  id: string;
  plan: 'FREE' | 'STANDARD' | 'CUSTOM';
  status: string;
  expiresAt: string;
  active: boolean;
}

type PaymentMethod = 'edahabia' | 'cib';

export default function ChangePlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'FREE' | 'STANDARD' | 'CUSTOM'>('STANDARD');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('edahabia');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      let token = localStorage.getItem('accessToken');
      if (!token) {
        const authRaw = localStorage.getItem('auth');
        if (authRaw) {
          const auth = JSON.parse(authRaw);
          token = auth?.tokens?.accessToken;
        }
      }

      const response = await fetch('/api/plans', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) throw new Error('Failed to fetch plans');

      const data = await response.json();
      setPlans(data.plans);
      
      if (data.currentSubscription) {
        setCurrentSubscription(data.currentSubscription);
        setSelectedPlan(data.currentSubscription.plan);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planId: 'FREE' | 'STANDARD' | 'CUSTOM') => {
    if (planId === currentSubscription?.plan) return;
    setSelectedPlan(planId);
    
    if (planId !== 'FREE' && planId !== currentSubscription?.plan) {
      setShowPaymentModal(true);
    } else if (planId === 'FREE') {
      handleFreePlan();
    }
  };

  const handleFreePlan = async () => {
    setProcessing(true);
    setError('');

    try {
      let token = localStorage.getItem('accessToken');
      if (!token) {
        const authRaw = localStorage.getItem('auth');
        if (authRaw) {
          const auth = JSON.parse(authRaw);
          token = auth?.tokens?.accessToken;
        }
      }

      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ plan: 'FREE', paymentMethod: 'edahabia' }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to activate plan');

      if (data.isFreePlan) {
        router.push('/dashboard/settings?section=billing');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      let token = localStorage.getItem('accessToken');
      if (!token) {
        const authRaw = localStorage.getItem('auth');
        if (authRaw) {
          const auth = JSON.parse(authRaw);
          token = auth?.tokens?.accessToken;
        }
      }

      if (!token) {
        router.push('/auth/login?callbackUrl=/dashboard/settings/plans');
        return;
      }

      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to create payment session');

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'FREE': return Zap;
      case 'STANDARD': return Building2;
      case 'CUSTOM': return Rocket;
      default: return Zap;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'FREE': return 'emerald';
      case 'STANDARD': return 'orange';
      case 'CUSTOM': return 'violet';
      default: return 'gray';
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-orange-50/30 min-h-screen">
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
              <h3 className="text-xl font-bold text-white">Complete Your Upgrade</h3>
              <p className="text-orange-100 text-sm mt-1">
                Upgrade to {selectedPlan} plan
              </p>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('edahabia')}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      paymentMethod === 'edahabia'
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'edahabia' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'edahabia' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">EDAHABIA</p>
                        <p className="text-xs text-gray-500">Algerie Poste</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('cib')}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${
                      paymentMethod === 'cib'
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'cib' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'cib' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">CIB</p>
                        <p className="text-xs text-gray-500">SATIM</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/dashboard/settings?section=billing')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-gray-600">Select the plan that best fits your restaurant's needs</p>
      </div>

      {error && !showPaymentModal && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const Icon = getPlanIcon(plan.plan);
          const color = getPlanColor(plan.plan);
          const isCurrentPlan = currentSubscription?.plan === plan.plan;
          const isSelected = selectedPlan === plan.plan;
          const isPopular = plan.plan === 'STANDARD';

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border-2 transition-all relative overflow-hidden ${
                isSelected && !isCurrentPlan
                  ? 'border-orange-500 shadow-xl shadow-orange-500/10'
                  : isCurrentPlan
                  ? 'border-emerald-400 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                    MOST POPULAR
                  </div>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-6 pt-8">
                {/* Plan Header */}
                <div className="mb-6">
                  <div className={`w-14 h-14 rounded-xl bg-${color}-100 flex items-center justify-center mb-4`}
                    style={{ backgroundColor: color === 'emerald' ? '#d1fae5' : color === 'orange' ? '#ffedd5' : '#ede9fe' }}>
                    <Icon className={`w-7 h-7`} 
                      style={{ color: color === 'emerald' ? '#059669' : color === 'orange' ? '#ea580c' : '#7c3aed' }} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.plan}</h3>
                  <p className="text-sm text-gray-500">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="mb-6 pb-6 border-b border-gray-100">
                  {plan.priceCents === 0 ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">Free</span>
                      <span className="text-gray-500">forever</span>
                    </div>
                  ) : plan.plan === 'CUSTOM' ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">Custom</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(plan.priceCents)}
                      </span>
                      <span className="text-gray-500">{plan.currency}/mo</span>
                    </div>
                  )}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelectPlan(plan.plan)}
                  disabled={isCurrentPlan || processing || plan.plan === 'CUSTOM'}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all mb-6 ${
                    isCurrentPlan
                      ? 'bg-emerald-100 text-emerald-700 cursor-default'
                      : plan.plan === 'CUSTOM'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isCurrentPlan 
                    ? 'Current Plan' 
                    : plan.plan === 'CUSTOM'
                    ? 'Contact Sales'
                    : plan.priceCents === 0 
                    ? 'Get Started Free' 
                    : 'Select Plan'}
                </button>

                {/* Features */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    What's included
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-400">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Need help choosing?</h3>
            <p className="text-sm text-gray-600">
              Contact our team for personalized recommendations based on your restaurant's needs.
            </p>
          </div>
          <button className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
