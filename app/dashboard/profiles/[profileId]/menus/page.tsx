'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  MoreVertical,
  ArrowLeft,
  QrCode,
  BarChart3,
  Settings as SettingsIcon
} from 'lucide-react';

interface Menu {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    items: number;
    categories: number;
  };
}

export default function RestaurantMenusPage() {
  const params = useParams();
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    // TODO: Fetch menus from API
    // fetch(`/api/profiles/${params.profileId}/menus`)
    setTimeout(() => {
      setMenus([
        {
          id: '1',
          name: 'Spring Menu 2024',
          description: 'Fresh seasonal items',
          isActive: true,
          createdAt: new Date().toISOString(),
          _count: { items: 24, categories: 6 },
        },
        {
          id: '2',
          name: 'Drinks & Beverages',
          description: 'Coffee, tea, smoothies and more',
          isActive: true,
          createdAt: new Date().toISOString(),
          _count: { items: 15, categories: 3 },
        },
        {
          id: '3',
          name: 'Winter Specials',
          description: 'Seasonal comfort food',
          isActive: false,
          createdAt: new Date().toISOString(),
          _count: { items: 12, categories: 4 },
        },
      ]);
      setLoading(false);
    }, 500);
  }, [params.profileId]);

  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    menu.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleActive = async (menuId: string) => {
    // TODO: Call API to toggle menu active status
    setMenus(menus.map(menu => 
      menu.id === menuId ? { ...menu, isActive: !menu.isActive } : menu
    ));
  };

  const handleDeleteMenu = async (menuId: string) => {
    if (!confirm('Are you sure you want to delete this menu?')) return;
    
    // TODO: Call API to delete menu
    setMenus(menus.filter(menu => menu.id !== menuId));
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push(`/dashboard/profiles/${params.profileId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Restaurant
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Menus</h1>
            <p className="text-gray-600">Manage your restaurant's digital menus</p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/profiles/${params.profileId}/menus/new`)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Menu
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="text-sm opacity-90 mb-2">Total Menus</div>
          <div className="text-4xl font-bold">{menus.length}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="text-sm opacity-90 mb-2">Active Menus</div>
          <div className="text-4xl font-bold">
            {menus.filter(m => m.isActive).length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl p-6 text-white">
          <div className="text-sm opacity-90 mb-2">Total Items</div>
          <div className="text-4xl font-bold">
            {menus.reduce((sum, m) => sum + (m._count?.items || 0), 0)}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Menus Grid */}
      {filteredMenus.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No menus found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first menu'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => router.push(`/dashboard/profiles/${params.profileId}/menus/new`)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Create Menu
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{menu.name}</h3>
                    {menu.description && (
                      <p className="text-sm text-gray-600">{menu.description}</p>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === menu.id ? null : menu.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    {showMenu === menu.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                        <button
                          onClick={() => {
                            router.push(`/dashboard/profiles/${params.profileId}/menus/${menu.id}/settings`);
                            setShowMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <SettingsIcon className="w-4 h-4" />
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            handleToggleActive(menu.id);
                            setShowMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          {menu.isActive ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              Activate
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteMenu(menu.id);
                            setShowMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {menu.isActive ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {menu._count?.items || 0}
                    </div>
                    <div className="text-xs text-gray-600">Menu Items</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {menu._count?.categories || 0}
                    </div>
                    <div className="text-xs text-gray-600">Categories</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/profiles/${params.profileId}/menus/${menu.id}`)}
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/profiles/${params.profileId}/menus/${menu.id}/analytics`)}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                    title="Analytics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      // Generate QR code
                      window.open(`/api/qr/${menu.id}?format=svg`, '_blank');
                    }}
                    className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium text-sm"
                    title="QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
