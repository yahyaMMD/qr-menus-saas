// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import heroImage from '@/public/assets/hero.jpg'

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 py-20 lg:py-32 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
                ✨ Transform Your Business
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Transform Your Restaurant Menu.{' '}
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Digitally.
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Upload your digital menus, generate QR codes, and get real-time analytics - all in one
              platform. Elevate your customer experience today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold text-center shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                Get Started Free
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              <Link
                href="/pricing"
                className="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-xl hover:bg-gray-900 hover:text-white transition-all duration-300 font-semibold text-center"
              >
                View Pricing
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-orange-200 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-orange-300 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-orange-400 border-2 border-white"></div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">500+ Restaurants</div>
                <div className="text-sm text-gray-600">Trust Qresto</div>
              </div>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-2xl blur-2xl"></div>
            <div className="relative h-[430px] lg:h-[650px] rounded-2xl overflow-hidden shadow-2xl bg-white/50 backdrop-blur-sm border border-white/20 hover:scale-105 transition-transform duration-500">
              <Image
                src={heroImage}
                alt="Restaurant Menu"
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Easy Setup</div>
                  <div className="text-sm text-gray-600">In 5 minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}