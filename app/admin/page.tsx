"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BellDot,
  DollarSign,
  LogOut,
  MessageCircle,
  QrCode,
  Search,
  ShieldCheck,
  Star,
  ThumbsUp,
  TrendingUp,
  Users,
  UtensilsCrossed,
} from "lucide-react";

type AuthTokens = { accessToken: string; refreshToken: string };
type AuthUser = { id?: string; email?: string; role?: string; name?: string };

type Profile = {
  id: string;
  name: string;
  status: string;
  description: string | null;
  owner: { id: string; name: string; email: string; role: string } | null;
  stats: { menus: number; feedbacks: number; items: number; scanRecords: number };
  createdAt: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  profileCount: number;
  createdAt: string;
};

type SubscriptionRow = {
  id: string;
  userId: string;
  plan: string;
  status: string;
  expiresAt: string;
  active: boolean;
  priceCents: number | null;
  currency: string | null;
  user?: { id: string; email: string; name: string; role: string; isActive: boolean };
};

type PaymentRow = {
  id: string;
  userId: string;
  subscriptionId: string | null;
  amountCents: number;
  currency: string;
  status: string;
  reference: string | null;
  createdAt: string;
  user?: { id: string; email: string; name: string };
  subscription?: { id: string; plan: string; status: string };
};

type PlanCatalog = {
  id: string;
  plan: string;
  priceCents: number;
  currency: string;
  description: string | null;
};

type Feedback = {
  id: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  profile: { id: string; name: string } | null;
};

type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
  user: { id: string; email: string; name: string };
};

type AnalyticsSummary = {
  totals: {
    users: number;
    activeUsers: number;
    profiles: number;
    activeProfiles: number;
    activeSubscriptions: number;
    revenueCents: number;
  };
  scans: { date: string; scans: number }[];
};

const TOKEN_KEY = "authTokens";
const USER_KEY = "authUser";
const ADMIN_ROLE = "ADMIN";

