'use client';

import { useState } from 'react';
import SignInForm from '../../components/auth/SignInForm';
import SignUpForm from '../../components/auth/SignUpForm';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex flex-col gap-1">
                <div className="w-6 h-0.5 bg-orange-500"></div>
                <div className="w-6 h-0.5 bg-orange-500"></div>
                <div className="w-6 h-0.5 bg-orange-500"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">MenuLix</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignIn ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-sm text-gray-600">
              {isSignIn
                ? 'Sign in to your account to continue'
                : 'Sign up to get started'}
            </p>
          </div>

          {/* Form */}
          <div className="mb-6">
            {isSignIn ? <SignInForm /> : <SignUpForm />}
          </div>

          {/* Toggle */}
          <div className="text-center text-sm">
            {isSignIn ? (
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => setIsSignIn(false)}
                  className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => setIsSignIn(true)}
                  className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500">
            By {isSignIn ? 'signing in' : 'signing up'}, you agree to our{' '}
            <a href="/terms" className="text-orange-500 hover:text-orange-600">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-orange-500 hover:text-orange-600">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

