'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar,
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Pause,
  Play,
  Trash2
} from 'lucide-react';

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'paused' | 'cancelled'>('active');

  const CancelSubscriptionModal = () => {
    const [reason, setReason] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCancel = async () => {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubscriptionStatus('cancelled');
      setIsProcessing(false);
      setShowCancelModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Cancel Subscription
                </h3>
                <p className="text-sm text-gray-600">
                  We're sorry to see you go. Please let us know why you're canceling.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select a reason...</option>
                  <option value="too-expensive">Too expensive</option>
                  <option value="missing-features">Missing features I need</option>
                  <option value="not-using">Not using the service enough</option>
                  <option value="switching">Switching to a competitor</option>
                  <option value="temporary">Temporary closure</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional feedback (optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Tell us more about your experience..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-900">
                <span className="font-semibold">What happens next:</span>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• You'll keep access until December 1, 2025</li>
                  <li>• No refunds for the current billing period</li>
                  <li>• All your data will be deleted after 30 days</li>
                  <li>• You can reactivate anytime before then</li>
                </ul>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={!reason || isProcessing}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PauseSubscriptionModal = () => {
    const [pauseDuration, setPauseDuration] = useState('1');
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePause = async () => {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscriptionStatus('paused');
      setIsProcessing(false);
      setShowPauseModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
          <div className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Pause className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Pause Subscription
                </h3>
                <p className="text-sm text-gray-600">
                  Taking a break? You can pause your subscription and resume anytime.
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pause duration
              </label>
              <select
                value={pauseDuration}
                onChange={(e) => setPauseDuration(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="1">1 month</option>
                <option value="2">2 months</option>
                <option value="3">3 months</option>
              </select>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">During the pause:</span>
                <ul className="mt-2 space-y-1 ml-4">
                  <li>• Your data will be preserved</li>
                  <li>• No charges will be made</li>
                  <li>• Menus will remain accessible (view-only)</li>
                  <li>• Resume date: January 28, 2026</li>
                </ul>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPauseModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePause}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Pause Subscription'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      {showCancelModal && <CancelSubscriptionModal />}
      {showPauseModal && <PauseSubscriptionModal />}

      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push('/dashboard/settings?section=billing')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Subscription</h1>
        <p className="text-gray-600">View and manage your subscription details</p>
      </div>

      {/* Subscription Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {subscriptionStatus === 'active' && (
              <>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Active Subscription</h3>
                  <p className="text-sm text-gray-600">Your subscription is active and running smoothly</p>
                </div>
              </>
            )}
            {subscriptionStatus === 'paused' && (
              <>
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Pause className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Subscription Paused</h3>
                  <p className="text-sm text-gray-600">Your subscription is currently paused until January 28, 2026</p>
                </div>
              </>
            )}
            {subscriptionStatus === 'cancelled' && (
              <>
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Subscription Cancelled</h3>
                  <p className="text-sm text-gray-600">Your subscription will end on December 1, 2025</p>
                </div>
              </>
            )}
          </div>
          {subscriptionStatus === 'paused' && (
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2">
              <Play className="w-4 h-4" />
              Resume Now
            </button>
          )}
          {subscriptionStatus === 'cancelled' && (
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Reactivate
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Current Plan */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Current Plan</h3>
          </div>
          <div className="mb-4">
            <div className="text-2xl font-bold text-gray-900">Standard</div>
            <div className="text-sm text-gray-600">Monthly billing</div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">2,500 DZD</div>
          <div className="text-sm text-gray-500 mb-4">per month</div>
          <button
            onClick={() => router.push('/dashboard/settings/plans')}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            Change Plan
          </button>
        </div>

        {/* Next Billing Date */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Next Billing</h3>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-900">Dec 1, 2025</div>
            <div className="text-sm text-gray-600">3 days remaining</div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Amount due</span>
              <span className="font-semibold text-gray-900">2,500 DZD</span>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Usage</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Restaurants</span>
                <span className="font-semibold text-gray-900">3 / 3</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-full"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Active Menus</span>
                <span className="font-semibold text-gray-900">6 / ∞</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: 'Nov 1, 2025', desc: 'Standard Plan - Monthly', amount: '2,500 DZD', status: 'Paid', id: 'INV-2025-11' },
                { date: 'Oct 1, 2025', desc: 'Standard Plan - Monthly', amount: '2,500 DZD', status: 'Paid', id: 'INV-2025-10' },
                { date: 'Sep 1, 2025', desc: 'Standard Plan - Monthly', amount: '2,500 DZD', status: 'Paid', id: 'INV-2025-09' },
                { date: 'Aug 1, 2025', desc: 'Standard Plan - Monthly', amount: '2,500 DZD', status: 'Paid', id: 'INV-2025-08' },
                { date: 'Jul 1, 2025', desc: 'Standard Plan - Monthly', amount: '2,500 DZD', status: 'Paid', id: 'INV-2025-07' },
              ].map((invoice, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">{invoice.date}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{invoice.desc}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{invoice.amount}</td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {invoice.id}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Actions */}
      {subscriptionStatus === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pause Subscription */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <Pause className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Pause Subscription</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Taking a break? Pause your subscription for up to 3 months without losing your data.
                </p>
                <button
                  onClick={() => setShowPauseModal(true)}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors font-medium text-sm"
                >
                  Pause Subscription
                </button>
              </div>
            </div>
          </div>

          {/* Cancel Subscription */}
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Cancel Subscription</h3>
                <p className="text-sm text-gray-600 mb-4">
                  No longer need MenuLix? Cancel your subscription anytime. You'll keep access until the end of your billing period.
                </p>
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
