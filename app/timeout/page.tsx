'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  RefreshCw, 
  ArrowLeft, 
  Clock,
  LayoutDashboard,
  HelpCircle,
  Hourglass
} from 'lucide-react';

export default function TimeoutPage() {
  const router = useRouter();

  const handleRetry = () => {
    router.back();
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const quickLinks = [
    {
      title: 'Try Again',
      description: 'Retry the request',
      icon: RefreshCw,
      action: handleRetry,
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
    {
      title: 'Get Help',
      description: 'Contact our support team',
      icon: HelpCircle,
      href: '/help',
      color: 'green',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main Content */}
        <div className="text-center mb-12">
          {/* Animated 408 */}
          <div className="mb-8 relative">
            <div className="text-[180px] font-bold text-gray-200 leading-none select-none">
              408
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Animated Clock Icon */}
                <div className="animate-spin-slow">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Clock className="w-12 h-12 text-white" />
                  </div>
                </div>
                {/* Hourglass */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Hourglass className="w-5 h-5 text-orange-500" />
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-red-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Request Timeout
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            The server took too long to respond.
          </p>
          <p className="text-gray-500 max-w-md mx-auto">
            This could be due to slow network connection, high server load, or a complex request. Please try again in a moment.
          </p>

          {/* Connection Tips */}
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl max-w-lg mx-auto">
            <p className="text-sm text-orange-700">
              <strong>Tips:</strong> Check your internet connection, try refreshing the page, or wait a few minutes before trying again.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {quickLinks.map((link, idx) => {
            const Icon = link.icon;
            const colorClasses = {
              orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-500',
              blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-500',
              purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-500',
              green: 'bg-green-100 text-green-600 group-hover:bg-green-500',
            };

            const content = (
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 ${colorClasses[link.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 transform rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
            );

            if (link.action) {
              return (
                <button
                  key={idx}
                  onClick={link.action}
                  className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-orange-500 hover:shadow-lg transition-all duration-300 text-left w-full"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={idx}
                href={link.href!}
                className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-orange-500 hover:shadow-lg transition-all duration-300"
              >
                {content}
              </Link>
            );
          })}
        </div>

        {/* Alternative Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Taking longer than expected?
                </h3>
                <p className="text-sm text-gray-600">
                  Our servers might be experiencing high load
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <button
                onClick={handleRetry}
                className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Now
              </button>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Error Code: 408 • Request Timeout
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
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
    </div>
  );
}