export default function AdminPage() {
  const router = useRouter();
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [plans, setPlans] = useState<PlanCatalog[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] =
    useState<"dashboard" | "users" | "restaurants" | "subscriptions" | "analytics" | "feedback">("dashboard");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [restaurantQuery, setRestaurantQuery] = useState("");
  const [subscriptionQuery, setSubscriptionQuery] = useState("");
  const [feedbackQuery, setFeedbackQuery] = useState("");
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "ADMIN" });
  const [upgradePayload, setUpgradePayload] = useState({
    userId: "",
    plan: "STANDARD",
    expiresAt: "",
    priceCents: 4900,
    currency: "USD",
    role: "",
  });

  useEffect(() => {
    const storedTokens = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    const storedUser = typeof window !== "undefined" ? localStorage.getItem(USER_KEY) : null;
    if (storedTokens) {
      try {
        setTokens(JSON.parse(storedTokens));
      } catch {
        setTokens(null);
      }
    }
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!tokens || !user || user.role !== ADMIN_ROLE) {
      if (user && user.role !== ADMIN_ROLE) {
        router.replace("/");
      }
      return;
    }

    const safeFetch = async (input: string, init?: RequestInit) => {
      const res = await fetch(input, {
        ...init,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "Content-Type": "application/json",
          ...(init?.headers || {}),
        },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setTokens(null);
        setUser(null);
        router.replace("/test/login");
        throw new Error("Session expired. Please log in again.");
      }
      return res;
    };

    async function load() {
      try {
        setLoading(true);
        const [
          profilesRes,
          usersRes,
          subsRes,
          payRes,
          plansRes,
          feedbackRes,
          ticketsRes,
          analyticsRes,
        ] = await Promise.all([
          safeFetch("/api/admin/profiles"),
          safeFetch("/api/admin/users"),
          safeFetch("/api/admin/subscriptions"),
          safeFetch("/api/admin/payments"),
          safeFetch("/api/admin/plans"),
          safeFetch("/api/admin/feedback"),
          safeFetch("/api/admin/support"),
          safeFetch("/api/admin/analytics"),
        ]);

        if (!profilesRes.ok) throw new Error("Failed to load profiles");
        if (!usersRes.ok) throw new Error("Failed to load users");
        if (!subsRes.ok) throw new Error("Failed to load subscriptions");
        if (!payRes.ok) throw new Error("Failed to load payments");
        if (!plansRes.ok) throw new Error("Failed to load plans");
        if (!feedbackRes.ok) throw new Error("Failed to load feedback");
        if (!ticketsRes.ok) throw new Error("Failed to load tickets");
        if (!analyticsRes.ok) throw new Error("Failed to load analytics");

        const profilesJson = await profilesRes.json();
        const usersJson = await usersRes.json();
        const subsJson = await subsRes.json();
        const payJson = await payRes.json();
        const plansJson = await plansRes.json();
        const feedbackJson = await feedbackRes.json();
        const ticketsJson = await ticketsRes.json();
        const analyticsJson = await analyticsRes.json();

        setProfiles(profilesJson.profiles ?? []);
        setUsers(usersJson.users ?? []);
        setSubscriptions(subsJson.subscriptions ?? []);
        setPayments(payJson.payments ?? []);
        setPlans(plansJson.plans ?? []);
        setFeedback(feedbackJson.feedback ?? []);
        setTickets(ticketsJson.tickets ?? []);
        setAnalytics(analyticsJson);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [tokens, user, router]);

  const totals = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive).length;
    const totalRestaurants = profiles.length;
    const activeRestaurants = profiles.filter((p) => p.status === "ACTIVE").length;
    const totalScans = profiles.reduce((sum, p) => sum + (p.stats?.scanRecords ?? 0), 0);
    const activeSubscriptions = subscriptions.filter((s) => s.status === "ACTIVE").length;
    const revenueCents = payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amountCents, 0);
    const avgRating = feedback.length
      ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length
      : 0;

    return {
      totalUsers,
      activeUsers,
      totalRestaurants,
      activeRestaurants,
      totalScans,
      activeSubscriptions,
      revenueCents,
      avgRating,
      totalFeedback: feedback.length,
    };
  }, [users, profiles, subscriptions, payments, feedback]);

  const authHeaders =
    tokens && {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
    };

  // Actions
  const toggleProfileStatus = async (profile: Profile) => {
    if (!authHeaders) return;
    setActionLoading(`profile-${profile.id}`);
    try {
      const res = await fetch(`/api/admin/profiles/${profile.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status: profile.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update profile");
      setProfiles((prev) => prev.map((p) => (p.id === profile.id ? { ...p, status: data.profile.status } : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setActionLoading(null);
    }
  };

  const updateUserRole = async (u: UserRow, role: string) => {
    if (!authHeaders) return;
    setActionLoading(`user-role-${u.id}`);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update role");
      setUsers((prev) => prev.map((row) => (row.id === u.id ? { ...row, role: data.user.role } : row)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleUserActive = async (u: UserRow) => {
    if (!authHeaders) return;
    setActionLoading(`user-active-${u.id}`);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update user");
      setUsers((prev) => prev.map((row) => (row.id === u.id ? { ...row, isActive: data.user.isActive } : row)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (u: UserRow) => {
    if (!authHeaders) return;
    setActionLoading(`user-delete-${u.id}`);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to delete user");
      setUsers((prev) => prev.filter((row) => row.id !== u.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const createUser = async () => {
    if (!authHeaders) return;
    setActionLoading("create-user");
    try {
      const res = await fetch(`/api/admin/users`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create user");
      setUsers((prev) => [data.user, ...prev]);
      setNewUser({ name: "", email: "", password: "", role: "ADMIN" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setActionLoading(null);
    }
  };

  const exportData = async () => {
    if (!authHeaders) return;
    setActionLoading("export");
    try {
      const res = await fetch("/api/admin/export", { headers: authHeaders });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qr-menus-admin-export.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setActionLoading(null);
    }
  };

  const updatePlan = async (plan: PlanCatalog, updates: Partial<PlanCatalog>) => {
    if (!authHeaders) return;
    setActionLoading(`plan-${plan.plan}`);
    try {
      const res = await fetch(`/api/admin/plans`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({
          plan: plan.plan,
          priceCents: updates.priceCents ?? plan.priceCents,
          currency: updates.currency ?? plan.currency,
          description: updates.description ?? plan.description ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update plan");
      setPlans((prev) => {
        const others = prev.filter((p) => p.plan !== plan.plan);
        return [...others, data.plan];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update plan");
    } finally {
      setActionLoading(null);
    }
  };

  const upgradeSubscription = async () => {
    if (!authHeaders) return;
    setActionLoading("upgrade-sub");
    try {
      const res = await fetch(`/api/admin/subscriptions`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          userId: upgradePayload.userId,
          plan: upgradePayload.plan,
          expiresAt: upgradePayload.expiresAt || undefined,
          priceCents: Number(upgradePayload.priceCents),
          currency: upgradePayload.currency,
          role: upgradePayload.role || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to upgrade subscription");
      setSubscriptions((prev) => {
        const others = prev.filter((s) => s.userId !== upgradePayload.userId);
        return [data.subscription, ...others];
      });
      setUpgradePayload({ userId: "", plan: "STANDARD", expiresAt: "", priceCents: 4900, currency: "USD", role: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upgrade subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const respondTicket = async (ticket: SupportTicket, response: string) => {
    if (!authHeaders) return;
    setActionLoading(`ticket-${ticket.id}`);
    try {
      const res = await fetch(`/api/admin/support`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ ticketId: ticket.id, response }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to respond");
      setTickets((prev) => prev.map((t) => (t.id === ticket.id ? data.ticket : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to respond");
    } finally {
      setActionLoading(null);
    }
  };

  if (!tokens || !user || user.role !== ADMIN_ROLE) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <aside className="w-60 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <nav className="space-y-1 text-sm">
            {[
              { key: "dashboard", label: "Admin Dashboard" },
              { key: "users", label: "User Management" },
              { key: "restaurants", label: "All Restaurants" },
              { key: "subscriptions", label: "Subscriptions" },
              { key: "analytics", label: "Platform Analytics" },
              { key: "feedback", label: "All Feedback" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key as typeof activeSection)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                  activeSection === item.key ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-6 border-t pt-4">
            <button className="flex w-full items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-700">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 space-y-8">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {activeSection === "dashboard" && (
            <DashboardSection totals={totals} analytics={analytics} loading={loading} />
          )}
          {activeSection === "users" && (
            <UsersSection
              users={users}
              loading={loading}
              userQuery={userQuery}
              setUserQuery={setUserQuery}
              newUser={newUser}
              setNewUser={setNewUser}
              onCreateUser={createUser}
              onToggleActive={toggleUserActive}
              onDeleteUser={deleteUser}
              onChangeRole={updateUserRole}
              actionLoading={actionLoading}
            />
          )}
          {activeSection === "restaurants" && (
            <RestaurantsSection
              profiles={profiles}
              loading={loading}
              onToggleStatus={toggleProfileStatus}
              actionLoading={actionLoading}
              restaurantQuery={restaurantQuery}
              setRestaurantQuery={setRestaurantQuery}
            />
          )}
          {activeSection === "subscriptions" && (
            <SubscriptionsSection
              plans={plans}
              subscriptions={subscriptions}
              payments={payments}
              loading={loading}
              onUpdatePlan={updatePlan}
              onUpgrade={upgradeSubscription}
              upgradePayload={upgradePayload}
              setUpgradePayload={setUpgradePayload}
              actionLoading={actionLoading}
              subscriptionQuery={subscriptionQuery}
              setSubscriptionQuery={setSubscriptionQuery}
            />
          )}
          {activeSection === "analytics" && (
            <AnalyticsSection analytics={analytics} payments={payments} loading={loading} totals={totals} subscriptions={subscriptions} />
          )}
          {activeSection === "feedback" && (
            <FeedbackSection
              feedback={feedback}
              totals={totals}
              loading={loading}
              tickets={tickets}
              onRespond={respondTicket}
              actionLoading={actionLoading}
              onExport={exportData}
              feedbackQuery={feedbackQuery}
              setFeedbackQuery={setFeedbackQuery}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function DashboardSection({ totals, analytics, loading }: { totals: ReturnType<typeof computeDummy>; analytics: AnalyticsSummary | null; loading: boolean }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-600">Platform overview and management</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard card={{ label: "Total Users", value: totals.totalUsers.toLocaleString(), sub: `Active: ${totals.activeUsers}`, icon: <Users className="h-4 w-4 text-indigo-500" /> }} />
        <StatCard card={{ label: "Total Restaurants", value: totals.totalRestaurants.toLocaleString(), sub: `Active: ${totals.activeRestaurants}`, icon: <UtensilsCrossed className="h-4 w-4 text-emerald-500" /> }} />
        <StatCard card={{ label: "Active Subscriptions", value: totals.activeSubscriptions.toLocaleString(), icon: <ShieldCheck className="h-4 w-4 text-blue-500" /> }} />
        <StatCard card={{ label: "Platform Scans", value: totals.totalScans.toLocaleString(), icon: <QrCode className="h-4 w-4 text-purple-500" /> }} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="User Growth" subtitle="Total registered users over time" loading={loading} data={analytics?.scans} />
        <StatCard
          card={{
            label: "Monthly Revenue",
            value: totals.revenueCents ? `${(totals.revenueCents / 100).toLocaleString()} DZD` : "0 DZD",
            sub: "Paid payments",
            icon: <DollarSign className="h-4 w-4 text-orange-500" />,
          }}
        />
      </div>
    </div>
  );
}

function UsersSection({
  users,
  loading,
  userQuery,
  setUserQuery,
  newUser,
  setNewUser,
  onCreateUser,
  onToggleActive,
  onDeleteUser,
  onChangeRole,
  actionLoading,
}: {
  users: UserRow[];
  loading: boolean;
  userQuery: string;
  setUserQuery: React.Dispatch<React.SetStateAction<string>>;
  newUser: { name: string; email: string; password: string; role: string };
  setNewUser: React.Dispatch<React.SetStateAction<{ name: string; email: string; password: string; role: string }>>;
  onCreateUser: () => Promise<void>;
  onToggleActive: (u: UserRow) => Promise<void>;
  onDeleteUser: (u: UserRow) => Promise<void>;
  onChangeRole: (u: UserRow, role: string) => Promise<void>;
  actionLoading: string | null;
}) {
  const filtered = users.filter((u) => {
    const q = userQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-600">Manage all platform users and their accounts</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard card={{ label: "Total Users", value: users.length.toLocaleString(), sub: `${users.filter((u) => u.isActive).length} active`, icon: <Users className="h-4 w-4 text-indigo-500" /> }} />
        <StatCard card={{ label: "Suspended", value: users.filter((u) => !u.isActive).length.toString(), icon: <BellDot className="h-4 w-4 text-amber-500" /> }} />
        <StatCard card={{ label: "Admins", value: users.filter((u) => u.role === "ADMIN").length.toString(), icon: <ShieldCheck className="h-4 w-4 text-green-500" /> }} />
        <StatCard card={{ label: "Avg. Profiles/User", value: (users.length ? (users.reduce((sum, u) => sum + u.profileCount, 0) / users.length).toFixed(1) : "0"), icon: <TrendingUp className="h-4 w-4 text-blue-500" /> }} />
      </div>

      <FilterBar placeholder="Search users..." value={userQuery} onChange={setUserQuery} />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">All Users</h3>
          <p className="text-sm text-gray-600">Complete list of registered users</p>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-12 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span className="col-span-4">User</span>
            <span className="col-span-2">Role</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Profiles</span>
            <span className="col-span-2 text-right">Joined</span>
          </div>
          {loading && (
            <div className="px-6 py-4 text-sm text-gray-600">Loading users...</div>
          )}
          {!loading && filtered.map((u) => (
            <div key={u.id} className="grid grid-cols-12 items-center px-6 py-3 text-sm">
              <div className="col-span-4">
                <div className="font-semibold text-gray-900">{u.name}</div>
                <div className="text-xs text-gray-600">{u.email}</div>
              </div>
              <div className="col-span-2 text-gray-800">
                <select
                  value={u.role}
                  onChange={(e) => onChangeRole(u, e.target.value)}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="RESTAURANT_OWNER">Restaurant Owner</option>
                  <option value="USER">User</option>
                </select>
              </div>
              <div className="col-span-2">
                <button
                  onClick={() => onToggleActive(u)}
                  className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-100"
                  disabled={actionLoading === `user-active-${u.id}`}
                >
                  {u.isActive ? "Suspend" : "Activate"}
                </button>
              </div>
              <div className="col-span-2 text-gray-800">{u.profileCount}</div>
              <div className="col-span-2 text-right text-sm text-gray-700">
                {new Date(u.createdAt).toLocaleDateString()}
                <button
                  onClick={() => onDeleteUser(u)}
                  className="ml-3 text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-60"
                  disabled={actionLoading === `user-delete-${u.id}` || u.profileCount > 0}
                  title={u.profileCount > 0 ? "Reassign or remove profiles first" : undefined}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RestaurantsSection({
  profiles,
  loading,
  onToggleStatus,
  actionLoading,
  restaurantQuery,
  setRestaurantQuery,
}: {
  profiles: Profile[];
  loading: boolean;
  onToggleStatus: (p: Profile) => Promise<void>;
  actionLoading: string | null;
  restaurantQuery: string;
  setRestaurantQuery: React.Dispatch<React.SetStateAction<string>>;
}) {
  const filtered = profiles.filter((p) => {
    const q = restaurantQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.owner?.name?.toLowerCase().includes(q) ?? false) ||
      (p.owner?.email?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">All Restaurants</h1>
        <p className="text-sm text-gray-600">View and manage all restaurant profiles on the platform</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard card={{ label: "Total Restaurants", value: profiles.length.toLocaleString(), sub: `${profiles.filter((p) => p.status === "ACTIVE").length} active`, icon: <UtensilsCrossed className="h-4 w-4 text-emerald-500" /> }} />
        <StatCard card={{ label: "Total Menus", value: profiles.reduce((sum, p) => sum + (p.stats?.menus ?? 0), 0).toLocaleString(), icon: <MessageCircle className="h-4 w-4 text-blue-500" /> }} />
        <StatCard card={{ label: "Total Items", value: profiles.reduce((sum, p) => sum + (p.stats?.items ?? 0), 0).toLocaleString(), icon: <ShieldCheck className="h-4 w-4 text-amber-500" /> }} />
        <StatCard card={{ label: "Total Scans", value: profiles.reduce((sum, p) => sum + (p.stats?.scanRecords ?? 0), 0).toLocaleString(), icon: <QrCode className="h-4 w-4 text-purple-500" /> }} />
      </div>

      <FilterBar placeholder="Search restaurants by name or owner..." value={restaurantQuery} onChange={setRestaurantQuery} />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">All Restaurants</h3>
          <p className="text-sm text-gray-600">Complete list of restaurant profiles</p>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-12 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span className="col-span-3">Restaurant</span>
            <span className="col-span-3">Owner</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Menus</span>
            <span className="col-span-2 text-right">Created</span>
          </div>
          {loading && <div className="px-6 py-4 text-sm text-gray-600">Loading restaurants...</div>}
          {!loading && filtered.map((p) => (
            <div key={p.id} className="grid grid-cols-12 items-center px-6 py-3 text-sm">
              <div className="col-span-3">
                <div className="font-semibold text-gray-900">{p.name}</div>
                <div className="text-xs text-gray-600">{p.description}</div>
              </div>
              <div className="col-span-3">
                <div className="text-sm text-gray-800">{p.owner?.name ?? "No owner"}</div>
                <div className="text-xs text-gray-600">{p.owner?.email}</div>
              </div>
              <div className="col-span-2">
                <Badge tone={p.status === "ACTIVE" ? "success" : p.status === "SUSPENDED" ? "danger" : "muted"}>{p.status}</Badge>
              </div>
              <div className="col-span-2 text-gray-800">{p.stats?.menus ?? 0}</div>
              <div className="col-span-2 text-right text-sm text-gray-700">
                {new Date(p.createdAt).toLocaleDateString()}
                <button
                  onClick={() => onToggleStatus(p)}
                  disabled={actionLoading === `profile-${p.id}`}
                  className="ml-3 text-xs font-semibold text-gray-800 hover:text-gray-900"
                >
                  {p.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubscriptionsSection({
  plans,
  subscriptions,
  payments,
  loading,
  onUpdatePlan,
  onUpgrade,
  upgradePayload,
  setUpgradePayload,
  actionLoading,
  subscriptionQuery,
  setSubscriptionQuery,
}: {
  plans: PlanCatalog[];
  subscriptions: SubscriptionRow[];
  payments: PaymentRow[];
  loading: boolean;
  onUpdatePlan: (plan: PlanCatalog, updates: Partial<PlanCatalog>) => Promise<void>;
  onUpgrade: () => Promise<void>;
  upgradePayload: {
    userId: string;
    plan: string;
    expiresAt: string;
    priceCents: number;
    currency: string;
    role: string;
  };
  setUpgradePayload: React.Dispatch<
    React.SetStateAction<{
      userId: string;
      plan: string;
      expiresAt: string;
      priceCents: number;
      currency: string;
      role: string;
    }>
  >;
  actionLoading: string | null;
  subscriptionQuery: string;
  setSubscriptionQuery: React.Dispatch<React.SetStateAction<string>>;
}) {
  const filteredSubs = subscriptions.filter((s) => {
    const q = subscriptionQuery.toLowerCase();
    return (
      s.user?.name?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q) ||
      s.plan.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">Subscription Management</h1>
        <p className="text-sm text-gray-600">Monitor and manage all platform subscriptions</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard card={{ label: "Active Subscriptions", value: subscriptions.filter((s) => s.status === "ACTIVE").length.toString(), icon: <ShieldCheck className="h-4 w-4 text-blue-500" /> }} />
        <StatCard card={{ label: "Monthly Revenue", value: `${(payments.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amountCents, 0) / 100).toLocaleString()} DZD`, icon: <DollarSign className="h-4 w-4 text-orange-500" /> }} />
        <StatCard card={{ label: "Plans", value: plans.length.toString(), icon: <MessageCircle className="h-4 w-4 text-indigo-500" /> }} />
        <StatCard card={{ label: "Payments", value: payments.length.toString(), icon: <TrendingUp className="h-4 w-4 text-green-500" /> }} />
      </div>

      <FilterBar placeholder="Search subscriptions by user or email..." value={subscriptionQuery} onChange={setSubscriptionQuery} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Plan Pricing</p>
          <p className="text-xs text-gray-600">Manage plan details and pricing</p>
          <div className="mt-4 space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="grid gap-2 rounded-xl border border-gray-100 p-3 md:grid-cols-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.plan}</p>
                  <p className="text-xs text-gray-600">{p.description}</p>
                </div>
                <input
                  type="number"
                  defaultValue={p.priceCents}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  onBlur={(e) => onUpdatePlan(p, { priceCents: Number(e.target.value) })}
                />
                <textarea
                  defaultValue={p.description ?? ""}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  onBlur={(e) => onUpdatePlan(p, { description: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Upgrade Subscription</p>
          <p className="text-xs text-gray-600">Manually adjust user plan or role</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={upgradePayload.userId}
              onChange={(e) => setUpgradePayload((prev) => ({ ...prev, userId: e.target.value }))}
              placeholder="User ID"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <select
              value={upgradePayload.plan}
              onChange={(e) => setUpgradePayload((prev) => ({ ...prev, plan: e.target.value }))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="FREE">Free</option>
              <option value="STANDARD">Standard</option>
              <option value="CUSTOM">Custom</option>
            </select>
            <input
              type="number"
              value={upgradePayload.priceCents}
              onChange={(e) => setUpgradePayload((prev) => ({ ...prev, priceCents: Number(e.target.value) }))}
              placeholder="Price cents"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <input
              type="date"
              value={upgradePayload.expiresAt}
              onChange={(e) => setUpgradePayload((prev) => ({ ...prev, expiresAt: e.target.value }))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <select
              value={upgradePayload.role}
              onChange={(e) => setUpgradePayload((prev) => ({ ...prev, role: e.target.value }))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            >
              <option value="">Keep current role</option>
              <option value="ADMIN">Admin</option>
              <option value="RESTAURANT_OWNER">Restaurant Owner</option>
              <option value="USER">User</option>
            </select>
            <button
              onClick={onUpgrade}
              disabled={actionLoading === "upgrade-sub"}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-60"
            >
              {actionLoading === "upgrade-sub" ? "Updating..." : "Upgrade / Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">Active Subscriptions</h3>
          <p className="text-sm text-gray-600">All subscription details and billing information</p>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-12 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span className="col-span-3">User</span>
            <span className="col-span-2">Plan</span>
            <span className="col-span-2">Amount</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Next Billing</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>
          {loading && <div className="px-6 py-4 text-sm text-gray-600">Loading subscriptions...</div>}
          {!loading &&
            filteredSubs.map((s) => (
              <div key={s.id} className="grid grid-cols-12 items-center px-6 py-3 text-sm">
                <div className="col-span-3">
                  <div className="font-semibold text-gray-900">{s.user?.name ?? s.userId}</div>
                  <div className="text-xs text-gray-600">{s.user?.email}</div>
                </div>
                <div className="col-span-2">
                  <Badge tone="muted">{s.plan}</Badge>
                </div>
                <div className="col-span-2 text-gray-800">
                  {s.priceCents ? `${(s.priceCents / 100).toLocaleString()} ${s.currency ?? ""}` : "—"}
                </div>
                <div className="col-span-2">
                  <Badge tone={s.status === "ACTIVE" ? "success" : s.status === "CANCELED" ? "danger" : "muted"}>{s.status}</Badge>
                </div>
                <div className="col-span-2 text-gray-800">
                  {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "—"}
                </div>
              <div className="col-span-1 text-right text-sm text-indigo-600">View</div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="text-base font-semibold text-gray-900">Expired / Canceled</h3>
          <p className="text-sm text-gray-600">Follow up with users whose subscriptions need attention</p>
        </div>
        <div className="divide-y divide-gray-100">
          <div className="grid grid-cols-12 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <span className="col-span-3">User</span>
            <span className="col-span-2">Plan</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-3">Expires</span>
            <span className="col-span-2 text-right">Action</span>
          </div>
          {subscriptions
            .filter((s) => s.status !== "ACTIVE")
            .map((s) => (
              <div key={s.id} className="grid grid-cols-12 items-center px-6 py-3 text-sm">
                <div className="col-span-3">
                  <div className="font-semibold text-gray-900">{s.user?.name ?? s.userId}</div>
                  <div className="text-xs text-gray-600">{s.user?.email}</div>
                </div>
                <div className="col-span-2">
                  <Badge tone="muted">{s.plan}</Badge>
                </div>
                <div className="col-span-2">
                  <Badge tone="danger">{s.status}</Badge>
                </div>
                <div className="col-span-3 text-gray-800">
                  {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "—"}
                </div>
                <div className="col-span-2 text-right text-sm text-indigo-600">Reach out</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsSection({
  analytics,
  totals,
  payments,
  subscriptions,
  loading,
}: {
  analytics: AnalyticsSummary | null;
  totals: ReturnType<typeof computeDummy>;
  payments: PaymentRow[];
  subscriptions: SubscriptionRow[];
  loading: boolean;
}) {
  const revenueData = useMemo(() => {
    const map = new Map<string, number>();
    payments
      .filter((p) => p.status === "PAID")
      .forEach((p) => {
        const key = new Date(p.createdAt).toISOString().slice(0, 7);
        map.set(key, (map.get(key) ?? 0) + p.amountCents / 100);
      });
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, scans]) => ({ date, scans }));
  }, [payments]);

  const planDist = useMemo(() => {
    const map = new Map<string, number>();
    subscriptions.forEach((s) => map.set(s.plan, (map.get(s.plan) ?? 0) + 1));
    return Array.from(map.entries()).map(([date, scans]) => ({ date, scans }));
  }, [subscriptions]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">Platform Analytics</h1>
        <p className="text-sm text-gray-600">Comprehensive platform performance metrics and insights</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard card={{ label: "Total Users", value: totals.totalUsers.toLocaleString(), sub: `${totals.activeUsers} active`, icon: <Users className="h-4 w-4 text-indigo-500" /> }} />
        <StatCard card={{ label: "Total Restaurants", value: totals.totalRestaurants.toLocaleString(), icon: <UtensilsCrossed className="h-4 w-4 text-emerald-500" /> }} />
        <StatCard card={{ label: "QR Code Scans", value: totals.totalScans.toLocaleString(), icon: <QrCode className="h-4 w-4 text-purple-500" /> }} />
        <StatCard card={{ label: "Total Revenue", value: `${(totals.revenueCents / 100).toLocaleString()} DZD`, icon: <DollarSign className="h-4 w-4 text-orange-500" /> }} />
        <StatCard card={{ label: "Active Subscriptions", value: totals.activeSubscriptions.toString(), icon: <ShieldCheck className="h-4 w-4 text-blue-500" /> }} />
        <StatCard card={{ label: "Feedback", value: totals.totalFeedback.toString(), icon: <MessageCircle className="h-4 w-4 text-blue-500" /> }} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="User Growth" subtitle="Total and active users over time" loading={loading} data={analytics?.scans} />
        <ChartCard title="QR Code Scans" subtitle="Total menu scans per period" loading={loading} data={analytics?.scans} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue Trend" subtitle="Paid payments over time" loading={loading} data={revenueData} />
        <ChartCard title="Plan Distribution" subtitle="Users by subscription plan" loading={loading} data={planDist} />
      </div>
    </div>
  );
}

function FeedbackSection({
  feedback,
  totals,
  loading,
  tickets,
  onRespond,
  actionLoading,
  onExport,
  feedbackQuery,
  setFeedbackQuery,
}: {
  feedback: Feedback[];
  totals: ReturnType<typeof computeDummy>;
  loading: boolean;
  tickets: SupportTicket[];
  onRespond: (t: SupportTicket, response: string) => Promise<void>;
  actionLoading: string | null;
  onExport: () => Promise<void>;
  feedbackQuery: string;
  setFeedbackQuery: React.Dispatch<React.SetStateAction<string>>;
}) {
  const filtered = feedback.filter((f) => {
    const q = feedbackQuery.toLowerCase();
    return (
      f.userName.toLowerCase().includes(q) ||
      (f.profile?.name?.toLowerCase().includes(q) ?? false) ||
      (f.comment?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-gray-900">All Feedback</h1>
        <p className="text-sm text-gray-600">Monitor and manage customer feedback across all restaurants</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard card={{ label: "Total Feedback", value: totals.totalFeedback.toLocaleString(), icon: <MessageCircle className="h-4 w-4 text-blue-500" /> }} />
        <StatCard card={{ label: "Avg. Rating", value: `${totals.avgRating.toFixed(1)}/5`, icon: <Star className="h-4 w-4 text-amber-500" /> }} />
        <StatCard card={{ label: "Profiles", value: totals.totalRestaurants.toLocaleString(), icon: <UtensilsCrossed className="h-4 w-4 text-emerald-500" /> }} />
        <StatCard card={{ label: "Helpful Votes", value: "-", icon: <ThumbsUp className="h-4 w-4 text-emerald-500" /> }} />
      </div>

      <FilterBar placeholder="Search feedback by customer, restaurant, or content..." value={feedbackQuery} onChange={setFeedbackQuery} />
      <div className="flex justify-end">
        <button
          onClick={onExport}
          disabled={actionLoading === "export"}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-100 disabled:opacity-60"
        >
          Export Data
        </button>
      </div>

      <div className="space-y-4">
        {loading && <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600">Loading feedback...</div>}
        {!loading &&
          filtered.map((f) => (
            <div key={f.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{f.userName}</div>
                  <div className="text-xs text-gray-600">{f.profile?.name ?? "Unknown restaurant"}</div>
                  <div className="mt-1 flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < f.rating ? "" : "text-gray-300"}`} fill={i < f.rating ? "#f59e0b" : "none"} />
                    ))}
                    <span className="ml-1 text-xs text-gray-700">{f.rating}/5</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="muted">Published</Badge>
                  <span className="text-sm text-gray-600">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-800">{f.comment}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  <span>—</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-100">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      <div className="flex justify-center">
        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-100">
          Load More Feedback
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Support Tickets</p>
            <p className="text-xs text-gray-600">Respond to user messages quickly</p>
          </div>
        </div>
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-xl border border-gray-100 p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.subject}</p>
                  <p className="text-xs text-gray-600">{t.user?.email}</p>
                  <p className="mt-1 text-sm text-gray-800">{t.message}</p>
                </div>
                <Badge tone={t.status === "RESOLVED" ? "success" : "muted"}>{t.status}</Badge>
              </div>
              {t.response ? (
                <p className="mt-2 text-sm text-gray-700">Response: {t.response}</p>
              ) : (
                <form
                  className="mt-2 flex flex-col gap-2 md:flex-row"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const value = (form.elements.namedItem("response") as HTMLInputElement).value;
                    if (value) {
                      await onRespond(t, value);
                      form.reset();
                    }
                  }}
                >
                  <input
                    name="response"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    placeholder="Write a reply..."
                  />
                  <button
                    type="submit"
                    disabled={actionLoading === `ticket-${t.id}`}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 disabled:opacity-60"
                  >
                    {actionLoading === `ticket-${t.id}` ? "Sending..." : "Send response"}
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ card }: { card: { label: string; value: string; sub?: string; icon?: JSX.Element } }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{card.value}</p>
          {card.sub && <p className="mt-1 text-xs text-emerald-600">↗ {card.sub}</p>}
        </div>
        {card.icon && <div className="rounded-full bg-gray-50 p-2">{card.icon}</div>}
      </div>
    </div>
  );
}

