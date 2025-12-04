'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  RefreshCw, 
  ArrowLeft, 
  AlertTriangle,
  HelpCircle,
  ServerCrash
} from 'lucide-react';

export default function Error({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void 
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Main Content */}
        <div className="text-center mb-8">
          {/* Animated Error Icon */}
          <div className="mb-6 relative inline-block">
            <div className="animate-pulse">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto">
                <ServerCrash className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 rounded-full animate-ping opacity-75"></div>
          </div>

          {/* Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Something Went Wrong
          </h1>
          <p className="text-gray-600 mb-2">
            An unexpected error occurred while loading this page.
          </p>
          
          {/* Error Details (dev only) */}
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium text-red-700">Error Details</span>
              </div>
              <p className="text-xs text-red-600 font-mono break-all">{error.message}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link href="/help" className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors">
            <HelpCircle className="w-4 h-4" />
            Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
