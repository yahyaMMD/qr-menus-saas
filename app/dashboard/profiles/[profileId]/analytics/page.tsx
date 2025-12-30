'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingUp, Users, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RestaurantAnalyticsPage({ params }: { params: { profileId: string } }) {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, params.profileId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/profiles/${params.profileId}/analytics?range=${timeRange}`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        throw new Error('Session expired');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Failed to load analytics'}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { profile, stats, dailyScans, hourlyData, heatmapData, mostViewedItems } = analyticsData;
  const maxDailyScan = dailyScans.length ? Math.max(...dailyScans) : 1;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['6am', '9am', '12pm', '3pm', '6pm', '9pm', '12am'];

  const timeRangeLabels: Record<string, string> = {
    '7': 'Last 7 days',
    '30': 'Last 30 days',
    '90': 'Last 90 days',
  };

  const getHeatColor = (value: number) => {
    if (value >= 40) return 'bg-orange-600';
    if (value >= 30) return 'bg-orange-500';
    if (value >= 20) return 'bg-orange-400';
    if (value >= 10) return 'bg-orange-300';
    if (value >= 5) return 'bg-orange-200';
    return 'bg-orange-100';
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Analytics</h1>
            <p className="text-gray-600">{profile.name} • {timeRangeLabels[timeRange] || 'Last 30 days'}</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">Total Scans</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalScans}</div>
          <div className="text-sm text-gray-500 mt-2">In selected period</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600">Avg Daily Scans</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.avgDailyScans}</div>
          <div className="text-sm text-gray-500 mt-2">Per day average</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⭐</span>
            <span className="text-sm text-gray-600">Avg Rating</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.avgRating > 0 ? stats.avgRating : 'N/A'}</div>
          {stats.avgRating > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {'★'.repeat(5).split('').map((star, i) => (
                <span key={i} className={`text-lg ${i < Math.floor(stats.avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                  ★
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span className="text-sm text-gray-600">New Reviews</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.newReviews}</div>
          <div className="text-sm text-gray-500 mt-2">This period</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Scans Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Scans</h3>
          <p className="text-sm text-gray-500 mb-4">QR code scans over the last 30 days</p>

          <div className="h-64 flex items-end gap-1">
            {dailyScans.map((value: number, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-orange-500 to-orange-400 rounded-t hover:from-orange-600 hover:to-orange-500 transition-all cursor-pointer"
                  style={{ height: `${(value / maxDailyScan) * 100}%` }}
                  title={`Day ${idx + 1}: ${value} scans`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours</h3>
          <p className="text-sm text-gray-500 mb-4">When customers are viewing your menu</p>
          <div className="space-y-3">
            {hourlyData.map((item: { hour: string; value: number }, idx: number) => {
              // Map value to gradient color similar to Most Viewed Items
              let color = '';
              if (item.value >= 90) color = 'from-orange-500 to-red-500';
              else if (item.value >= 70) color = 'from-orange-400 to-orange-500';
              else if (item.value >= 50) color = 'from-yellow-400 to-orange-400';
              else if (item.value >= 30) color = 'from-yellow-300 to-yellow-400';
              else color = 'from-green-300 to-yellow-300';

              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">{item.hour}</span>
                    <span className="font-semibold text-gray-900">{item.value} scans</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all`}
                      style={{ width: `${(item.value / 95) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Heat Map */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Heat Map</h3>
        <p className="text-sm text-gray-500 mb-6">When customers are viewing your menu (darker = more views)</p>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Hour labels */}
            <div className="flex mb-2">
              <div className="w-16"></div>
              {hours.map((hour, idx) => (
                <div key={idx} className="w-20 text-center text-xs text-gray-600">
                  {hour}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            {heatmapData.map((row: number[], dayIdx: number) => (
              <div key={dayIdx} className="flex items-center mb-2">
                <div className="w-16 text-sm text-gray-600">{days[dayIdx]}</div>
                {row.map((value: number, hourIdx: number) => (
                  <div
                    key={hourIdx}
                    className={`w-20 h-12 mr-2 rounded ${getHeatColor(value)} hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center`}
                    title={`${days[dayIdx]} ${hours[hourIdx]}: ${value} views`}
                  >
                    <span className="text-xs font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded bg-orange-100"></div>
            <div className="w-6 h-6 rounded bg-orange-200"></div>
            <div className="w-6 h-6 rounded bg-orange-300"></div>
            <div className="w-6 h-6 rounded bg-orange-400"></div>
            <div className="w-6 h-6 rounded bg-orange-500"></div>
            <div className="w-6 h-6 rounded bg-orange-600"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Most Viewed Items */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Viewed Items</h3>
        <p className="text-sm text-gray-500 mb-4">What's hot on your menu this period</p>

        {mostViewedItems && mostViewedItems.length > 0 ? (
          <div className="space-y-3">
            {mostViewedItems.map((item: any, idx: number) => {
              const maxViews = mostViewedItems[0]?.views || 1;
              let color = '';
              if (idx === 0) color = 'from-orange-500 to-red-500';
              else if (idx === 1) color = 'from-orange-400 to-orange-500';
              else if (idx === 2) color = 'from-yellow-400 to-orange-400';
              else if (idx === 3) color = 'from-yellow-300 to-yellow-400';
              else color = 'from-green-300 to-yellow-300';

              return (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="text-gray-600">{item.views} views</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`bg-gradient-to-r ${color} h-3 rounded-full`}
                      style={{ width: `${(item.views / maxViews) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No item view data available yet</p>
            <p className="text-sm mt-2">Data will appear once customers view your menu</p>
          </div>
        )}
      </div>
    </div>
  );
}