function FilterBar({ placeholder, value, onChange }: { placeholder: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-1 items-center gap-2 text-gray-500">
        <Search className="h-4 w-4" />
        <input
          className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
        <button className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-100">All Filters</button>
        <button className="rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-100">Status</button>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, data, loading }: { title: string; subtitle: string; data?: { date: string; scans: number }[]; loading: boolean }) {
  const bars = (data || []).slice(-10);
  const max = bars.reduce((m, b) => Math.max(m, b.scans), 0) || 1;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-600">{subtitle}</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">Trend</span>
      </div>
      <div className="mt-4 h-48 rounded-xl bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {loading && <div className="flex h-full items-center justify-center text-sm text-gray-600">Loading...</div>}
        {!loading && (
          <div className="flex h-full items-end justify-between gap-2 px-2 pb-2">
            {bars.map((b) => (
              <div
                key={b.date}
                className="w-full rounded-t-xl bg-orange-400"
                style={{ height: `${(b.scans / max) * 100 || 5}%` }}
                title={`${new Date(b.date).toLocaleDateString()}: ${b.scans}`}
              />
            ))}
            {bars.length === 0 && <div className="flex h-full w-full items-center justify-center text-sm text-gray-600">No data</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "success" | "danger" }) {
  const map: Record<typeof tone, string> = {
    muted: "bg-gray-100 text-gray-800",
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-rose-100 text-rose-700",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[tone]}`}>{children}</span>;
}

// Helper type used only for inference in useMemo (structure matches computeDummy return)
function computeDummy() {
  return {
    totalUsers: 0,
    activeUsers: 0,
    totalRestaurants: 0,
    activeRestaurants: 0,
    totalScans: 0,
    activeSubscriptions: 0,
    revenueCents: 0,
    avgRating: 0,
    totalFeedback: 0,
  };
}
