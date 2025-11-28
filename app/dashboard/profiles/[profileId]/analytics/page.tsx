'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar, TrendingUp, Users, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RestaurantAnalyticsPage({ params }: { params: { profileId: string } }) {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('Last 30 days');

  // Mock data
  const stats = {
    avgDailyScans: 95,
    topRating: 4.8,
    peakHours: '6pm - 9pm',
    avgFeedback: 127,
    totalScans: 2847,
    newReviews: 34
  };

  const dailyScans = [
    45, 52, 48, 61, 55, 67, 72, 65, 58, 63, 70, 75, 80, 72, 68, 
    74, 79, 85, 82, 77, 81, 88, 92, 87, 84, 90, 95, 89, 93, 96
  ];

  const maxDailyScan = Math.max(...dailyScans);

  const hourlyData = [
    { hour: '12am', value: 5 }, { hour: '3am', value: 2 }, { hour: '6am', value: 8 },
    { hour: '9am', value: 25 }, { hour: '12pm', value: 65 }, { hour: '3pm', value: 45 },
    { hour: '6pm', value: 95 }, { hour: '9pm', value: 70 }
  ];

  const heatmapData = [
    [5, 8, 12, 15, 22, 28, 18],
    [3, 6, 10, 14, 25, 32, 20],
    [8, 12, 18, 25, 35, 45, 30],
    [6, 10, 15, 20, 30, 38, 25],
    [4, 7, 11, 16, 24, 30, 19],
    [2, 4, 8, 12, 18, 22, 14],
    [1, 3, 5, 8, 12, 15, 10]
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['6am', '9am', '12pm', '3pm', '6pm', '9pm', '12am'];

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
            <p className="text-gray-600">The Green Leaf Café • {timeRange}</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>All time</option>
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
          <div className="text-sm text-green-600 mt-2">+12% from last period</div>
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
            <span className="text-sm text-gray-600">Top Rating</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.topRating}</div>
          <div className="flex items-center gap-1 mt-2">
            {'★'.repeat(5).split('').map((star, i) => (
              <span key={i} className={`text-lg ${i < Math.floor(stats.topRating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                ★
              </span>
            ))}
          </div>
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
            {dailyScans.map((value, idx) => (
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
            {hourlyData.map((item, idx) => {
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
            {heatmapData.map((row, dayIdx) => (
              <div key={dayIdx} className="flex items-center mb-2">
                <div className="w-16 text-sm text-gray-600">{days[dayIdx]}</div>
                {row.map((value, hourIdx) => (
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
        <p className="text-sm text-gray-500 mb-4">What's hot on your menu this month</p>
        
        <div className="space-y-3">
          {[
            { name: 'Organic Salad Bowl', views: 245, color: 'from-orange-500 to-red-500' },
            { name: 'Avocado Toast', views: 198, color: 'from-orange-400 to-orange-500' },
            { name: 'Green Smoothie', views: 167, color: 'from-yellow-400 to-orange-400' },
            { name: 'Quinoa Buddha Bowl', views: 142, color: 'from-yellow-300 to-yellow-400' },
            { name: 'Chia Pudding', views: 128, color: 'from-green-300 to-yellow-300' }
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-900">{item.name}</span>
                <span className="text-gray-600">{item.views} views</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`bg-gradient-to-r ${item.color} h-3 rounded-full`}
                  style={{ width: `${(item.views / 245) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}