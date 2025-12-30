'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Trash2,
  Loader2,
  BarChart3,
  MessageSquare,
  Users,
  Star,
} from 'lucide-react';

interface SubscriptionData {
  id: string;
  plan: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELED' | 'EXPIRED';
  expiresAt: string;
  pausedAt?: string;
  resumesAt?: string;
  canceledAt?: string;
  priceCents?: number;
  currency?: string;
}

interface PlanDetails {
  name: string;
  price: number;
  features: string[];
  limitations?: any;
}

interface UsageData {
  profiles: number;
  menus: number;
}

interface InvoiceRecord {
  id: string;
  date: string;
  desc: string;
  amount: number;
  status: string;
  currency: string;
  reference?: string | null;
}

interface DashboardStats {
  totalScansToday: number;
  scansChange: number;
  weekFeedbacks: number;
  feedbacksChange: number;
  activeMenus: number;
  totalRestaurants: number;
}

interface FeedbackItem {
  id: string;
  userName: string;
  rating: number;
  restaurantName: string;
  comment: string | null;
  createdAt: string;
}

interface NotificationPreferences {
  email: Record<string, boolean>;
  push: Record<string, boolean>;
}

const faqs = [
  {
    question: 'How often is my analytics data refreshed?',
    answer:
      'Dashboard analytics pull from the latest scan and feedback events every time you load the page. Today’s scans, week-over-week changes, and new reviews refresh in real time.',
  },
  {
    question: 'How can I invite team members to help manage menus?',
    answer:
      'Open Restaurant Settings → Team Access, click “Invite Member,” enter the new user’s email, choose an access level (Owner, Manager, or Staff), and send the invite. The member receives a secure link to join.',
  },
  {
    question: 'What should I do if notifications are out of sync?',
    answer:
      'Notification preferences are centralized under Account Settings → Notifications. Toggle the alerts you want and hit “Save Preferences” so everything syncs.',
  },
  {
    question: 'Where can I download past invoices?',
    answer:
      'The billing history table lists every payment. Use “Download All” for a bulk export or the individual “Download” button to grab a text copy of each invoice.',
  },
];

const emailNotificationLabels: Record<string, string> = {
  feedback: 'Customer feedback updates',
  menuScans: 'Menu scan alerts',
  subscription: 'Subscription and billing updates',
  marketing: 'Marketing tips and news',
};

const pushNotificationLabels: Record<string, string> = {
  feedback: 'Real-time review alerts',
  system: 'System status and product updates',
};

