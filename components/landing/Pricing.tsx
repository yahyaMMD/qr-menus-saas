// @ts-nocheck
'use client'

import React from 'react'
import { Check } from 'lucide-react'

export default function Pricing() {
  const plans = [
    {
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
  ]

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
                className={`w-full py-3 px-6 rounded-lg font-semibold transition ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="text-orange-500 font-semibold hover:underline">
            View All Plans
          </button>
        </div>
      </div>
    </section>
  )
}
