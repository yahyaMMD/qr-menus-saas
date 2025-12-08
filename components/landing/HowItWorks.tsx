// @ts-nocheck
'use client'
import React from 'react'
import Image from 'next/image'
import menuIcon from '@/public/assets/menu-icon.svg'
import qrIcon from '@/public/assets/qr-icon.svg'
import analyticsIcon from '@/public/assets/analytics-icon.svg'
import imageMenu from '@/public/assets/step1.png'
import imageQr from '@/public/assets/step2.png'
import imageAnalytics from '@/public/assets/step3.png'

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Create Your Menu',
      description: 'Build your menu and Add items, photos, and customize everything to match your brand.',
      icon: menuIcon,
      image: imageMenu,
      color: 'from-gray-50 to-gray-100',
      bgColor: 'bg-gray-50',
      iconBg: 'from-gray-50 to-gray-100',
    },
    {
      number: '2',
      title: 'Generate QR Code',
      description: 'Instantly generate a QR code for your digital menu. Print it everywhere in your restaurant.',
      icon: qrIcon,
      image: imageQr,
      color: 'from-gray-50 to-gray-100',
      bgColor: 'bg-gray-50',
      iconBg: 'from-gray-50 to-gray-100',
    },
    {
      number: '3',
      title: 'Customers Scan & View',
      description: 'Customers scan and browse your menu. Get analytics on popular items and user counts.',
      icon: analyticsIcon,
      image: imageAnalytics,
      color: 'from-gray-50 to-gray-100',
      bgColor: 'bg-gray-50',
      iconBg: 'from-gray-50 to-gray-100',
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-100/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-gray-100/30 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
              Simple Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get your digital menu up and running in three simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              {/* Connecting line (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-orange-300 to-transparent"></div>
              )}
              
              <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:scale-105 group-hover:-translate-y-2">
                {/* Step Number Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg text-white font-bold text-lg">
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${step.iconBg} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Image
                    src={step.icon}
                    alt={step.title}
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                </div>

                {/* Content */}
                <div className="text-center space-y-3 mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>

                {/* Image */}
                <div className={`h-48 ${step.bgColor} rounded-xl flex items-center justify-center relative overflow-hidden group-hover:shadow-inner transition-all duration-300`}>
                  <Image
                    src={step.image}
                    alt={`${step.title} illustration`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-3 rounded-full">
            <span className="text-gray-700 font-medium">Ready to get started?</span>
            <a href="/dashboard" className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
              Create your menu now →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}