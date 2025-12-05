// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { Home, Store, Menu as MenuIcon, Settings, CreditCard, HelpCircle, LogOut, ChevronRight, BarChart3, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NotificationBell from "@/components/notifications/NotificationBell";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');

      await fetch('/api/auth?action=logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken, accessToken })
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('auth');
      router.push('/auth/login');
    }
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', badge: null },
    { icon: Store, label: 'Restaurants', href: '/dashboard/profiles', badge: null },
    { icon: Settings, label: 'Account Settings', href: '/dashboard/settings', badge: null },
    { icon: CreditCard, label: 'Subscription', href: '/dashboard/settings/subscription', badge: null },
    { icon: MessageSquare, label: 'Notifications', href: '/dashboard/notifications', badge: null },
    { icon: HelpCircle, label: 'Help & Support', href: '/help', badge: null },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <MenuIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MenuLix</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive(item.href) ? 'text-orange-600' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive(item.href) && (
                    <ChevronRight className="h-4 w-4 text-orange-600" />
                  )}
                </Link>
              ))}
            </div>
          </nav>

          {/* User Section & Logout */}
          <div className="border-t border-gray-200 p-3">
            {!loading && user && (
              <div className="px-3 py-2 mb-2">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <MenuIcon className="h-6 w-6" />
            </button>

            {/* Desktop: Page Title or Empty */}
            <div className="hidden lg:block"></div>

            {/* Right Side */}
            <div className="flex items-center gap-4 ml-auto">
              <NotificationBell />
              {!loading && user && (
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-600">
                      {user.role === 'ADMIN' ? 'Admin' : user.role === 'RESTAURANT_OWNER' ? 'Owner' : 'User'}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
};
