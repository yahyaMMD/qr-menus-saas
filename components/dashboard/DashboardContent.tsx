// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Plus, BarChart3, MessageSquare, TrendingUp, MapPin, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const DashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Try to get token from different storage locations
      let token = localStorage.getItem('accessToken');
      
      if (!token) {
        const authRaw = localStorage.getItem('auth');
        if (authRaw) {
          try {
            const auth = JSON.parse(authRaw);
            token = auth?.tokens?.accessToken;
          } catch (e) {
            console.error('Failed to parse auth from localStorage', e);
          }
        }
      }

      if (!token) {
        setError('Not authenticated. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Create New Profile",
      icon: Plus,
      href: "/dashboard/profiles/new",
    },
    {
      title: "View Analytics",
      icon: BarChart3,
      href: "/dashboard/profiles",
    },
    {
      title: "Manage Subscription",
      icon: TrendingUp,
      href: "/dashboard/settings",
    },
  ];

  if (loading) {
    return (
      <div className="p-5 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="p-5">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Failed to load dashboard data'}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { user, stats, profiles } = dashboardData;

  const statsDisplay = [
    {
      title: "Total Scans Today",
      value: stats.totalScansToday.toString(),
      change: `${stats.scansChange >= 0 ? '+' : ''}${stats.scansChange}% from yesterday`,
      changeType: stats.scansChange >= 0 ? "positive" : "negative",
      icon: BarChart3,
    },
    {
      title: "Feedback This Week",
      value: stats.weekFeedbacks.toString(),
      change: `${stats.feedbacksChange >= 0 ? '+' : ''}${stats.feedbacksChange}% from last week`,
      changeType: stats.feedbacksChange >= 0 ? "positive" : "negative",
      icon: MessageSquare,
    },
    {
      title: "Active Menus",
      value: stats.activeMenus.toString(),
      subtitle: `Across ${stats.totalRestaurants} restaurant${stats.totalRestaurants !== 1 ? 's' : ''}`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="p-5">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your restaurants today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {statsDisplay.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 text-sm">{stat.title}</span>
                <stat.icon className="h-4 w-4 text-gray-400" />
              </div>
              <div className="mb-1">
                <span className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </span>
              </div>
              {stat.change && (
                <p
                  className={`text-sm ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.change}
                </p>
              )}
              {stat.subtitle && (
                <p className="text-sm text-gray-600">{stat.subtitle}</p>
              )}
            </div>
          ))}
        </div>

        {/* Your Restaurants Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Restaurants
            </h2>
            <Link href="/dashboard/profiles/new">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-5 w-5 mr-2" />
                Add Restaurant
              </Button>
            </Link>
          </div>

          {profiles.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No restaurants yet</h3>
              <p className="text-gray-600 mb-4">Create your first restaurant profile to get started</p>
              <Link href="/dashboard/profiles/new">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Create Restaurant
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {profiles.map((restaurant: any) => {
                const locationText = restaurant.location?.address 
                  || restaurant.location?.city 
                  || 'No location set';
                
                return (
                  <div
                    key={restaurant.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col"
                  >
                    <div className="h-32 bg-gray-200 relative flex-shrink-0">
                      {restaurant.logo ? (
                        <Image
                          src={restaurant.logo}
                          alt={restaurant.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                          <span className="text-4xl font-bold text-orange-600">
                            {restaurant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-base font-bold text-gray-900 mb-0.5">
                        {restaurant.name}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <MapPin className="h-3.5 w-3.5 mr-0.5" />
                        {locationText}
                      </div>
                      <div className="space-y-1.5 mb-3 text-xs flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Active Menus</span>
                          <span className="font-semibold text-gray-900">
                            {restaurant.activeMenus}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Total Feedbacks</span>
                          <span className="font-semibold text-gray-900">
                            {restaurant.totalFeedbacks}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <Link href={`/dashboard/profiles/${restaurant.id}/menus`} className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-8 text-xs"
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Menus
                          </Button>
                        </Link>
                        <Link href={`/dashboard/profiles/${restaurant.id}`} className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-8 text-xs"
                          >
                            Manage
                          </Button>
                        </Link>
                        <Link href={`/dashboard/profiles/${restaurant.id}/analytics`} className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-8 text-xs"
                          >
                            Analytics
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Restaurant Card */}
              <Link href="/dashboard/profiles/new">
                <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex items-center justify-center" style={{minHeight: '280px'}}>
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                      Add New Restaurant
                    </h3>
                    <p className="text-xs text-gray-500">
                      Create a new<br />restaurant profile
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Quick Actions
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Common tasks to manage your restaurants
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <button
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
                >
                  <action.icon className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-900 font-medium text-sm">{action.title}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
    </div>
  );
};
