// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { 
  Plus, 
  QrCode, 
  BarChart3, 
  Settings,
  Eye,
  Pencil,
  Trash2,
  Download,
  Share2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const RestaurantProfile = ({ profileId }: { profileId: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    fetchProfileData();
  }, [profileId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      let token = localStorage.getItem('accessToken');
      if (!token) {
        const authRaw = localStorage.getItem('auth');
        if (authRaw) {
          try {
            const auth = JSON.parse(authRaw);
            token = auth?.tokens?.accessToken;
          } catch (e) {
            console.error('Failed to parse auth', e);
          }
        }
      }

      // Fetch profile data
      const profileResponse = await fetch(`/api/profiles/${profileId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile');
      }

      const profile = await profileResponse.json();

      // Fetch menus for this profile
      const menusResponse = await fetch(`/api/profiles/${profileId}/menus`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      let menus = [];
      if (menusResponse.ok) {
        const menusData = await menusResponse.json();
        menus = menusData.menus || [];
      }

      setProfileData({ profile, menus });
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="p-6 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Failed to load profile'}</p>
          <button 
            onClick={fetchProfileData}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { profile, menus } = profileData;
  const locationText = profile.location?.address || profile.location?.city || 'No location set';
  
  // Calculate active menus count
  const activeMenusCount = menus.filter((m: any) => m.isActive).length;

  // Format last updated date
  const formatLastUpdated = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="p-6 md:p-8">
        {/* Restaurant Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {profile.logo ? (
                <img
                  src={profile.logo}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                  <span className="text-4xl font-bold text-orange-600">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {profile.name}
                  </h1>
                  <p className="text-sm md:text-base text-gray-600 mb-1">{profile.description || 'No description'}</p>
                  <p className="text-xs md:text-sm text-gray-500">{locationText}</p>
                </div>

                <div className="flex items-center gap-3 md:ml-4">
                  <Link href={`/dashboard/profiles/${profileId}/settings`}>
                    <Button variant="outline" className="gap-2 hidden md:flex">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                  <Link href="/dashboard/profiles/new">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md">
                      <Plus className="h-4 w-4 mr-2 inline" />
                      Add Restaurant
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-sm text-gray-600">Total Menus</p>
                  <p className="text-2xl font-bold text-gray-900">{menus.length}</p>
                  <p className="text-xs text-gray-600">{activeMenusCount} active</p>
                </div>
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-sm text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {menus.reduce((sum: number, m: any) => sum + (m._count?.items || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-600">Across all menus</p>
                </div>
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-sm text-gray-600">Active Menus</p>
                  <p className="text-2xl font-bold text-gray-900">{activeMenusCount}</p>
                  <p className="text-xs text-gray-600">Ready to scan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Menus Section */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Your Menus</h2>
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/profiles/${profileId}/menus/new`}>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                <Plus className="h-4 w-4" />
                Create New Menu
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menus.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No menus yet</h3>
              <p className="text-gray-600 mb-4">Create your first menu to get started</p>
              <Link href={`/dashboard/profiles/${profileId}/menus/new`}>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Menu
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {menus.map((menu: any) => (
                <div key={menu.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{menu.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{menu.description || 'No description'}</p>
                      </div>
                      {menu.isActive && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Items</span>
                        <span className="font-semibold text-gray-900">{menu._count?.items || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Categories</span>
                        <span className="font-semibold text-gray-900">{menu._count?.categories || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="text-gray-900">{formatLastUpdated(menu.createdAt)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/dashboard/profiles/${profileId}/menus/${menu.id}`}>
                        <Button variant="outline" size="sm" className="w-full gap-1"> <Pencil className="h-3 w-3" /> Edit</Button>
                      </Link>
                      <Link href={`/menu/${menu.id}`}>
                        <Button variant="outline" size="sm" className="w-full gap-1"> <Eye className="h-3 w-3" /> Preview</Button>
                      </Link>
                      <Link href={`/dashboard/profiles/${profileId}/menus/${menu.id}/qr`}>
                        <Button variant="outline" size="sm" className="w-full gap-1"> <QrCode className="h-3 w-3" /> QR Code</Button>
                      </Link>
                      <Link href={`/dashboard/profiles/${profileId}/menus/${menu.id}/analytics`}>
                        <Button variant="outline" size="sm" className="w-full gap-1"> <BarChart3 className="h-3 w-3" /> Analytics</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Create New Menu Card */}
          <Link href={`/dashboard/profiles/${profileId}/menus/new`}>
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden hover:border-gray-400 transition-colors cursor-pointer h-full min-h-[260px]">
              <div className="h-full flex flex-col items-center justify-center p-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Menu</h3>
                <p className="text-sm text-gray-600 text-center">Add a new menu for your restaurant</p>
              </div>
            </div>
          </Link>
        </div>
    </div>
  );
};
