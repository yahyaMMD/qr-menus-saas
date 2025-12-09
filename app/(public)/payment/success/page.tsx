'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your payment. Your subscription has been activated.
        </p>
        {sessionId && (
          <p className="text-sm text-gray-500 mb-6">
            Reference: {sessionId}
          </p>
        )}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/profiles"
            className="block w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition duration-200"
          >
            Manage Profiles
          </Link>
        </div>
      </div>
    </div>
  );
}
