'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  RefreshCw, 
  ArrowLeft, 
  Zap,
  LayoutDashboard,
  Crown,
  Timer
} from 'lucide-react';

export default function TooManyRequestsPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const quickLinks = [
    {
      title: 'Upgrade Plan',
      description: 'Get higher limits',
      icon: Crown,
      href: '/dashboard/settings/plans',
      color: 'orange',
    },
    {
      title: 'Go Home',
      description: 'Return to homepage',
      icon: Home,
      href: '/',
      color: 'blue',
    },
    {
      title: 'Dashboard',
      description: 'Go to your dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main Content */}
        <div className="text-center mb-12">
          {/* Animated 429 */}
          <div className="mb-8 relative">
            <div className="text-[180px] font-bold text-gray-200 leading-none select-none">
              429
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Animated Zap Icon */}
                <div className="animate-zap">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Zap className="w-12 h-12 text-white" />
                  </div>
                </div>
                {/* Timer icon */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Timer className="w-5 h-5 text-orange-500" />
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-orange-400 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Too Many Requests
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            You've hit your rate limit for now.
          </p>
          <p className="text-gray-500 max-w-md mx-auto">
            Your plan has usage limits to ensure fair access for everyone. Wait a moment or upgrade your plan for higher limits.
          </p>

          {/* Countdown Timer */}
          <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-orange-100 border border-orange-200 rounded-full">
            <Timer className="w-5 h-5 text-orange-600" />
            <span className="text-orange-800 font-medium">
              {countdown > 0 ? (
                <>Try again in <span className="font-bold text-orange-900">{countdown}s</span></>
              ) : (
                <span className="text-green-700">You can try again now!</span>
              )}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {quickLinks.map((link, idx) => {
            const Icon = link.icon;
            const colorClasses = {
              orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-500',
              blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-500',
              purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-500',
            };

            return (
              <Link
                key={idx}
                href={link.href}
                className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-orange-500 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${colorClasses[link.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-7 h-7 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Upgrade CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-semibold text-white mb-1">
                  Need higher limits?
                </h3>
                <p className="text-sm text-white/80">
                  Upgrade your plan for more QR scans and features
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="px-5 py-2.5 border-2 border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <Link
                href="/dashboard/settings/plans"
                className="px-5 py-2.5 bg-white text-orange-600 rounded-lg hover:bg-white/90 transition-colors font-medium flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Error Code: 429 • Too Many Requests
          </p>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-red-200 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-amber-200 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-yellow-200 rounded-full opacity-20 animate-float-delayed"></div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes zap {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-zap { animation: zap 0.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

