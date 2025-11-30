'use client';
import { useRouter } from 'next/navigation';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  CreditCard, 
  Globe, 
  Shield,
  Save,
  Camera,
  Phone,
  MapPin,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

export default function AccountSettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'moderate' | 'strong' | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: ''
  });

  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      let token = localStorage.getItem('accessToken');
      if (!token) {
        const authRaw = localStorage.getItem('auth');
        if (authRaw) {
          const auth = JSON.parse(authRaw);
          token = auth?.tokens?.accessToken;
        }
      }

      const response = await fetch('/api/profiles', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Split name into first and last name
        const nameParts = (data.user.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setProfileData({
          firstName,
          lastName,
          email: data.user.email || '',
          phone: data.user.phone || '',
          location: data.user.location || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  // Password strength checker
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(null);
      return;
    }

    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const criteriasMet = [hasMinLength, hasUppercase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (criteriasMet === 4) {
      setPasswordStrength('strong');
    } else if (criteriasMet >= 2) {
      setPasswordStrength('moderate');
    } else {
      setPasswordStrength('weak');
    }
  }, [password]);

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
  ];

  // Add Payment Method Modal Component
  const AddPaymentModal = () => {
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatCardNumber = (value: string) => {
      const cleaned = value.replace(/\s/g, '');
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      return formatted.substring(0, 19); // Max 16 digits + 3 spaces
    };

    const formatExpiryDate = (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length >= 2) {
        return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
      }
      return cleaned;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitting(false);
      setShowAddPaymentModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Add Payment Method</h3>
            <button
              onClick={() => setShowAddPaymentModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Bsahtek Frere"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Expiry Date & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Save as default */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="setDefault"
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="setDefault" className="text-sm text-gray-700">
                  Set as default payment method
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowAddPaymentModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  'Add Card'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Password Strength Indicator Component
  const PasswordStrengthIndicator = ({ password, strength }: { password: string, strength: 'weak' | 'moderate' | 'strong' | null }) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const getStrengthColor = () => {
      switch (strength) {
        case 'weak':
          return 'bg-red-500';
        case 'moderate':
          return 'bg-yellow-500';
        case 'strong':
          return 'bg-green-500';
        default:
          return 'bg-gray-200';
      }
    };

    const getStrengthWidth = () => {
      switch (strength) {
        case 'weak':
          return 'w-1/3';
        case 'moderate':
          return 'w-2/3';
        case 'strong':
          return 'w-full';
        default:
          return 'w-0';
      }
    };

    const getStrengthText = () => {
      switch (strength) {
        case 'weak':
          return 'Weak password';
        case 'moderate':
          return 'Moderate password';
        case 'strong':
          return 'Strong password';
        default:
          return '';
      }
    };

    const getStrengthTextColor = () => {
      switch (strength) {
        case 'weak':
          return 'text-red-600';
        case 'moderate':
          return 'text-yellow-600';
        case 'strong':
          return 'text-green-600';
        default:
          return 'text-gray-500';
      }
    };

    return (
      <div className="mt-3">
        {/* Progress Bar */}
        {password.length > 0 && (
          <div className="mb-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
              ></div>
            </div>
            <p className={`text-sm font-medium mt-1.5 ${getStrengthTextColor()}`}>
              {getStrengthText()}
            </p>
          </div>
        )}

        {/* Requirements List */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              {hasMinLength ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={hasMinLength ? 'text-green-600' : 'text-gray-600'}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {hasUppercase ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={hasUppercase ? 'text-green-600' : 'text-gray-600'}>
                One uppercase letter
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {hasNumber ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={hasNumber ? 'text-green-600' : 'text-gray-600'}>
                One number
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {hasSpecialChar ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
              <span className={hasSpecialChar ? 'text-green-600' : 'text-gray-600'}>
                One special character (!@#$%^&*...)
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* Add Payment Modal */}
      {showAddPaymentModal && <AddPaymentModal />}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security</p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                    activeSection === section.id
                      ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="col-span-9">
          <div className="bg-white rounded-xl border border-gray-200">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

                {/* Profile Photo */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-2xl">
                      {loading ? '...' : (user?.name?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    <div>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Change Photo
                      </button>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          placeholder="+213 555 123 456"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          placeholder="City, Country"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

                {/* Change Password */}
                <div className="mb-8">
                  <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <PasswordStrengthIndicator password={password} strength={passwordStrength} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm">
                    Enable 2FA
                  </button>
                </div>

                {/* Active Sessions */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Chrome on Windows</div>
                        <div className="text-sm text-gray-600">Algiers, Algeria • Active now</div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Current</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Safari on iPhone</div>
                        <div className="text-sm text-gray-600">Algiers, Algeria • 2 hours ago</div>
                      </div>
                      <button className="text-sm text-red-600 hover:text-red-700 font-medium">Revoke</button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button 
                    onClick={handleSave}
                    disabled={passwordStrength !== 'strong' && password.length > 0}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    Update Security
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'New customer feedback', description: 'Get notified when customers leave reviews' },
                        { label: 'Menu scan alerts', description: 'Daily summary of menu QR code scans' },
                        { label: 'Subscription updates', description: 'Billing and plan change notifications' },
                        { label: 'Marketing tips', description: 'Weekly tips to grow your restaurant' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked={idx < 2} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-4">Push Notifications</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Real-time feedback alerts', description: 'Instant notifications for new reviews' },
                        { label: 'System updates', description: 'Important platform updates and features' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Billing Section */}
            {activeSection === 'billing' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing & Subscription</h2>

                {/* Current Plan */}
                <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Standard Plan</h3>
                      <p className="text-sm text-gray-600">3 restaurants • Unlimited menus</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">2,500 DZD</div>
                      <div className="text-sm text-gray-600">per month</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                        onClick={() => router.push('/dashboard/settings/plans')}
                        className="px-4 py-2 bg-white text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors font-medium text-sm"
                    >
                        Change Plan
                    </button>
                    <button 
                        onClick={() => router.push('/dashboard/settings/subscription')}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                    >
                        Manage Subscription
                    </button>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Payment Methods</h3>
                    <button 
                      onClick={() => setShowAddPaymentModal(true)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      Add Method
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-orange-300">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-gray-900 rounded flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
                          <div className="text-sm text-gray-600">Expires 12/25</div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Default</span>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Billing History</h3>
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
                          { date: 'Nov 1, 2025', desc: 'Standard Plan - Monthly', amount: '2,500 DZD', status: 'Paid' },
                          { date: 'Oct 1, 2025', desc: 'Standard Plan - Monthly', amount: '2,500 DZD', status: 'Paid' },
                          { date: 'Sep 1, 2025', desc: 'Standard Plan - Monthly', amount: '2,500 DZD', status: 'Paid' },
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
                              <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">Download</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                      <option>English</option>
                      <option>Français</option>
                      <option>العربية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                      <option>Africa/Algiers (GMT+1)</option>
                      <option>Europe/Paris (GMT+1)</option>
                      <option>UTC (GMT+0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                      <option>DZD - Algerian Dinar</option>
                      <option>EUR - Euro</option>
                      <option>USD - US Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
