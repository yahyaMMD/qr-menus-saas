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
  Save,
  Camera,
  Phone,
  MapPin,
  X,
  Check,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
// Profile Photo Upload Component with Camera Icon Overlay
function ProfilePhotoUpload({
  value,
  onChange,
  fallbackLetter
}: {
  value: string;
  onChange: (url: string | null) => void;
  fallbackLetter: string;
}) {
  const [isUploading, setIsUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload JPG, PNG, WebP, or GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'qr-menus/avatars');

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        className="hidden"
        disabled={isUploading}
      />

      {/* Photo */}
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
        {value ? (
          <img src={value} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-3xl">
            {fallbackLetter}
          </div>
        )}
      </div>

      {/* Camera Button Overlay */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors disabled:opacity-50"
        title="Change photo"
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  notifications: {
    email: {
      feedback: boolean;
      menuScans: boolean;
      subscription: boolean;
      marketing: boolean;
    };
    push: {
      feedback: boolean;
      system: boolean;
    };
  };
}

type BillingRecord = {
  id: string;
  createdAt: string;
  description: string;
  amountCents: number;
  currency: string;
  status: string;
  reference?: string | null;
};

const mergePreferencesWithDefaults = (
  base: UserPreferences,
  incoming?: Partial<UserPreferences>
): UserPreferences => {
  const notifications = {
    email: {
      ...base.notifications.email,
      ...(incoming?.notifications?.email ?? {}),
    },
    push: {
      ...base.notifications.push,
      ...(incoming?.notifications?.push ?? {}),
    },
  };

  return {
    ...base,
    ...incoming,
    notifications,
  };
};

export default function AccountSettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'moderate' | 'strong' | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<'edahabia' | 'cib'>('edahabia');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    avatar: ''
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    timezone: 'Africa/Algiers',
    currency: 'DZD',
    dateFormat: 'DD/MM/YYYY',
    notifications: {
      email: {
        feedback: true,
        menuScans: true,
        subscription: true,
        marketing: false,
      },
      push: {
        feedback: true,
        system: true,
      },
    },
  });
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);

  const router = useRouter();


  useEffect(() => {
    fetchUserData();
    fetchPreferences();
    fetchBillingHistory();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user', {
        credentials: 'include',
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
          location: data.user.location || '',
          avatar: data.user.avatar || ''
        });
      } else if (response.status === 401) {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const serverPrefs = data.preferences || {};
        setPreferences((prev) => mergePreferencesWithDefaults(prev, serverPrefs));
        if (serverPrefs.defaultPaymentMethod) {
          setDefaultPaymentMethod(serverPrefs.defaultPaymentMethod as 'edahabia' | 'cib');
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
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
      setBillingHistory(
        (data.payments ?? []).map((payment: any) => ({
          ...payment,
          description: payment.description || 'Subscription payment',
        }))
      );
    } catch (error: any) {
      setBillingError(error.message || 'Failed to load billing history');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();

      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: fullName,
          email: profileData.email,
          phone: profileData.phone || null,
          location: profileData.location || null,
          avatar: profileData.avatar || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setUser(data.user);
      setSuccess('Profile saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!currentPassword || !password || !confirmPassword) {
        throw new Error('All password fields are required');
      }

      if (password !== confirmPassword) {
        throw new Error('New password and confirmation do not match');
      }

      if (passwordStrength !== 'strong') {
        throw new Error('Please use a strong password');
      }

      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword: password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully! Please log in again.');
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');

      // Log out after password change
      // Cookies are cleared by the server on logout
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          notifications: preferences.notifications,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save notification preferences');
      }

      setPreferences((prev) => mergePreferencesWithDefaults(prev, data.preferences || {}));
      setSuccess('Notification preferences saved!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save notification preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          language: preferences.language,
          timezone: preferences.timezone,
          currency: preferences.currency,
          dateFormat: preferences.dateFormat,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save preferences');
      }

      setPreferences((prev) => mergePreferencesWithDefaults(prev, data.preferences || {}));
      setSuccess('Preferences saved!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
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

  // Add Payment Method Modal Component - For Algerian cards (EDDAHABIA/CIB)
  const AddPaymentModal = () => {
    const [selectedMethod, setSelectedMethod] = useState<'edahabia' | 'cib'>(defaultPaymentMethod);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);

    const handleSubmit = async () => {
      setIsSubmitting(true);
      setModalError(null);

      try {
        const response = await fetch('/api/user/preferences', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            defaultPaymentMethod: selectedMethod,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save payment method');
        }

        // Update local state
        setDefaultPaymentMethod(selectedMethod);
        setSuccess(`${selectedMethod.toUpperCase()} set as default payment method!`);
        setTimeout(() => setSuccess(null), 3000);
        setShowAddPaymentModal(false);
      } catch (err: any) {
        console.error('Save payment method error:', err);
        setModalError(err.message || 'Failed to save payment method');
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Payment Method</h3>
            <button
              onClick={() => setShowAddPaymentModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-600 mb-6">
              Select your preferred payment method for subscriptions. Payments are processed securely via Chargily.
            </p>

            <div className="space-y-3 mb-6">
              {/* EDDAHABIA Option */}
              <button
                type="button"
                onClick={() => setSelectedMethod('edahabia')}
                className={`w-full p-4 border-2 rounded-xl text-left transition-all ${selectedMethod === 'edahabia'
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'edahabia' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                    }`}>
                    {selectedMethod === 'edahabia' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-8 bg-yellow-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">EDA</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">EDDAHABIA</p>
                      <p className="text-xs text-gray-500">Algérie Poste</p>
                    </div>
                  </div>
                </div>
              </button>

              {/* CIB Option */}
              <button
                type="button"
                onClick={() => setSelectedMethod('cib')}
                className={`w-full p-4 border-2 rounded-xl text-left transition-all ${selectedMethod === 'cib'
                  ? 'border-orange-500 bg-orange-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === 'cib' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                    }`}>
                    {selectedMethod === 'cib' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-xs">CIB</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">CIB</p>
                      <p className="text-xs text-gray-500">SATIM Interbank Card</p>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-orange-800">
                <span className="font-semibold">How it works:</span>
                <br />
                When you subscribe to a plan, you'll be redirected to Chargily's secure payment page to complete your payment.
              </p>
            </div>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {modalError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddPaymentModal(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Preference'
                )}
              </button>
            </div>
          </div>
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
        case 'weak': return 'bg-red-500';
        case 'moderate': return 'bg-yellow-500';
        case 'strong': return 'bg-green-500';
        default: return 'bg-gray-200';
      }
    };

    const getStrengthWidth = () => {
      switch (strength) {
        case 'weak': return 'w-1/3';
        case 'moderate': return 'w-2/3';
        case 'strong': return 'w-full';
        default: return 'w-0';
      }
    };

    const getStrengthText = () => {
      switch (strength) {
        case 'weak': return 'Weak password';
        case 'moderate': return 'Moderate password';
        case 'strong': return 'Strong password';
        default: return '';
      }
    };

    const getStrengthTextColor = () => {
      switch (strength) {
        case 'weak': return 'text-red-600';
        case 'moderate': return 'text-yellow-600';
        case 'strong': return 'text-green-600';
        default: return 'text-gray-500';
      }
    };

    return (
      <div className="mt-3">
        {password.length > 0 && (
          <div className="mb-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}></div>
            </div>
            <p className={`text-sm font-medium mt-1.5 ${getStrengthTextColor()}`}>
              {getStrengthText()}
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              {hasMinLength ? <Check className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
              <span className={hasMinLength ? 'text-green-600' : 'text-gray-600'}>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {hasUppercase ? <Check className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
              <span className={hasUppercase ? 'text-green-600' : 'text-gray-600'}>One uppercase letter</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {hasNumber ? <Check className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
              <span className={hasNumber ? 'text-green-600' : 'text-gray-600'}>One number</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {hasSpecialChar ? <Check className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
              <span className={hasSpecialChar ? 'text-green-600' : 'text-gray-600'}>One special character (!@#$%^&*...)</span>
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

      {/* Global Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${activeSection === section.id
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
                  <ProfilePhotoUpload
                    value={profileData.avatar}
                    onChange={(url) => setProfileData({ ...profileData, avatar: url || '' })}
                    fallbackLetter={loading ? '...' : (user?.name?.charAt(0).toUpperCase() || 'U')}
                  />
                </div>

                {/* Form Fields */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
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
                  <button
                    onClick={() => fetchUserData()}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                      )}
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
                    onClick={handleChangePassword}
                    disabled={isSaving || passwordStrength !== 'strong' || !currentPassword || password !== confirmPassword}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Update Password
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
                        { key: 'feedback', label: 'New customer feedback', description: 'Get notified when customers leave reviews' },
                        { key: 'menuScans', label: 'Menu scan alerts', description: 'Daily summary of menu QR code scans' },
                        { key: 'subscription', label: 'Subscription updates', description: 'Billing and plan change notifications' },
                        { key: 'marketing', label: 'Marketing tips', description: 'Weekly tips to grow your restaurant' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences.notifications.email[item.key as keyof typeof preferences.notifications.email]}
                              onChange={(e) => setPreferences({
                                ...preferences,
                                notifications: {
                                  ...preferences.notifications,
                                  email: {
                                    ...preferences.notifications.email,
                                    [item.key]: e.target.checked
                                  }
                                }
                              })}
                              className="sr-only peer"
                            />
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
                        { key: 'feedback', label: 'Real-time feedback alerts', description: 'Instant notifications for new reviews' },
                        { key: 'system', label: 'System updates', description: 'Important platform updates and features' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences.notifications.push[item.key as keyof typeof preferences.notifications.push]}
                              onChange={(e) => setPreferences({
                                ...preferences,
                                notifications: {
                                  ...preferences.notifications,
                                  push: {
                                    ...preferences.notifications.push,
                                    [item.key]: e.target.checked
                                  }
                                }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={isSaving}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
                      Change Preference
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-orange-300">
                      <div className="flex items-center gap-3">
                        {defaultPaymentMethod === 'edahabia' ? (
                          <>
                            <div className="w-12 h-8 bg-yellow-500 rounded flex items-center justify-center">
                              <span className="text-white font-bold text-xs">EDA</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">EDDAHABIA</div>
                              <div className="text-sm text-gray-600">Algérie Poste</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                              <span className="text-white font-bold text-xs">CIB</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">CIB</div>
                              <div className="text-sm text-gray-600">SATIM Interbank Card</div>
                            </div>
                          </>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Default</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Payments are processed securely via Chargily. You can use {defaultPaymentMethod === 'edahabia' ? 'CIB' : 'EDDAHABIA'} cards too.
                    </p>
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
                              No payments recorded yet. Your billing history will appear here.
                            </td>
                          </tr>
                        ) : (
                          billingHistory.map((invoice) => {
                            const amount = (invoice.amountCents / 100).toLocaleString();
                            const statusTone =
                              invoice.status === 'PAID'
                                ? 'bg-green-100 text-green-700'
                                : invoice.status === 'FAILED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700';
                            return (
                              <tr
                                key={invoice.id}
                                className="border-b border-gray-200 hover:bg-gray-50"
                              >
                                <td className="py-4 px-4 text-sm text-gray-900">
                                  {new Date(invoice.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-600">{invoice.description}</td>
                                <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                  {amount} {invoice.currency}
                                </td>
                                <td className="py-4 px-4">
                                  <span className={`px-3 py-1 text-xs font-medium ${statusTone} rounded-full`}>
                                    {invoice.status}
                                  </span>
                                </td>
                                <td className="py-4 px-4">
                                  {invoice.reference ? (
                                    <button
                                      className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                                    >
                                      Download
                                    </button>
                                  ) : (
                                    <span className="text-xs text-gray-400">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
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
                    <select
                      value={preferences.language}
                      onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="ar">العربية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={preferences.timezone}
                      onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="Africa/Algiers">Africa/Algiers (GMT+1)</option>
                      <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                      <option value="UTC">UTC (GMT+0)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={preferences.currency}
                      onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="DZD">DZD - Algerian Dinar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - US Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                    <select
                      value={preferences.dateFormat}
                      onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <button
                    onClick={handleSavePreferences}
                    disabled={isSaving}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
