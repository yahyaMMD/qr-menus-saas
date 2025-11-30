'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Eye, Download } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export default function MenuAnalyticsPage({
  params,
}: {
  params: Promise<{ profileId: string; menuId: string }>;
}) {
  const { profileId, menuId } = use(params);
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [menuId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `/api/analytics?menuId=${menuId}&days=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!analytics) return [];
    return analytics.analytics.map((a: any) => ({
      date: new Date(a.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      scans: a.scans,
    }));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push(`/dashboard/profiles/${profileId}/menus/${menuId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Analytics</h1>
            <p className="text-gray-600">Track QR scans and visits</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {analytics?.summary.totalScans.toLocaleString() || 0}
          </div>
          <div className="text-orange-100 text-sm">Total Scans</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analytics?.summary.avgScansPerDay || 0}
          </div>
          <div className="text-gray-600 text-sm">Avg. Scans/Day</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {analytics?.summary.days || 0}
          </div>
          <div className="text-gray-600 text-sm">Active Days</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={prepareChartData()}>
            <defs>
              <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="scans"
              stroke="#f97316"
              fillOpacity={1}
              fill="url(#colorScans)"
              name="Scans"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
