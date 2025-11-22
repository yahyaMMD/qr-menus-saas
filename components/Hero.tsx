// @ts-nocheck
import Link from 'next/link'
import Image from 'next/image'
import heroImage from '@/public/assets/hero-image.png'

export default function Hero() {
  return (
    <section className="bg-orange-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Transform Your Restaurant Menu. Digitally.
            </h1>
            <p className="text-lg text-gray-700">
              Upload your digital menus, generate QR codes, and get real-time analytics - all in one
              platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#get-started"
                className="bg-orange-500 text-white px-8 py-4 rounded-lg hover:bg-orange-600 transition font-semibold text-center"
              >
                Get Started Free
              </Link>
              <Link
                href="#pricing"
                className="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-900 hover:text-white transition font-semibold text-center"
              >
                View Pricing
              </Link>
            </div>
          </div>

          {/* Right Image - Leave space for your image */}
          <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
            <Image
              src={heroImage}
              alt="Restaurant Menu"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
