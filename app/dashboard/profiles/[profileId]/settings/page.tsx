'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Store, Clock, Phone, Users, Trash2, Save, ArrowLeft, Mail, 
  Globe, Wifi, MapPin, Info, Image as ImageIcon, AlertCircle, CheckCircle
} from 'lucide-react';

export default function ProfileSettingsPage({ 
  params 
}: { 
  params: Promise<{ profileId: string }> 
}) {
  const { profileId } = use(params);
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'contact' | 'extra' | 'team' | 'danger'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [generalInfo, setGeneralInfo] = useState({
    name: '',
    description: '',
    logo: ''
  });

  const [locationInfo, setLocationInfo] = useState({
    address: '',
    city: '',
    country: '',
    latitude: 0,
    longitude: 0
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    website: ''
  });

  const [extraInfo, setExtraInfo] = useState({
    phone: '',
    email: '',
    wifi: '',
    openingHours: '',
    mapUrl: ''
  });

  // Load existing profile data
  useEffect(() => {
    if (profileId) {
      fetchProfileData();
    }
  }, [profileId]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/profiles/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load profile');
      }
      
      const data = await response.json();
      
      console.log('Profile data:', data); // Debug log
      
      setGeneralInfo({
        name: data.name || '',
        description: data.description || '',
        logo: data.logo || ''
      });

      // Handle location JSON field
      if (data.location && typeof data.location === 'object') {
        setLocationInfo({
          address: data.location.address || '',
          city: data.location.city || '',
          country: data.location.country || '',
          latitude: data.location.latitude || 0,
          longitude: data.location.longitude || 0
        });
      }

      // Handle extra info from flat fields
      setExtraInfo({
        phone: data.phone || '',
        email: data.email || '',
        wifi: data.wifiName ? `Network: ${data.wifiName} | Password: ${data.wifiPassword || ''}` : '',
        openingHours: data.businessHours ? JSON.stringify(data.businessHours, null, 2) : '',
        mapUrl: data.mapUrl || ''
      });

      // Handle socialLinks JSON field
      if (data.socialLinks && typeof data.socialLinks === 'object') {
        setSocialLinks({
          facebook: data.socialLinks.facebook || '',
          instagram: data.socialLinks.instagram || '',
          website: data.socialLinks.website || ''
        });
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Failed to load profile data');
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      
      const updateData: any = {};

      if (activeTab === 'general') {
        updateData.name = generalInfo.name;
        updateData.description = generalInfo.description;
        updateData.logo = generalInfo.logo;
      } else if (activeTab === 'contact') {
        // Update location JSON field
        updateData.location = {
          address: locationInfo.address,
          city: locationInfo.city,
          country: locationInfo.country,
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude
        };
      } else if (activeTab === 'extra') {
        // Update flat fields
        updateData.phone = extraInfo.phone;
        updateData.email = extraInfo.email;
        updateData.mapUrl = extraInfo.mapUrl;
        
        // Parse wifi string
        if (extraInfo.wifi) {
          const wifiMatch = extraInfo.wifi.match(/Network:\s*(.+?)\s*\|\s*Password:\s*(.+)/);
          if (wifiMatch) {
            updateData.wifiName = wifiMatch[1].trim();
            updateData.wifiPassword = wifiMatch[2].trim();
          } else {
            updateData.wifiName = extraInfo.wifi;
            updateData.wifiPassword = '';
          }
        }
        
        // Parse opening hours as JSON
        if (extraInfo.openingHours) {
          try {
            updateData.businessHours = JSON.parse(extraInfo.openingHours);
          } catch {
            // If not valid JSON, store as string in an object
            updateData.businessHours = { text: extraInfo.openingHours };
          }
        }
      }

      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Store },
    { id: 'contact', label: 'Location', icon: MapPin },
    { id: 'extra', label: 'Extra Info', icon: Info },
    { id: 'team', label: 'Team Access', icon: Users },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => router.push(`/dashboard/profiles/${profileId}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Restaurant
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Settings</h1>
        <p className="text-gray-600">Manage your restaurant profile and configuration</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 max-w-4xl">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 max-w-4xl">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-4xl">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gray-50 text-gray-900 border-b-2 border-teal-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">General Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={generalInfo.name}
                  onChange={(e) => setGeneralInfo({ ...generalInfo, name: e.target.value })}
                  placeholder="The Green Leaf Café"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={generalInfo.description}
                  onChange={(e) => setGeneralInfo({ ...generalInfo, description: e.target.value })}
                  rows={4}
                  placeholder="Tell customers about your restaurant..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="text"
                  value={generalInfo.logo}
                  onChange={(e) => setGeneralInfo({ ...generalInfo, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === 'contact' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Location Information</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={locationInfo.address}
                  onChange={(e) => setLocationInfo({ ...locationInfo, address: e.target.value })}
                  placeholder="Val d'Hydra"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={locationInfo.city}
                    onChange={(e) => setLocationInfo({ ...locationInfo, city: e.target.value })}
                    placeholder="Hydra"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={locationInfo.country}
                    onChange={(e) => setLocationInfo({ ...locationInfo, country: e.target.value })}
                    placeholder="Algeria"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Extra Info Tab */}
        {activeTab === 'extra' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Extra Information</h2>
            <p className="text-sm text-gray-600 mb-6">
              This information will be displayed on your public menu page for customers
            </p>

            <div className="space-y-6">
              {/* Wi-Fi */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-teal-500" />
                  Wi-Fi Information
                </h3>
                <input
                  type="text"
                  placeholder="Network: MyWiFi | Password: password123"
                  value={extraInfo.wifi}
                  onChange={(e) => setExtraInfo({ ...extraInfo, wifi: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Contact */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-teal-500" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <input
                    type="tel"
                    placeholder="Phone: +1 (555) 123-4567"
                    value={extraInfo.phone}
                    onChange={(e) => setExtraInfo({ ...extraInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    type="email"
                    placeholder="Email: info@restaurant.com"
                    value={extraInfo.email}
                    onChange={(e) => setExtraInfo({ ...extraInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Opening Hours */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-500" />
                  Opening Hours
                </h3>
                <textarea
                  rows={3}
                  placeholder="Mon-Fri: 9AM-10PM&#10;Sat-Sun: 10AM-11PM"
                  value={extraInfo.openingHours}
                  onChange={(e) => setExtraInfo({ ...extraInfo, openingHours: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Extra Info'}
              </button>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {(activeTab === 'team' || activeTab === 'danger') && (
          <div className="p-6">
            <p className="text-gray-600">Content for {activeTab} tab coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