export default function ManageSubscriptionPage() {
  const router = useRouter();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [planDetails, setPlanDetails] = useState<PlanDetails | null>(null);
  const [usage, setUsage] = useState<UsageData>({ profiles: 0, menus: 0 });
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [analyticsStats, setAnalyticsStats] = useState<DashboardStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const [notificationSummary, setNotificationSummary] = useState<NotificationPreferences | null>(null);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);

  const [billingHistory, setBillingHistory] = useState<InvoiceRecord[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);


  useEffect(() => {
    fetchSubscription();
    fetchBillingHistory();
    fetchAnalyticsSummary();
    fetchRecentFeedback();
    fetchNotificationSummary();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch subscription');
      }

      const data = await response.json();
      setSubscription(data.subscription);
      setPlanDetails(data.planDetails);
      setUsage(data.usage || { profiles: 0, menus: 0 });
      setDaysRemaining(data.daysRemaining || 0);
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      setError(err.message || 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const fetchBillingHistory = async () => {
    setBillingLoading(true);
    setBillingError(null);
    try {
      const response = await fetch('/api/user/payments', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load billing history');
      }

      const data = await response.json();
      const payments = (data.payments ?? []).map((payment: any) => ({
        id: payment.id,
        date: formatDate(payment.createdAt),
        desc: payment.description,
        amount: (payment.amountCents || 0) / 100,
        currency: payment.currency || 'DZD',
        status: payment.status,
        reference: payment.reference || null,
      }));

      setBillingHistory(payments);
    } catch (err: any) {
      console.error('Billing history error:', err);
      setBillingError(err.message || 'Failed to load billing history');
    } finally {
      setBillingLoading(false);
    }
  };

  const fetchAnalyticsSummary = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const response = await fetch('/api/dashboard', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      setAnalyticsStats(data.stats || null);
    } catch (err: any) {
      console.error('Analytics error:', err);
      setAnalyticsError(err.message || 'Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchRecentFeedback = async () => {
    setFeedbackLoading(true);
    setFeedbackError(null);

    try {
      const response = await fetch('/api/feedbacks?limit=3');
      if (!response.ok) {
        throw new Error('Failed to fetch customer feedback');
      }

      const data = await response.json();
      setRecentFeedback(data.feedbacks || []);
    } catch (err: any) {
      console.error('Feedback fetch error:', err);
      setFeedbackError(err.message || 'Failed to fetch customer feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const fetchNotificationSummary = async () => {
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const response = await fetch('/api/user/preferences', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load notification preferences');
      }

      const data = await response.json();
      setNotificationSummary(data.preferences?.notifications || null);
    } catch (err: any) {
      console.error('Notification prefs error:', err);
      setNotificationsError(err.message || 'Failed to load notification preferences');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleAction = async (action: string, additionalData?: any) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/subscription', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action, ...additionalData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} subscription`);
      }

      // Update local state
      setSubscription(data.subscription);
      setShowCancelModal(false);
      setShowPauseModal(false);

      // Refresh data
      await fetchSubscription();
    } catch (err: any) {
      console.error(`Error ${action} subscription:`, err);
      setError(err.message || `Failed to ${action} subscription`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (cents?: number) => {
    if (!cents) return '0 DZD';
    return `${(cents / 100).toLocaleString()} DZD`;
  };

  const downloadTextFile = (content: string, filename: string, mime = 'text/plain') => {
    const blob = new Blob([content], { type: mime });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  };

  const buildInvoiceText = (invoice: InvoiceRecord) => {
    return `Invoice ID: ${invoice.id}
Date: ${invoice.date}
Description: ${invoice.desc}
Status: ${invoice.status}
Amount: ${invoice.amount.toLocaleString()} ${invoice.currency}
`;
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    const invoice = billingHistory.find((inv) => inv.id === invoiceId);
    if (!invoice) return;
    downloadTextFile(buildInvoiceText(invoice), `${invoice.id}.txt`);
  };

  const handleDownloadAllInvoices = () => {
    const content = billingHistory.map((invoice) => buildInvoiceText(invoice)).join('\n---\n');
    downloadTextFile(content, 'billing-history.txt');
  };

  const CancelSubscriptionModal = () => {
    const [reason, setReason] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleCancel = () => {
      handleAction('cancel', { reason, feedback });
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
                  <li>• You'll keep access until {subscription ? formatDate(subscription.expiresAt) : 'end of billing period'}</li>
                  <li>• No refunds for the current billing period</li>
                  <li>• All your data will be preserved for 30 days</li>
                  <li>• You can reactivate anytime before then</li>
                </ul>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={!reason || isProcessing}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PauseSubscriptionModal = () => {
    const [pauseDuration, setPauseDuration] = useState('1');

    const handlePause = () => {
      handleAction('pause', { pauseDuration });
    };

    const getResumeDate = () => {
      const date = new Date();
      date.setMonth(date.getMonth() + parseInt(pauseDuration));
      return formatDate(date.toISOString());
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
                  <li>• Resume date: {getResumeDate()}</li>
                </ul>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPauseModal(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePause}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pause Subscription'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  const subscriptionStatus = subscription?.status?.toLowerCase() || 'active';

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

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* No Subscription */}
      {!subscription && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">You don't have an active subscription yet.</p>
          <button
            onClick={() => router.push('/dashboard/settings/plans')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Choose a Plan
          </button>
        </div>
      )}

      {subscription && (
        <>
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
                      <p className="text-sm text-gray-600">
                        Your subscription is paused until {subscription.resumesAt ? formatDate(subscription.resumesAt) : 'resumed'}
                      </p>
                    </div>
                  </>
                )}
                {subscriptionStatus === 'canceled' && (
                  <>
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Subscription Cancelled</h3>
                      <p className="text-sm text-gray-600">Your subscription will end on {formatDate(subscription.expiresAt)}</p>
                    </div>
                  </>
                )}
              </div>
              {subscriptionStatus === 'paused' && (
                <button
                  onClick={() => handleAction('resume')}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Resume Now
                </button>
              )}
              {subscriptionStatus === 'canceled' && (
                <button
                  onClick={() => handleAction('reactivate')}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Reactivate
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analytics Snapshot</h3>
                <p className="text-sm text-gray-500">Live overview of scans and reviews</p>
              </div>
              <button
                onClick={fetchAnalyticsSummary}
                className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
              >
                Refresh
              </button>
            </div>

            {analyticsLoading ? (
              <div className="py-6 text-center text-sm text-gray-500">Loading analytics...</div>
            ) : analyticsError ? (
              <div className="text-sm text-red-600">{analyticsError}</div>
            ) : analyticsStats ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Total scans today</span>
                    <BarChart3 className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsStats.totalScansToday}</div>
                  <div className={`text-xs ${analyticsStats.scansChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsStats.scansChange >= 0 ? '+' : ''}
                    {analyticsStats.scansChange}% vs yesterday
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Feedback this week</span>
                    <MessageSquare className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsStats.weekFeedbacks}</div>
                  <div className={`text-xs ${analyticsStats.feedbacksChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsStats.feedbacksChange >= 0 ? '+' : ''}
                    {analyticsStats.feedbacksChange}% vs last week
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Active menus</span>
                    <CreditCard className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsStats.activeMenus}</div>
                  <div className="text-xs text-gray-500">
                    Across {analyticsStats.totalRestaurants} restaurant
                    {analyticsStats.totalRestaurants !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-500">Restaurants</span>
                    <Users className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{analyticsStats.totalRestaurants}</div>
                  <div className="text-xs text-gray-500">Profiles linked to your account</div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-sm text-gray-500">Analytics will appear once we collect some scan data.</div>
            )}
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
                <div className="text-2xl font-bold text-gray-900">{planDetails?.name || subscription.plan}</div>
                <div className="text-sm text-gray-600">Monthly billing</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {planDetails?.price ? `${planDetails.price.toLocaleString()} DZD` : formatPrice(subscription.priceCents)}
              </div>
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
                <div className="text-2xl font-bold text-gray-900">{formatDate(subscription.expiresAt)}</div>
                <div className="text-sm text-gray-600">
                  {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Amount due</span>
                  <span className="font-semibold text-gray-900">
                    {planDetails?.price ? `${planDetails.price.toLocaleString()} DZD` : formatPrice(subscription.priceCents)}
                  </span>
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
                    <span className="font-semibold text-gray-900">
                      {usage.profiles} / {planDetails?.limitations?.maxProfiles || '∞'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{
                        width: planDetails?.limitations?.maxProfiles
                          ? `${Math.min((usage.profiles / planDetails.limitations.maxProfiles) * 100, 100)}%`
                          : '10%'
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Active Menus</span>
                    <span className="font-semibold text-gray-900">
                      {usage.menus} / {planDetails?.limitations?.maxMenusPerProfile === -1 ? '∞' : (planDetails?.limitations?.maxMenusPerProfile || '∞')}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: '25%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Customer Feedback</h3>
                <p className="text-sm text-gray-500">Real comments from diners who scanned your menus</p>
              </div>
              <Link href="/dashboard/profiles">
                <button className="text-sm text-orange-600 hover:text-orange-700 font-semibold">
                  Browse all
                </button>
              </Link>
            </div>

            {feedbackLoading ? (
              <div className="py-6 text-center text-sm text-gray-500">Loading feedback...</div>
            ) : feedbackError ? (
              <div className="text-sm text-red-600">{feedbackError}</div>
            ) : recentFeedback.length === 0 ? (
              <div className="py-6 text-sm text-gray-500">No feedback found yet.</div>
            ) : (
              <div className="space-y-4">
                {recentFeedback.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-orange-200 transition-colors">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{item.userName}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-4 h-4 ${idx < Math.round(item.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
                        />
                      ))}
                      <span className="text-xs text-gray-500 ml-2">{item.rating.toFixed(1)} / 5</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">
                      {item.comment || 'Customer left no additional comment.'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{item.restaurantName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Billing History */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
              <button
                type="button"
                onClick={handleDownloadAllInvoices}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-2"
              >
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
                  {billingLoading ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center text-sm text-gray-500">
                        Loading billing history...
                      </td>
                    </tr>
                  ) : billingError ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center text-sm text-red-600">
                        {billingError}
                        <button
                          onClick={fetchBillingHistory}
                          className="ml-3 text-orange-600 underline"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : billingHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-4 text-center text-sm text-gray-500">
                        No payments recorded yet. We’ll list your billing history here as soon as charges occur.
                      </td>
                    </tr>
                  ) : (
                    billingHistory.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">{invoice.date}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{invoice.desc}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">
                          {invoice.amount.toLocaleString()} {invoice.currency}
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            type="button"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            {invoice.id}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences Snapshot</h3>
                <p className="text-sm text-gray-500">The dashboard mirrors these settings in real time</p>
              </div>
              <button
                onClick={fetchNotificationSummary}
                className="text-sm text-orange-600 hover:text-orange-700 font-semibold"
              >
                Refresh
              </button>
            </div>

            {notificationsLoading ? (
              <div className="py-6 text-center text-sm text-gray-500">Loading preferences...</div>
            ) : notificationsError ? (
              <div className="text-sm text-red-600">{notificationsError}</div>
            ) : notificationSummary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Email</h4>
                  {Object.entries(emailNotificationLabels).map(([key, label]) => {
                    const enabled = notificationSummary.email[key] ?? false;
                    return (
                      <div key={key} className="flex items-center justify-between text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          {enabled ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300" />
                          )}
                          <span>{label}</span>
                        </div>
                        <span className={`text-xs ${enabled ? 'text-green-600' : 'text-gray-500'}`}>
                          {enabled ? 'Enabled' : 'Off'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900">Push</h4>
                  {Object.entries(pushNotificationLabels).map(([key, label]) => {
                    const enabled = notificationSummary.push[key] ?? false;
                    return (
                      <div key={key} className="flex items-center justify-between text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          {enabled ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-300" />
                          )}
                          <span>{label}</span>
                        </div>
                        <span className={`text-xs ${enabled ? 'text-green-600' : 'text-gray-500'}`}>
                          {enabled ? 'Enabled' : 'Off'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-6 text-sm text-gray-500">
                Notification preferences haven’t been configured yet. Update them under Account Settings → Notifications.
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Q&A</h3>
                <p className="text-sm text-gray-500">Helpful answers for the questions we hear most often</p>
              </div>
              <Link href="/help">
                <button className="text-sm text-orange-600 hover:text-orange-700 font-semibold">
                  Visit Help Center
                </button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.question} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-900">{faq.question}</p>
                  <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
                </div>
              ))}
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
                      No longer need QResto? Cancel your subscription anytime. You'll keep access until the end of your billing period.
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
        </>
      )}
    </div>
  );
}
