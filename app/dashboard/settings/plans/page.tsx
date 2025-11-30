'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Check, 
  Zap, 
  Building2, 
  Rocket,
  X,
  Info
} from 'lucide-react';

export default function ChangePlanPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'standard' | 'premium'>('standard');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      icon: Zap,
      description: 'Perfect for small restaurants getting started',
      monthlyPrice: 1200,
      yearlyPrice: 12000,
      features: [
        '1 Restaurant Profile',
        '3 Digital Menus',
        'Basic QR Codes',
        'Up to 100 menu items',
        'Basic Analytics',
        'Email Support',
      ],
      limitations: [
        'No custom branding',
        'No team members',
      ],
      color: 'blue',
    },
    {
      id: 'standard',
      name: 'Standard',
      icon: Building2,
      description: 'Most popular for growing restaurants',
      monthlyPrice: 2500,
      yearlyPrice: 25000,
      features: [
        '3 Restaurant Profiles',
        'Unlimited Digital Menus',
        'Custom QR Codes',
        'Unlimited menu items',
        'Advanced Analytics',
        'Priority Email Support',
        'Custom Branding',
        'Up to 3 team members',
      ],
      limitations: [],
      color: 'orange',
      popular: true,
      currentPlan: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: Rocket,
      description: 'For established restaurant chains',
      monthlyPrice: 7500,
      yearlyPrice: 75000,
      features: [
        'Unlimited Restaurant Profiles',
        'Unlimited Digital Menus',
        'Premium QR Codes with Analytics',
        'Unlimited menu items',
        'Real-time Analytics & Reports',
        '24/7 Priority Support',
        'White-label Solution',
        'Unlimited team members',
        'API Access',
        'Custom Integrations',
        'Dedicated Account Manager',
      ],
      limitations: [],
      color: 'purple',
    },
  ];

  const getPrice = (plan: typeof plans[0]) => {
    if (billingCycle === 'monthly') {
      return plan.monthlyPrice.toLocaleString();
    }
    const monthlyEquivalent = Math.round(plan.yearlyPrice / 12);
    return monthlyEquivalent.toLocaleString();
  };

  const getYearlySavings = (plan: typeof plans[0]) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const yearlyCost = plan.yearlyPrice;
    const savings = monthlyCost - yearlyCost;
    return Math.round((savings / monthlyCost) * 100);
  };

  const handleChangePlan = () => {
    setShowConfirmModal(true);
  };

  const confirmPlanChange = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowConfirmModal(false);
    router.push('/dashboard/settings?section=billing');
  };

  const ConfirmationModal = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Confirm Plan Change
                </h3>
                <p className="text-sm text-gray-600">
                  You're about to change your plan to <span className="font-semibold">{plan?.name}</span>.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">New Plan</span>
                <span className="font-semibold text-gray-900">{plan?.name}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Billing Cycle</span>
                <span className="font-semibold text-gray-900 capitalize">{billingCycle}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-lg font-bold text-gray-900">
                  {billingCycle === 'monthly' ? plan?.monthlyPrice.toLocaleString() : plan?.yearlyPrice.toLocaleString()} DZD
                  <span className="text-sm font-normal text-gray-600">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Note:</span> Your plan will be changed immediately. 
                {selectedPlan === 'starter' ? ' You will receive a prorated credit.' : ' You will be charged the prorated difference.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmPlanChange}
                className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      {showConfirmModal && <ConfirmationModal />}

      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/dashboard/settings?section=billing')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Change Your Plan</h1>
        <p className="text-gray-600">Choose the plan that best fits your restaurant's needs</p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Billing Cycle</h3>
            <p className="text-sm text-gray-600">Save up to 17% with yearly billing</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              {billingCycle === 'yearly' && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  Save {getYearlySavings(plans[1])}%
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border-2 transition-all relative ${
                isSelected
                  ? 'border-orange-500 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              } ${plan.currentPlan ? 'ring-2 ring-orange-200' : ''}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {plan.currentPlan && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Plan Header */}
                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-lg bg-${plan.color}-100 flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${plan.color}-600`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {getPrice(plan)}
                    </span>
                    <span className="text-gray-600">DZD</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    per {billingCycle === 'monthly' ? 'month' : 'month, billed yearly'}
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Save {getYearlySavings(plan)}% annually
                    </div>
                  )}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => setSelectedPlan(plan.id as any)}
                  disabled={plan.currentPlan}
                  className={`w-full py-3 rounded-lg font-semibold text-sm transition-all mb-6 ${
                    plan.currentPlan
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isSelected
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.currentPlan ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
                </button>

                {/* Features */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-900 mb-3">What's included:</div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-500">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Ready to change your plan?</h3>
            <p className="text-sm text-gray-600">
              {selectedPlan === 'starter' 
                ? 'Downgrade to Starter plan and get a prorated credit'
                : selectedPlan === 'standard'
                ? 'Continue with Standard plan'
                : 'Upgrade to Premium and unlock all features'}
            </p>
          </div>
          <button
            onClick={handleChangePlan}
            disabled={selectedPlan === 'standard'}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedPlan === 'starter' ? 'Downgrade Plan' : 'Upgrade Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}
