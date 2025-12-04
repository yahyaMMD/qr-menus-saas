'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  ArrowLeft, 
  ShieldX,
  LayoutDashboard,
  LogIn,
  Crown,
  Lock
} from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();

  const quickLinks = [
    {
      title: 'Upgrade Plan',
      description: 'Unlock premium features',
      icon: Crown,
      href: '/dashboard/settings/plans',
      color: 'orange',
    },
    {
      title: 'Sign In',
      description: 'Log in to your account',
      icon: LogIn,
      href: '/auth/login',
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
      title: 'Go Home',
      description: 'Return to homepage',
      icon: Home,
      href: '/',
      color: 'green',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Main Content */}
        <div className="text-center mb-12">
          {/* Animated 403 */}
          <div className="mb-8 relative">
            <div className="text-[180px] font-bold text-gray-200 leading-none select-none">
              403
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Floating Shield Icon */}
                <div className="animate-shake">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <ShieldX className="w-12 h-12 text-white" />
                  </div>
                </div>
                {/* Lock icon */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Lock className="w-5 h-5 text-red-500" />
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-amber-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Access Forbidden
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            You don't have permission to access this resource.
          </p>
          <p className="text-gray-500 max-w-md mx-auto">
            This might be because you need to upgrade your plan, sign in with a different account, or you simply don't have the required permissions.
          </p>
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

            return (
              <Link
                key={idx}
                href={link.href}
                className="group bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-orange-500 hover:shadow-lg transition-all duration-300"
              >
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
              </Link>
            );
          })}
        </div>

        {/* Upgrade CTA */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-semibold text-white mb-1">
                  Need more access?
                </h3>
                <p className="text-sm text-white/80">
                  Upgrade your plan to unlock all features
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
                className="px-5 py-2.5 bg-white text-orange-600 rounded-lg hover:bg-white/90 transition-colors font-medium"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Error Code: 403 • Forbidden
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
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-shake { animation: shake 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

