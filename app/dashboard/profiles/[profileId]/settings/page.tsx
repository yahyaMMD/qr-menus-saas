'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Store, Clock, Phone, Users, Trash2, Save, ArrowLeft, Mail, 
  Globe, Wifi, MapPin, Info, Image as ImageIcon, AlertCircle, CheckCircle,
  Plus, X, Shield, UserMinus, Loader2, AlertTriangle, Crown
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/ImageUpload';

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
  
  // Team state
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'STAFF' });
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  
  // Danger zone state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileName, setProfileName] = useState('');
  
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
      setProfileName(data.name || '');

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

  // Fetch team members
  const fetchTeamMembers = async () => {
    setTeamLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/profiles/${profileId}/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
        setIsOwner(data.isOwner || false);
      }
    } catch (err) {
      console.error('Failed to fetch team:', err);
    } finally {
      setTeamLoading(false);
    }
  };

  // Load team when tab is active
  useEffect(() => {
    if (activeTab === 'team' && profileId) {
      fetchTeamMembers();
    }
  }, [activeTab, profileId]);

  const handleAddMember = async () => {
    if (!newMember.name.trim() || !newMember.email.trim()) {
      setError('Name and email are required');
      return;
    }

    setIsAddingMember(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/profiles/${profileId}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMember),
      });

      const data = await response.json();

      if (response.ok) {
        setTeamMembers([data.teamMember, ...teamMembers]);
        setNewMember({ name: '', email: '', role: 'STAFF' });
        setShowAddMember(false);
        setSuccess('Team member added successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to add team member');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add team member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/profiles/${profileId}/team/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        setTeamMembers(teamMembers.map(m => 
          m.id === memberId ? { ...m, role: newRole } : m
        ));
        setSuccess('Role updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update role');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from the team?`)) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/profiles/${profileId}/team/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setTeamMembers(teamMembers.filter(m => m.id !== memberId));
        setSuccess('Team member removed successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to remove team member');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to remove team member');
    }
  };

  const handleDeleteProfile = async () => {
    if (deleteConfirmation !== profileName) {
      setError('Please type the restaurant name correctly to confirm deletion');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete restaurant');
        setIsDeleting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete restaurant');
      setIsDeleting(false);
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
                      ? 'bg-gray-50 text-gray-900 border-b-2 border-orange-500'
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Logo
                </label>
                <div className="max-w-[200px]">
                  <ImageUpload
                    value={generalInfo.logo}
                    onChange={(url) => setGeneralInfo({ ...generalInfo, logo: url || '' })}
                    folder="qr-menus/logos"
                    aspectRatio="square"
                    placeholder="Upload logo"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={locationInfo.latitude || ''}
                    onChange={(e) => setLocationInfo({ ...locationInfo, latitude: parseFloat(e.target.value) || 0 })}
                    placeholder="36.7538"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={locationInfo.longitude || ''}
                    onChange={(e) => setLocationInfo({ ...locationInfo, longitude: parseFloat(e.target.value) || 0 })}
                    placeholder="3.0588"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Map Preview */}
              {locationInfo.latitude !== 0 && locationInfo.longitude !== 0 && (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Map Preview
                    </p>
                  </div>
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationInfo.longitude - 0.01},${locationInfo.latitude - 0.01},${locationInfo.longitude + 0.01},${locationInfo.latitude + 0.01}&layer=mapnik&marker=${locationInfo.latitude},${locationInfo.longitude}`}
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    loading="lazy"
                  ></iframe>
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-300">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${locationInfo.latitude}&mlon=${locationInfo.longitude}#map=15/${locationInfo.latitude}/${locationInfo.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-teal-600 hover:text-teal-700"
                    >
                      View on OpenStreetMap →
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
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
                  <Wifi className="w-5 h-5 text-orange-500" />
                  Wi-Fi Information
                </h3>
                <input
                  type="text"
                  placeholder="Network: MyWiFi | Password: password123"
                  value={extraInfo.wifi}
                  onChange={(e) => setExtraInfo({ ...extraInfo, wifi: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Contact */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-orange-500" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <input
                    type="tel"
                    placeholder="Phone: +1 (555) 123-4567"
                    value={extraInfo.phone}
                    onChange={(e) => setExtraInfo({ ...extraInfo, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500"
                  />
                  <input
                    type="email"
                    placeholder="Email: info@restaurant.com"
                    value={extraInfo.email}
                    onChange={(e) => setExtraInfo({ ...extraInfo, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Opening Hours */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Opening Hours
                </h3>
                <textarea
                  rows={3}
                  placeholder="Mon-Fri: 9AM-10PM&#10;Sat-Sun: 10AM-11PM"
                  value={extraInfo.openingHours}
                  onChange={(e) => setExtraInfo({ ...extraInfo, openingHours: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Extra Info'}
              </button>
            </div>
          </div>
        )}

        {/* Team Access Tab */}
        {activeTab === 'team' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Team Access</h2>
                <p className="text-sm text-gray-600">Manage who can access and edit this restaurant</p>
              </div>
              {isOwner && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Member
                </button>
              )}
            </div>

            {/* Owner Badge */}
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">You are the Owner</p>
                  <p className="text-sm text-gray-600">Full access to all settings, billing, and team management</p>
                </div>
              </div>
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Add Team Member</h3>
                  <button
                    onClick={() => { setShowAddMember(false); setNewMember({ name: '', email: '', role: 'STAFF' }); }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={newMember.name}
                      onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="STAFF">Staff</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => { setShowAddMember(false); setNewMember({ name: '', email: '', role: 'STAFF' }); }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMember}
                    disabled={isAddingMember || !newMember.name.trim() || !newMember.email.trim()}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAddingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Add Member
                  </button>
                </div>
              </div>
            )}

            {/* Team Members List */}
            {teamLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : teamMembers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">No team members yet</h3>
                <p className="text-sm text-gray-600 mb-4">Add team members to help manage your restaurant</p>
                {isOwner && (
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Member
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Role Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        member.role === 'MANAGER' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {member.role === 'MANAGER' ? 'Manager' : 'Staff'}
                        </div>
                      </div>

                      {/* Status */}
                      {!member.acceptedAt && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Pending
                        </span>
                      )}

                      {/* Actions for owner */}
                      {isOwner && (
                        <div className="flex items-center gap-2">
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="STAFF">Staff</option>
                            <option value="MANAGER">Manager</option>
                          </select>
                          <button
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Role Permissions Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Role Permissions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                    <Shield className="w-4 h-4" />
                    Manager
                  </div>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Edit menus, items, and categories</li>
                    <li>• Add staff members</li>
                    <li>• View analytics</li>
                    <li>• Cannot change billing or delete profile</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                    <Shield className="w-4 h-4" />
                    Staff
                  </div>
                  <ul className="space-y-1 text-blue-800">
                    <li>• Edit menus and items</li>
                    <li>• View analytics</li>
                    <li>• Cannot manage team members</li>
                    <li>• Cannot access settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-6">
              Irreversible actions that affect your restaurant
            </p>

            {/* Delete Restaurant */}
            <div className="border-2 border-red-200 rounded-xl overflow-hidden">
              <div className="bg-red-50 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-2">Delete Restaurant</h3>
                    <p className="text-sm text-red-700 mb-4">
                      Permanently delete <strong>"{profileName}"</strong> and all of its data. This includes:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1 mb-4">
                      <li>• All menus and menu items</li>
                      <li>• All categories, tags, and types</li>
                      <li>• All customer feedback and ratings</li>
                      <li>• All analytics data</li>
                      <li>• All team member access</li>
                    </ul>
                    <p className="text-sm text-red-800 font-semibold">
                      ⚠️ This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete This Restaurant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Delete Restaurant</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    This will permanently delete <strong>"{profileName}"</strong> and all its data.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-800 mb-3">
                  To confirm deletion, please type <span className="font-mono font-bold">"{profileName}"</span> below:
                </p>
                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type restaurant name here"
                  className="w-full px-4 py-2 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProfile}
                  disabled={isDeleting || deleteConfirmation !== profileName}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Forever
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
