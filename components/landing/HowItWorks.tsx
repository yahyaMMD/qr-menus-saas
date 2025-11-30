// @ts-nocheck
'use client'

import React from 'react'
import Image from 'next/image'
import menuIcon from '@/public/assets/menu-icon.svg'
import qrIcon from '@/public/assets/qr-icon.svg'
import analyticsIcon from '@/public/assets/analytics-icon.svg'
import imageMenu from '@/public/assets/image-menu.png'
import imageQr from '@/public/assets/image-qr.png'
import imageAnalytics from '@/public/assets/image-analytics.png'

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Create Your Menu',
      description:
        'Build your menu with our intuitive interface. customize everything to match your brand.',
      icon: menuIcon,
      image: imageMenu,
    },
    {
      number: '2',
      title: 'Generate QR Code',
      description:
        'Instantly generate a QR code for your digital menu. Print it everywhere in your restaurant.',
      icon: qrIcon,
      image: imageQr,
    },
    {
      number: '3',
      title: 'Customers Scan & View',
      description:
        'Customers scan and browse your menu. Get analytics on popular items and user counts.',
      icon: analyticsIcon,
      image: imageAnalytics,
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get your digital menu up and running in three simple steps
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step) => (
            <div key={step.number} className="text-center space-y-4">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-lg flex items-center justify-center">
                <Image
                  src={step.icon}
                  alt={step.title}
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </div>

              {/* Step Number & Title */}
              <div className="space-y-2">
                <div className="text-orange-500 font-semibold text-sm">
                  Step {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>

              {/* Image */}
              <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center mt-6 relative overflow-hidden">
                <Image
                  src={step.image}
                  alt={`${step.title} illustration`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
