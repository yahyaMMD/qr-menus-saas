"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BellDot,
  Download,
  DollarSign,
  Eye,
  Filter,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Star,
  TicketCheck,
  ThumbsUp,
  Trash2,
  TrendingUp,
  UserRoundPlus,
  Users,
  UtensilsCrossed,
  X,
  Menu,
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

type FeedbackState = "Published" | "Pending" | "Flagged" | "Removed";

type DetailItem =
  | { type: "feedback"; data: Feedback }
  | { type: "subscription"; data: SubscriptionRow }
  | { type: "payment"; data: PaymentRow }
  | { type: "profile"; data: Profile }
  | { type: "user"; data: UserRow }
  | { type: "ticket"; data: SupportTicket };

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
const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
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
  const [feedbackStatuses, setFeedbackStatuses] = useState<Record<string, FeedbackState>>({});
  const [feedbackLimit, setFeedbackLimit] = useState(6);
  const [detailItem, setDetailItem] = useState<DetailItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedTokens = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedTokens) {
      try {
        setTokens(JSON.parse(storedTokens));
      } catch {
        setTokens(null);
      }
    } else {
      const access = localStorage.getItem(ACCESS_KEY);
      const refresh = localStorage.getItem(REFRESH_KEY);
      if (access) {
        setTokens({ accessToken: access, refreshToken: refresh ?? "" });
      }
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    } else {
      // If no user in storage but we have an access token, fetch current user
      const access = localStorage.getItem(ACCESS_KEY);
      if (access) {
        (async () => {
          try {
            const res = await fetch("/api/auth?action=me", {
              headers: { Authorization: `Bearer ${access}` },
            });
            if (res.ok) {
              const data = await res.json();
              setUser(data.user ?? null);
            }
          } catch {
            // ignore
          }
        })();
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
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
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

  useEffect(() => {
    if (!feedback.length) return;
    setFeedbackStatuses((prev) => {
      const next = { ...prev };
      feedback.forEach((f) => {
        if (!next[f.id]) {
          next[f.id] = deriveFeedbackState(f);
        }
      });
      return next;
    });
  }, [feedback]);

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

  const downloadCsv = (rows: string[][], filename: string) => {
    const content = rows.map((row) => row.map((cell) => `"${cell?.replace?.(/"/g, '""') ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportRestaurantsCsv = () => {
    const header = ["Name", "Owner", "Status", "Menus", "Feedbacks", "Items", "Scans", "Created"];
    const rows = profiles.map((p) => [
      p.name,
      p.owner?.email ?? "—",
      p.status,
      String(p.stats?.menus ?? 0),
      String(p.stats?.feedbacks ?? 0),
      String(p.stats?.items ?? 0),
      String(p.stats?.scanRecords ?? 0),
      new Date(p.createdAt).toLocaleDateString(),
    ]);
    downloadCsv([header, ...rows], "restaurants.csv");
  };

  const exportSubscriptionsCsv = () => {
    const header = ["User", "Plan", "Status", "Price", "Currency", "Expires"];
    const rows = subscriptions.map((s) => [
      s.user?.email ?? s.userId,
      s.plan,
      s.status,
      s.priceCents ? (s.priceCents / 100).toFixed(2) : "0",
      s.currency ?? "USD",
      s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "—",
    ]);
    downloadCsv([header, ...rows], "subscriptions.csv");
  };

  const exportPaymentsCsv = () => {
    const header = ["User", "Subscription", "Amount", "Currency", "Status", "Reference", "Created"];
    const rows = payments.map((p) => [
      p.user?.email ?? p.userId,
      p.subscription?.plan ?? p.subscriptionId ?? "—",
      (p.amountCents / 100).toFixed(2),
      p.currency,
      p.status,
      p.reference ?? "—",
      new Date(p.createdAt).toLocaleDateString(),
    ]);
    downloadCsv([header, ...rows], "payments.csv");
  };

  const goToSection = (section: typeof activeSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
    setTokens(null);
    setUser(null);
    router.replace("/test/login");
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

  const handleSupportNavigate = () => {
    goToSection("feedback");
    setTimeout(() => {
      if (typeof document !== "undefined") {
        document.getElementById("support-tickets")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 150);
  };

  const updateFeedbackStatus = (id: string, status: FeedbackState) => {
    setFeedbackStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const loadMoreFeedback = () => setFeedbackLimit((prev) => prev + 6);

  const openDetails = (item: DetailItem) => setDetailItem(item);
  const closeDetails = () => setDetailItem(null);

  const handleQuickAction = (action: "add-user" | "suspend-restaurant" | "upgrade-plan" | "export-data") => {
    switch (action) {
      case "add-user":
        goToSection("users");
        setTimeout(() => {
          if (typeof document !== "undefined") {
            document.getElementById("create-user-name")?.focus();
          }
        }, 150);
        break;
      case "suspend-restaurant":
        goToSection("restaurants");
        break;
      case "upgrade-plan":
        goToSection("subscriptions");
        setTimeout(() => {
          if (typeof document !== "undefined") {
            document.getElementById("upgrade-user-id")?.focus();
          }
        }, 150);
        break;
      case "export-data":
        exportData();
        break;
      default:
        break;
    }
  };

  if (!tokens || !user || user.role !== ADMIN_ROLE) {
    return null;
  }

  const navigation: { key: typeof activeSection; label: string; icon: JSX.Element }[] = [
    { key: "dashboard", label: "Admin Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "users", label: "User Management", icon: <Users className="h-4 w-4" /> },
    { key: "restaurants", label: "All Restaurants", icon: <UtensilsCrossed className="h-4 w-4" /> },
    { key: "subscriptions", label: "Subscriptions", icon: <ShieldCheck className="h-4 w-4" /> },
    { key: "analytics", label: "Platform Analytics", icon: <QrCode className="h-4 w-4" /> },
    { key: "feedback", label: "All Feedback", icon: <MessageCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-bold text-white">
            QM
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">QR Menus</p>
            <p className="text-xs text-slate-500">Admin Console</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:px-6">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-80 transform border-r border-slate-200 bg-white/95 backdrop-blur-lg p-6 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:flex lg:w-64 lg:flex-shrink-0 lg:translate-x-0 lg:rounded-3xl lg:border lg:p-5
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex h-full flex-col">
            <div className="mb-8 flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-lg font-bold text-white">
                QM
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">QR Menus</p>
                <p className="text-xs text-slate-500">Admin Console</p>
              </div>
            </div>
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.key}
                  onClick={() => goToSection(item.key)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                    activeSection === item.key 
                      ? "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-600 shadow-sm ring-1 ring-orange-100" 
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {item.icon} 
                    {item.label}
                  </span>
                  <MoreHorizontal className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </nav>
            <div className="border-t border-slate-200 pt-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-orange-500 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-8 lg:min-w-0">
          {error && (
            <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 text-sm text-orange-700 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">!</div>
                {error}
              </div>
            </div>
          )}
          
          {activeSection === "dashboard" && (
            <DashboardSection
              totals={totals}
              analytics={analytics}
              loading={loading}
              onExport={exportData}
              onSupport={handleSupportNavigate}
              onQuickAction={handleQuickAction}
            />
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
              onShowUser={(u) => openDetails({ type: "user", data: u })}
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
              onExport={exportRestaurantsCsv}
              onShowProfile={(p) => openDetails({ type: "profile", data: p })}
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
              onExport={() => {
                exportSubscriptionsCsv();
                exportPaymentsCsv();
              }}
              onShowSubscription={(s) => openDetails({ type: "subscription", data: s })}
              onShowPayment={(p) => openDetails({ type: "payment", data: p })}
            />
          )}
          {activeSection === "analytics" && (
            <AnalyticsSection analytics={analytics} payments={payments} loading={loading} totals={totals} subscriptions={subscriptions} onExport={exportData} />
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
              feedbackStatuses={feedbackStatuses}
              onChangeStatus={updateFeedbackStatus}
              limit={feedbackLimit}
              onLoadMore={loadMoreFeedback}
              onShowFeedback={(f) => openDetails({ type: "feedback", data: f })}
              supportAnchorId="support-tickets"
            />
          )}
        </main>
        {detailItem && <DetailsDrawer item={detailItem} onClose={closeDetails} />}
      </div>
    </div>
  );
}

function DashboardSection({
  totals,
  analytics,
  loading,
  onExport,
  onSupport,
  onQuickAction,
}: {
  totals: ReturnType<typeof computeDummy>;
  analytics: AnalyticsSummary | null;
  loading: boolean;
  onExport: () => void;
  onSupport: () => void;
  onQuickAction: (action: "add-user" | "suspend-restaurant" | "upgrade-plan" | "export-data") => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Admin Dashboard"
        subtitle="Platform overview and management"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onExport}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200"
            >
              <Download className="h-4 w-4 text-orange-500" />
              Export Report
            </button>
            <button
              onClick={onSupport}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40"
            >
              <TicketCheck className="h-4 w-4" />
              Support
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard card={{ label: "Total Users", value: totals.totalUsers.toLocaleString(), sub: `${totals.activeUsers} active users`, icon: <Users className="h-5 w-5 text-orange-500" />, tone: "red" }} />
        <StatCard card={{ label: "Total Restaurants", value: totals.totalRestaurants.toLocaleString(), sub: `${totals.activeRestaurants} active profiles`, icon: <UtensilsCrossed className="h-5 w-5 text-emerald-500" />, tone: "green" }} />
        <StatCard card={{ label: "Platform Scans", value: totals.totalScans.toLocaleString(), sub: "Engagement across QR menus", icon: <QrCode className="h-5 w-5 text-purple-500" />, tone: "purple" }} />
        <StatCard card={{ label: "Active Subscriptions", value: totals.activeSubscriptions.toLocaleString(), sub: `${(totals.revenueCents / 100).toLocaleString()} DZD revenue`, icon: <ShieldCheck className="h-5 w-5 text-blue-500" />, tone: "blue" }} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="User Growth" subtitle="Total and active users over time" loading={loading} data={analytics?.scans} />
        <ChartCard title="Monthly Revenue" subtitle="DZD revenue vs. expenses" loading={loading} data={analytics?.scans} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Plan Distribution" subtitle="Users by subscription plan" loading={loading} data={analytics?.scans} />
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Quick Actions</p>
              <p className="text-xs text-slate-600">Most requested admin tasks</p>
            </div>
            <MoreHorizontal className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label: "Add new user", action: "add-user", icon: <UserRoundPlus className="h-4 w-4" /> },
              { label: "Suspend restaurant", action: "suspend-restaurant", icon: <ShieldCheck className="h-4 w-4" /> },
              { label: "Upgrade plan", action: "upgrade-plan", icon: <TrendingUp className="h-4 w-4" /> },
              { label: "Export data", action: "export-data", icon: <Download className="h-4 w-4" /> },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onQuickAction(item.action as "add-user" | "suspend-restaurant" | "upgrade-plan" | "export-data")}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm font-semibold text-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:shadow-md"
              >
                <span>{item.label}</span>
                <div className="text-orange-500">{item.icon}</div>
              </button>
            ))}
          </div>
        </div>
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
  onShowUser,
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
  onShowUser: (u: UserRow) => void;
}) {
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "RESTAURANT_OWNER" | "USER">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED">("ALL");
  const filtered = users.filter((u) => {
    const q = userQuery.toLowerCase();
    const statusMatch = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? u.isActive : !u.isActive);
    const roleMatch = roleFilter === "ALL" || u.role === roleFilter;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    ) && statusMatch && roleMatch;
  });

  const cycleRoleFilter = () => {
    const options: typeof roleFilter[] = ["ALL", "ADMIN", "RESTAURANT_OWNER", "USER"];
    const nextIndex = (options.indexOf(roleFilter) + 1) % options.length;
    setRoleFilter(options[nextIndex]);
  };

  const cycleStatusFilter = () => {
    const options: typeof statusFilter[] = ["ALL", "ACTIVE", "SUSPENDED"];
    const nextIndex = (options.indexOf(statusFilter) + 1) % options.length;
    setStatusFilter(options[nextIndex]);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="User Management"
        subtitle="Manage all platform users and their accounts"
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={onCreateUser}
              disabled={actionLoading === "create-user"}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-60"
            >
              <UserRoundPlus className="h-4 w-4" />
              {actionLoading === "create-user" ? "Creating..." : "Add New User"}
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard card={{ label: "Total Users", value: users.length.toLocaleString(), sub: `${users.filter((u) => u.isActive).length} active`, icon: <Users className="h-5 w-5 text-orange-500" />, tone: "red" }} />
        <StatCard card={{ label: "Suspended", value: users.filter((u) => !u.isActive).length.toString(), icon: <BellDot className="h-5 w-5 text-amber-500" />, tone: "orange" }} />
        <StatCard card={{ label: "Admins", value: users.filter((u) => u.role === "ADMIN").length.toString(), icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />, tone: "green" }} />
        <StatCard card={{ label: "Avg. Profiles/User", value: (users.length ? (users.reduce((sum, u) => sum + u.profileCount, 0) / users.length).toFixed(1) : "0"), icon: <TrendingUp className="h-5 w-5 text-blue-500" />, tone: "blue" }} />
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/50">
        <p className="text-sm font-semibold text-slate-900">Create new user</p>
        <p className="text-xs text-slate-600">Add new admins or restaurant owners</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <input
            value={newUser.name}
            id="create-user-name"
            onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Full name"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
          />
          <input
            value={newUser.email}
            onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="Email"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
          />
          <input
            value={newUser.password}
            onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Temporary password"
            type="password"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
          >
            <option value="ADMIN">Admin</option>
            <option value="RESTAURANT_OWNER">Restaurant Owner</option>
            <option value="USER">User</option>
          </select>
          <button
            onClick={onCreateUser}
            disabled={actionLoading === "create-user"}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-60"
          >
            {actionLoading === "create-user" ? "Saving..." : "Save User"}
          </button>
        </div>
      </div>

      <FilterBar
        placeholder="Search by name, email, or phone..."
        value={userQuery}
        onChange={setUserQuery}
        filters={[
          { label: roleFilter === "ALL" ? "All Roles" : roleFilter.replace("_", " "), onClick: cycleRoleFilter },
          { label: statusFilter === "ALL" ? "All Status" : statusFilter === "ACTIVE" ? "Active" : "Suspended", onClick: cycleStatusFilter },
        ]}
      />

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">All Users</h3>
          <p className="text-sm text-slate-600">Complete list of registered users</p>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="hidden grid-cols-12 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid sm:px-6">
            <span className="col-span-4">User</span>
            <span className="col-span-2">Role</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Profiles</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          {loading && (
            <div className="px-4 py-8 text-center text-sm text-slate-600 sm:px-6">Loading users...</div>
          )}
          {!loading && filtered.map((u) => (
            <div key={u.id} className="grid grid-cols-1 gap-3 px-4 py-4 text-sm sm:grid-cols-12 sm:items-center sm:px-6 sm:py-3">
              <div className="col-span-1 flex items-center gap-3 sm:col-span-4">
                <Avatar name={u.name} />
                <div>
                  <div className="font-semibold text-slate-900">{u.name}</div>
                  <div className="text-xs text-slate-600">{u.email}</div>
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                <span className="text-xs text-slate-500 sm:hidden">Role:</span>
                <select
                  value={u.role}
                  onChange={(e) => onChangeRole(u, e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 sm:w-auto"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="RESTAURANT_OWNER">Restaurant Owner</option>
                  <option value="USER">User</option>
                </select>
              </div>
              <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                <span className="text-xs text-slate-500 sm:hidden">Status:</span>
                <div className="flex items-center gap-2">
                  <Badge tone={u.isActive ? "success" : "danger"}>{u.isActive ? "Active" : "Suspended"}</Badge>
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                <span className="text-xs text-slate-500 sm:hidden">Profiles:</span>
                <span className="text-slate-800">{u.profileCount}</span>
              </div>
              <div className="col-span-1 flex items-center justify-end gap-2 sm:col-span-2">
                <button
                  onClick={() => onToggleActive(u)}
                  className="rounded-full border border-slate-200 p-2 text-xs font-semibold text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm disabled:opacity-60"
                  disabled={actionLoading === `user-active-${u.id}`}
                  title={u.isActive ? "Suspend user" : "Activate user"}
                >
                  <ShieldCheck className="h-4 w-4 text-orange-500" />
                </button>
                <button
                  onClick={() => onShowUser(u)}
                  className="rounded-full border border-slate-200 p-2 text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
                  title="View details"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteUser(u)}
                  className="rounded-full p-2 text-orange-500 transition-all duration-200 hover:bg-orange-50 hover:shadow-sm disabled:opacity-60"
                  disabled={actionLoading === `user-delete-${u.id}` || u.profileCount > 0}
                  title={u.profileCount > 0 ? "Reassign or remove profiles first" : "Delete user"}
                >
                  <Trash2 className="h-4 w-4" />
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
  onExport,
  onShowProfile,
}: {
  profiles: Profile[];
  loading: boolean;
  onToggleStatus: (p: Profile) => Promise<void>;
  actionLoading: string | null;
  restaurantQuery: string;
  setRestaurantQuery: React.Dispatch<React.SetStateAction<string>>;
  onExport: () => void;
  onShowProfile: (p: Profile) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SUSPENDED" | "OTHER">("ALL");
  const [ownerFilter, setOwnerFilter] = useState<"ALL" | "ASSIGNED" | "UNASSIGNED">("ALL");
  const filtered = profiles.filter((p) => {
    const q = restaurantQuery.toLowerCase();
    const statusMatch =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && p.status === "ACTIVE") ||
      (statusFilter === "SUSPENDED" && p.status === "SUSPENDED") ||
      (statusFilter === "OTHER" && p.status !== "ACTIVE" && p.status !== "SUSPENDED");
    const ownerMatch =
      ownerFilter === "ALL" || (ownerFilter === "ASSIGNED" && !!p.owner) || (ownerFilter === "UNASSIGNED" && !p.owner);
    return (
      p.name.toLowerCase().includes(q) ||
      (p.owner?.name?.toLowerCase().includes(q) ?? false) ||
      (p.owner?.email?.toLowerCase().includes(q) ?? false)
    ) && statusMatch && ownerMatch;
  });

  const cycleStatusFilter = () => {
    const options: typeof statusFilter[] = ["ALL", "ACTIVE", "SUSPENDED", "OTHER"];
    const nextIndex = (options.indexOf(statusFilter) + 1) % options.length;
    setStatusFilter(options[nextIndex]);
  };

  const cycleOwnerFilter = () => {
    const options: typeof ownerFilter[] = ["ALL", "ASSIGNED", "UNASSIGNED"];
    const nextIndex = (options.indexOf(ownerFilter) + 1) % options.length;
    setOwnerFilter(options[nextIndex]);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="All Restaurants"
        subtitle="View and manage all restaurant profiles on the platform"
        actions={
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200"
          >
            <Download className="h-4 w-4 text-orange-500" />
            Export CSV
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard card={{ label: "Total Restaurants", value: profiles.length.toLocaleString(), sub: `${profiles.filter((p) => p.status === "ACTIVE").length} active`, icon: <UtensilsCrossed className="h-5 w-5 text-emerald-500" />, tone: "green" }} />
        <StatCard card={{ label: "Total Menus", value: profiles.reduce((sum, p) => sum + (p.stats?.menus ?? 0), 0).toLocaleString(), icon: <MessageCircle className="h-5 w-5 text-blue-500" />, tone: "blue" }} />
        <StatCard card={{ label: "Draft/Inactive", value: profiles.filter((p) => p.status !== "ACTIVE").length.toLocaleString(), icon: <BellDot className="h-5 w-5 text-amber-500" />, tone: "orange" }} />
        <StatCard card={{ label: "Total Scans", value: profiles.reduce((sum, p) => sum + (p.stats?.scanRecords ?? 0), 0).toLocaleString(), icon: <QrCode className="h-5 w-5 text-purple-500" />, tone: "purple" }} />
      </div>

      <FilterBar
        placeholder="Search restaurants by name or owner..."
        value={restaurantQuery}
        onChange={setRestaurantQuery}
        filters={[
          { label: statusFilter === "ALL" ? "All Status" : statusFilter, onClick: cycleStatusFilter },
          { label: ownerFilter === "ALL" ? "All Owners" : ownerFilter === "ASSIGNED" ? "With Owner" : "Unassigned", onClick: cycleOwnerFilter },
        ]}
      />

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">All Restaurants</h3>
          <p className="text-sm text-slate-600">Complete list of restaurant profiles</p>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="hidden grid-cols-12 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid sm:px-6">
            <span className="col-span-3">Restaurant</span>
            <span className="col-span-3">Owner</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Menus</span>
            <span className="col-span-2 text-right">Actions</span>
          </div>
          {loading && <div className="px-4 py-8 text-center text-sm text-slate-600 sm:px-6">Loading restaurants...</div>}
          {!loading && filtered.map((p) => (
            <div key={p.id} className="grid grid-cols-1 gap-3 px-4 py-4 text-sm sm:grid-cols-12 sm:items-center sm:px-6 sm:py-3">
              <div className="col-span-1 sm:col-span-3">
                <div className="font-semibold text-slate-900">{p.name}</div>
                <div className="text-xs text-slate-600 line-clamp-1">{p.description}</div>
              </div>
              <div className="col-span-1 flex items-center justify-between sm:col-span-3 sm:block">
                <span className="text-xs text-slate-500 sm:hidden">Owner:</span>
                <div>
                  <div className="text-sm text-slate-800">{p.owner?.name ?? "No owner"}</div>
                  <div className="text-xs text-slate-600">{p.owner?.email}</div>
                </div>
              </div>
              <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                <span className="text-xs text-slate-500 sm:hidden">Status:</span>
                <Badge tone={p.status === "ACTIVE" ? "success" : p.status === "SUSPENDED" ? "danger" : "muted"}>{p.status}</Badge>
              </div>
              <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                <span className="text-xs text-slate-500 sm:hidden">Menus:</span>
                <span className="text-slate-800">{p.stats?.menus ?? 0}</span>
              </div>
              <div className="col-span-1 flex items-center justify-end gap-2 sm:col-span-2">
                <button
                  onClick={() => onShowProfile(p)}
                  className="rounded-full border border-slate-200 p-2 text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onToggleStatus(p)}
                  disabled={actionLoading === `profile-${p.id}`}
                  className="rounded-full border border-slate-200 p-2 text-orange-500 transition-all duration-200 hover:bg-orange-50 hover:shadow-sm disabled:opacity-60"
                  title={p.status === "SUSPENDED" ? "Reactivate profile" : "Suspend profile"}
                >
                  <ShieldCheck className="h-4 w-4" />
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
  onExport,
  onShowSubscription,
  onShowPayment,
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
  onExport: () => void;
  onShowSubscription: (s: SubscriptionRow) => void;
  onShowPayment: (p: PaymentRow) => void;
}) {
  const reachOut = (email?: string | null) => {
    if (!email || typeof window === "undefined") return;
    window.location.href = `mailto:${email}?subject=Subscription%20follow-up`;
  };

  const [planFilter, setPlanFilter] = useState<"ALL" | "FREE" | "STANDARD" | "CUSTOM">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "CANCELED" | "EXPIRED">("ALL");

  const filteredSubs = subscriptions.filter((s) => {
    const q = subscriptionQuery.toLowerCase();
    const planMatch = planFilter === "ALL" || s.plan === planFilter;
    const statusMatch = statusFilter === "ALL" || s.status === statusFilter;
    return (
      s.user?.name?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q) ||
      s.plan.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q)
    ) && planMatch && statusMatch;
  });

  const cyclePlanFilter = () => {
    const options: typeof planFilter[] = ["ALL", "FREE", "STANDARD", "CUSTOM"];
    const nextIndex = (options.indexOf(planFilter) + 1) % options.length;
    setPlanFilter(options[nextIndex]);
  };

  const cycleStatusFilter = () => {
    const options: typeof statusFilter[] = ["ALL", "ACTIVE", "CANCELED", "EXPIRED"];
    const nextIndex = (options.indexOf(statusFilter) + 1) % options.length;
    setStatusFilter(options[nextIndex]);
  };

  const paymentRows = payments ?? [];

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Subscription Management"
        subtitle="Monitor and manage all platform subscriptions"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onExport}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200"
            >
              <Download className="h-4 w-4 text-orange-500" />
              Export
            </button>
            <button
              onClick={onUpgrade}
              disabled={actionLoading === "upgrade-sub"}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              {actionLoading === "upgrade-sub" ? "Saving..." : "Upgrade User"}
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard card={{ label: "Active Subscriptions", value: subscriptions.filter((s) => s.status === "ACTIVE").length.toString(), sub: "Current paying users", icon: <ShieldCheck className="h-5 w-5 text-blue-500" />, tone: "blue" }} />
        <StatCard card={{ label: "Monthly Revenue", value: `${(paymentRows.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amountCents, 0) / 100).toLocaleString()} DZD`, sub: "This month", icon: <DollarSign className="h-5 w-5 text-orange-500" />, tone: "orange" }} />
        <StatCard card={{ label: "Avg. Revenue / User", value: paymentRows.length ? `${(paymentRows.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amountCents, 0) / 100 / paymentRows.length).toFixed(2)} DZD` : "0", icon: <TrendingUp className="h-5 w-5 text-emerald-500" />, tone: "green" }} />
        <StatCard card={{ label: "Conversion Rate", value: `${subscriptions.length ? Math.round((subscriptions.filter((s) => s.status === "ACTIVE").length / subscriptions.length) * 100) : 0}%`, sub: "Free to paid", icon: <MessageCircle className="h-5 w-5 text-indigo-500" />, tone: "purple" }} />
      </div>

      <FilterBar
        placeholder="Search subscriptions by user or email..."
        value={subscriptionQuery}
        onChange={setSubscriptionQuery}
        filters={[
          { label: planFilter === "ALL" ? "All Plans" : planFilter, onClick: cyclePlanFilter },
          { label: statusFilter === "ALL" ? "All Status" : statusFilter, onClick: cycleStatusFilter },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/50">
          <p className="text-sm font-semibold text-slate-900">Plan Pricing</p>
          <p className="text-xs text-slate-600">Manage plan details and pricing</p>
          <div className="mt-4 space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="grid gap-3 rounded-xl border border-slate-100 p-4 shadow-sm md:grid-cols-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{p.plan}</p>
                  <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>
                </div>
                <input
                  type="number"
                  defaultValue={p.priceCents}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
                  onBlur={(e) => onUpdatePlan(p, { priceCents: Number(e.target.value) })}
                />
                <textarea
                  defaultValue={p.description ?? ""}
                  rows={2}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
                  onBlur={(e) => onUpdatePlan(p, { description: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/50">
          <p className="text-sm font-semibold text-slate-900">Upgrade Subscription</p>
          <p className="text-xs text-slate-600">Manually adjust user plan or role</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              value={upgradePayload.userId}
              id="upgrade-user-id"
              onChange={(e) => setUpgradePayload((prev) => ({ ...prev, userId: e.target.value }))}
              placeholder="User ID"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
            />
            <select
              value={upgradePayload.plan}
              onChange={(e) => setUpgradePayload((prev) => ({ ...prev, plan: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
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
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
            />
            <input
              type="date"
              value={upgradePayload.expiresAt}
              onChange={(e) => setUpgradePayload((prev) => ({ ...prev, expiresAt: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
            />
            <select
              value={upgradePayload.role}
              onChange={(e) => setUpgradePayload((prev) => ({ ...prev, role: e.target.value }))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
            >
              <option value="">Keep current role</option>
              <option value="ADMIN">Admin</option>
              <option value="RESTAURANT_OWNER">Restaurant Owner</option>
              <option value="USER">User</option>
            </select>
            <button
              onClick={onUpgrade}
              disabled={actionLoading === "upgrade-sub"}
              className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-60"
            >
              {actionLoading === "upgrade-sub" ? "Updating..." : "Upgrade / Save"}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">Active Subscriptions</h3>
          <p className="text-sm text-slate-600">All subscription details and billing information</p>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="hidden grid-cols-12 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid sm:px-6">
            <span className="col-span-3">User</span>
            <span className="col-span-2">Plan</span>
            <span className="col-span-2">Amount</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Next Billing</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>
          {loading && <div className="px-4 py-8 text-center text-sm text-slate-600 sm:px-6">Loading subscriptions...</div>}
          {!loading &&
            filteredSubs.map((s) => (
              <div key={s.id} className="grid grid-cols-1 gap-3 px-4 py-4 text-sm sm:grid-cols-12 sm:items-center sm:px-6 sm:py-3">
                <div className="col-span-1 sm:col-span-3">
                  <div className="font-semibold text-slate-900">{s.user?.name ?? s.userId}</div>
                  <div className="text-xs text-slate-600">{s.user?.email}</div>
                </div>
                <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                  <span className="text-xs text-slate-500 sm:hidden">Plan:</span>
                  <Badge tone="muted">{s.plan}</Badge>
                </div>
                <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                  <span className="text-xs text-slate-500 sm:hidden">Amount:</span>
                  <span className="text-slate-800">
                    {s.priceCents ? `${(s.priceCents / 100).toLocaleString()} ${s.currency ?? ""}` : "—"}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                  <span className="text-xs text-slate-500 sm:hidden">Status:</span>
                  <Badge tone={s.status === "ACTIVE" ? "success" : s.status === "CANCELED" ? "danger" : "muted"}>{s.status}</Badge>
                </div>
                <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                  <span className="text-xs text-slate-500 sm:hidden">Next Billing:</span>
                  <span className="text-slate-800">
                    {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end sm:col-span-1">
                  <button
                    onClick={() => onShowSubscription(s)}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">Expired / Canceled</h3>
          <p className="text-sm text-slate-600">Follow up with users whose subscriptions need attention</p>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="hidden grid-cols-12 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid sm:px-6">
            <span className="col-span-3">User</span>
            <span className="col-span-2">Plan</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-3">Expires</span>
            <span className="col-span-2 text-right">Action</span>
          </div>
          {subscriptions
            .filter((s) => s.status !== "ACTIVE")
            .map((s) => (
              <div key={s.id} className="grid grid-cols-1 gap-3 px-4 py-4 text-sm sm:grid-cols-12 sm:items-center sm:px-6 sm:py-3">
                <div className="col-span-1 sm:col-span-3">
                  <div className="font-semibold text-slate-900">{s.user?.name ?? s.userId}</div>
                  <div className="text-xs text-slate-600">{s.user?.email}</div>
                </div>
                <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                  <span className="text-xs text-slate-500 sm:hidden">Plan:</span>
                  <Badge tone="muted">{s.plan}</Badge>
                </div>
                <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                  <span className="text-xs text-slate-500 sm:hidden">Status:</span>
                  <Badge tone="danger">{s.status}</Badge>
                </div>
                <div className="col-span-1 flex items-center justify-between sm:col-span-3 sm:block">
                  <span className="text-xs text-slate-500 sm:hidden">Expires:</span>
                  <span className="text-slate-800">
                    {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "—"}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-end sm:col-span-2">
                  <button
                    onClick={() => reachOut(s.user?.email)}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Reach out
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">Payments</h3>
          <p className="text-sm text-slate-600">Subscription payments and invoices</p>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="hidden grid-cols-12 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid sm:px-6">
            <span className="col-span-3">User</span>
            <span className="col-span-2">Subscription</span>
            <span className="col-span-2">Amount</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-1 text-right">Actions</span>
          </div>
          {loading && <div className="px-4 py-8 text-center text-sm text-slate-600 sm:px-6">Loading payments...</div>}
          {!loading &&
            paymentRows.map((p) => (
              <div key={p.id} className="grid grid-cols-1 gap-3 px-4 py-4 text-sm sm:grid-cols-12 sm:items-center sm:px-6 sm:py-3">
                <div className="col-span-1 sm:col-span-3">
                  <div className="font-semibold text-slate-900">{p.user?.name ?? p.userId}</div>
                  <div className="text-xs text-slate-600">{p.user?.email}</div>
                </div>
                <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                  <span className="text-xs text-slate-500 sm:hidden">Subscription:</span>
                  <span className="text-slate-800">{p.subscription?.plan ?? "—"}</span>
                </div>
                <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                  <span className="text-xs text-slate-500 sm:hidden">Amount:</span>
                  <span className="text-slate-800">
                    {(p.amountCents / 100).toLocaleString()} {p.currency}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                  <span className="text-xs text-slate-500 sm:hidden">Status:</span>
                  <Badge tone={p.status === "PAID" ? "success" : "danger"}>{p.status}</Badge>
                </div>
                <div className="col-span-1 flex items-center justify-between sm:col-span-2 sm:block">
                  <span className="text-xs text-slate-500 sm:hidden">Date:</span>
                  <span className="text-slate-800">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="col-span-1 flex items-center justify-end sm:col-span-1">
                  <button
                    onClick={() => onShowPayment(p)}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View
                  </button>
                </div>
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
  onExport,
}: {
  analytics: AnalyticsSummary | null;
  totals: ReturnType<typeof computeDummy>;
  payments: PaymentRow[];
  subscriptions: SubscriptionRow[];
  loading: boolean;
  onExport: () => void;
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
      <SectionHeading
        title="Platform Analytics"
        subtitle="Comprehensive platform performance metrics and insights"
        actions={
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200"
          >
            <Download className="h-4 w-4 text-orange-500" />
            Download
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard card={{ label: "Total Users", value: totals.totalUsers.toLocaleString(), sub: `${totals.activeUsers} active`, icon: <Users className="h-5 w-5 text-orange-500" />, tone: "red" }} />
        <StatCard card={{ label: "Total Restaurants", value: totals.totalRestaurants.toLocaleString(), icon: <UtensilsCrossed className="h-5 w-5 text-emerald-500" />, tone: "green" }} />
        <StatCard card={{ label: "QR Code Scans", value: totals.totalScans.toLocaleString(), icon: <QrCode className="h-5 w-5 text-purple-500" />, tone: "purple" }} />
        <StatCard card={{ label: "Total Revenue", value: `${(totals.revenueCents / 100).toLocaleString()} DZD`, icon: <DollarSign className="h-5 w-5 text-orange-500" />, tone: "orange" }} />
        <StatCard card={{ label: "Active Subscriptions", value: totals.activeSubscriptions.toString(), icon: <ShieldCheck className="h-5 w-5 text-blue-500" />, tone: "blue" }} />
        <StatCard card={{ label: "Feedback", value: totals.totalFeedback.toString(), icon: <MessageCircle className="h-5 w-5 text-indigo-500" />, tone: "blue" }} />
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
  feedbackStatuses,
  onChangeStatus,
  limit,
  onLoadMore,
  onShowFeedback,
  supportAnchorId,
}: {
  feedback: Feedback[];
  totals: ReturnType<typeof computeDummy>;
  loading: boolean;
  tickets: SupportTicket[];
  onRespond: (t: SupportTicket, response: string) => Promise<void>;
  actionLoading: string | null;
  onExport: () => Promise<void> | void;
  feedbackQuery: string;
  setFeedbackQuery: React.Dispatch<React.SetStateAction<string>>;
  feedbackStatuses: Record<string, FeedbackState>;
  onChangeStatus: (id: string, status: FeedbackState) => void;
  limit: number;
  onLoadMore: () => void;
  onShowFeedback: (f: Feedback) => void;
  supportAnchorId?: string;
}) {
  const [ratingFilter, setRatingFilter] = useState<"ALL" | "4_PLUS" | "3_PLUS" | "LOW">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | FeedbackState>("ALL");
  const filtered = feedback.filter((f) => {
    const q = feedbackQuery.toLowerCase();
    const status = feedbackStatuses[f.id] ?? deriveFeedbackState(f);
    const statusMatch = statusFilter === "ALL" || status === statusFilter;
    const ratingMatch =
      ratingFilter === "ALL" ||
      (ratingFilter === "4_PLUS" && f.rating >= 4) ||
      (ratingFilter === "3_PLUS" && f.rating >= 3) ||
      (ratingFilter === "LOW" && f.rating <= 2);
    return (
      f.userName.toLowerCase().includes(q) ||
      (f.profile?.name?.toLowerCase().includes(q) ?? false) ||
      (f.comment?.toLowerCase().includes(q) ?? false)
    ) && statusMatch && ratingMatch;
  });
  const visible = filtered.slice(0, limit);
  const helpfulVotes = feedback.reduce((sum, f) => sum + Math.max(1, f.rating * 3), 0);

  const cycleRatingFilter = () => {
    const options: typeof ratingFilter[] = ["ALL", "4_PLUS", "3_PLUS", "LOW"];
    const nextIndex = (options.indexOf(ratingFilter) + 1) % options.length;
    setRatingFilter(options[nextIndex]);
  };

  const cycleStatusFilter = () => {
    const options: typeof statusFilter[] = ["ALL", "Published", "Pending", "Flagged", "Removed"];
    const nextIndex = (options.indexOf(statusFilter) + 1) % options.length;
    setStatusFilter(options[nextIndex] as typeof statusFilter);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        title="All Feedback"
        subtitle="Monitor and manage customer feedback across all restaurants"
        actions={
          <button
            onClick={onExport}
            disabled={actionLoading === "export"}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard card={{ label: "Total Feedback", value: totals.totalFeedback.toLocaleString(), icon: <MessageCircle className="h-5 w-5 text-blue-500" />, tone: "blue" }} />
        <StatCard card={{ label: "Avg. Rating", value: `${totals.avgRating.toFixed(1)}/5`, icon: <Star className="h-5 w-5 text-amber-500" />, tone: "orange" }} />
        <StatCard card={{ label: "Profiles", value: totals.totalRestaurants.toLocaleString(), icon: <UtensilsCrossed className="h-5 w-5 text-emerald-500" />, tone: "green" }} />
        <StatCard card={{ label: "Helpful Votes", value: helpfulVotes.toLocaleString(), icon: <ThumbsUp className="h-5 w-5 text-emerald-500" />, tone: "green" }} />
      </div>

      <FilterBar
        placeholder="Search feedback by customer, restaurant, or content..."
        value={feedbackQuery}
        onChange={setFeedbackQuery}
        filters={[
          {
            label:
              ratingFilter === "ALL"
                ? "All Ratings"
                : ratingFilter === "4_PLUS"
                  ? "4+ stars"
                  : ratingFilter === "3_PLUS"
                    ? "3+ stars"
                    : "Low ratings",
            onClick: cycleRatingFilter,
          },
          { label: statusFilter === "ALL" ? "All Status" : statusFilter, onClick: cycleStatusFilter },
        ]}
      />

      <div className="space-y-4">
        {loading && <div className="rounded-3xl border border-slate-100 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">Loading feedback...</div>}
        {!loading &&
          visible.map((f) => {
            const status = feedbackStatuses[f.id] ?? deriveFeedbackState(f);
            const helpful = Math.max(1, f.rating * 3);
            const tone = status === "Published" ? "success" : status === "Pending" ? "muted" : "danger";
            return (
              <div key={f.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-semibold text-slate-900">{f.userName}</div>
                    <div className="text-xs text-slate-600">{f.profile?.name ?? "Unknown restaurant"}</div>
                    <div className="mt-2 flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < f.rating ? "" : "text-gray-300"}`} fill={i < f.rating ? "#f59e0b" : "none"} />
                      ))}
                      <span className="ml-1 text-xs text-slate-700">{f.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={tone}>{status}</Badge>
                    <span className="text-sm text-slate-600">{new Date(f.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-800 line-clamp-3">{f.comment}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{helpful} found this helpful</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => onShowFeedback(f)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                    >
                      View Details
                    </button>
                    {status === "Pending" && (
                      <>
                        <button
                          onClick={() => onChangeStatus(f.id, "Removed")}
                          className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-50 hover:shadow-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => onChangeStatus(f.id, "Published")}
                          className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                          Approve
                        </button>
                      </>
                    )}
                    {status === "Flagged" && (
                      <>
                        <button
                          onClick={() => onChangeStatus(f.id, "Removed")}
                          className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-50 hover:shadow-sm"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => onChangeStatus(f.id, "Pending")}
                          className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-50 hover:shadow-sm"
                        >
                          Review
                        </button>
                      </>
                    )}
                    {status === "Published" && (
                      <button
                        onClick={() => onChangeStatus(f.id, "Flagged")}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                      >
                        Flag
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onLoadMore}
          disabled={visible.length >= filtered.length}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {visible.length >= filtered.length ? "All feedback loaded" : "Load More Feedback"}
        </button>
      </div>

      <div className="space-y-3 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/50" id={supportAnchorId}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Support Tickets</p>
            <p className="text-xs text-slate-600">Respond to user messages quickly</p>
          </div>
        </div>
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{t.subject}</p>
                  <p className="text-xs text-slate-600">{t.user?.email}</p>
                  <p className="mt-1 text-sm text-slate-800 line-clamp-2">{t.message}</p>
                </div>
                <Badge tone={t.status === "RESOLVED" ? "success" : "muted"}>{t.status}</Badge>
              </div>
              {t.response ? (
                <p className="mt-2 text-sm text-slate-700">Response: {t.response}</p>
              ) : (
                <form
                  className="mt-3 flex flex-col gap-2 md:flex-row"
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
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
                    placeholder="Write a reply..."
                  />
                  <button
                    type="submit"
                    disabled={actionLoading === `ticket-${t.id}`}
                    className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-60"
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

function StatCard({ card }: { card: { label: string; value: string; sub?: string; icon?: JSX.Element; tone?: "red" | "blue" | "green" | "orange" | "purple" | "slate" } }) {
  const palette: Record<NonNullable<typeof card.tone>, string> = {
    red: "from-orange-500/20 to-orange-500/5 text-orange-600",
    blue: "from-blue-500/20 to-blue-500/5 text-blue-600",
    green: "from-emerald-500/20 to-emerald-500/5 text-emerald-600",
    orange: "from-orange-500/20 to-orange-500/5 text-orange-600",
    purple: "from-purple-500/20 to-purple-500/5 text-purple-600",
    slate: "from-slate-500/20 to-slate-500/5 text-slate-600",
  };
  const tone = card.tone ?? "slate";
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/50 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          {card.sub && <p className={`mt-1 text-xs font-semibold ${tone === "red" ? "text-orange-600" : "text-emerald-600"}`}>{card.sub}</p>}
        </div>
        {card.icon && (
          <div className={`rounded-2xl bg-gradient-to-br ${palette[tone]} p-3`}>{card.icon}</div>
        )}
      </div>
    </div>
  );
}

function FilterBar({
  placeholder,
  value,
  onChange,
  filters,
}: {
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
  filters?: { label: string; onClick?: () => void }[];
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:px-6 sm:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-500 transition-all duration-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-400/20">
        <Search className="h-4 w-4 flex-shrink-0" />
        <input
          className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
        {(filters ?? [{ label: "All Filters" }, { label: "All Status" }]).map((filter) => (
          <button
            key={filter.label}
            onClick={filter.onClick}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
          >
            <Filter className="h-4 w-4 text-orange-500" />
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, data, loading }: { title: string; subtitle: string; data?: { date: string; scans: number }[]; loading: boolean }) {
  const bars = (data || []).slice(-10);
  const max = bars.reduce((m, b) => Math.max(m, b.scans), 0) || 1;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-600">{subtitle}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Trend</span>
      </div>
      <div className="mt-4 h-48 rounded-xl bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {loading && <div className="flex h-full items-center justify-center text-sm text-slate-600">Loading...</div>}
        {!loading && (
          <div className="flex h-full items-end justify-between gap-2 px-2 pb-2">
            {bars.map((b) => (
              <div
                key={b.date}
                className="w-full rounded-t-xl bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-300 hover:from-orange-600 hover:to-orange-500"
                style={{ height: `${(b.scans / max) * 100 || 5}%` }}
                title={`${new Date(b.date).toLocaleDateString()}: ${b.scans}`}
              />
            ))}
            {bars.length === 0 && <div className="flex h-full w-full items-center justify-center text-sm text-slate-600">No data</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeading({ title, subtitle, actions }: { title: string; subtitle: string; actions?: JSX.Element }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
        <p className="text-sm text-slate-600">{subtitle}</p>
      </div>
      {actions}
    </header>
  );
}

function Badge({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "success" | "danger" }) {
  const map: Record<typeof tone, string> = {
    muted: "bg-slate-100 text-slate-800",
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-orange-100 text-orange-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}>{children}</span>;
}

function DetailsDrawer({ item, onClose }: { item: DetailItem; onClose: () => void }) {
  const renderContent = () => {
    if (item.type === "feedback") {
      const f = item.data;
      return (
        <div className="space-y-3 text-sm text-slate-800">
          <div>
            <p className="font-semibold text-slate-900">{f.userName}</p>
            <p className="text-xs text-slate-600">{f.profile?.name ?? "Unknown restaurant"}</p>
          </div>
          <div className="flex items-center gap-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < f.rating ? "" : "text-gray-300"}`} fill={i < f.rating ? "#f59e0b" : "none"} />
            ))}
            <span className="ml-1 text-sm text-slate-700">{f.rating}/5</span>
          </div>
          <p className="text-sm">{f.comment}</p>
          <p className="text-xs text-slate-600">Created: {new Date(f.createdAt).toLocaleString()}</p>
        </div>
      );
    }
    if (item.type === "subscription") {
      const s = item.data;
      return (
        <div className="space-y-3 text-sm text-slate-800">
          <div>
            <p className="font-semibold text-slate-900">{s.user?.name ?? s.userId}</p>
            <p className="text-xs text-slate-600">{s.user?.email}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Plan</p>
              <p>{s.plan}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <Badge tone={s.status === "ACTIVE" ? "success" : s.status === "CANCELED" ? "danger" : "muted"}>{s.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500">Price</p>
              <p>{s.priceCents ? `${(s.priceCents / 100).toLocaleString()} ${s.currency ?? "USD"}` : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Expires</p>
              <p>{s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        </div>
      );
    }
    if (item.type === "payment") {
      const p = item.data;
      return (
        <div className="space-y-3 text-sm text-slate-800">
          <div>
            <p className="font-semibold text-slate-900">{p.user?.name ?? p.userId}</p>
            <p className="text-xs text-slate-600">{p.user?.email}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Amount</p>
              <p>{(p.amountCents / 100).toLocaleString()} {p.currency}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <Badge tone={p.status === "PAID" ? "success" : "danger"}>{p.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500">Reference</p>
              <p>{p.reference ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Date</p>
              <p>{new Date(p.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      );
    }
    if (item.type === "profile") {
      const p = item.data;
      return (
        <div className="space-y-3 text-sm text-slate-800">
          <div>
            <p className="font-semibold text-slate-900">{p.name}</p>
            <p className="text-xs text-slate-600">Owner: {p.owner?.email ?? "Unassigned"}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <Badge tone={p.status === "ACTIVE" ? "success" : p.status === "SUSPENDED" ? "danger" : "muted"}>{p.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500">Menus</p>
              <p>{p.stats?.menus ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Items</p>
              <p>{p.stats?.items ?? 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Scans</p>
              <p>{p.stats?.scanRecords ?? 0}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500">Created</p>
            <p>{new Date(p.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      );
    }
    if (item.type === "user") {
      const u = item.data;
      return (
        <div className="space-y-3 text-sm text-slate-800">
          <div>
            <p className="font-semibold text-slate-900">{u.name}</p>
            <p className="text-xs text-slate-600">{u.email}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Role</p>
              <p>{u.role}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <Badge tone={u.isActive ? "success" : "danger"}>{u.isActive ? "Active" : "Suspended"}</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-500">Profiles</p>
              <p>{u.profileCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Joined</p>
              <p>{new Date(u.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      );
    }
    if (item.type === "ticket") {
      const t = item.data;
      return (
        <div className="space-y-3 text-sm text-slate-800">
          <div>
            <p className="font-semibold text-slate-900">{t.subject}</p>
            <p className="text-xs text-slate-600">{t.user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Message</p>
            <p className="mt-1">{t.message}</p>
          </div>
          {t.response && (
            <div>
              <p className="text-xs text-slate-500">Response</p>
              <p className="mt-1 text-slate-700">{t.response}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-6 transition-opacity duration-300 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl transition-transform duration-300 sm:scale-100">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
          <p className="text-sm font-semibold text-slate-900">Details</p>
          <button onClick={onClose} className="rounded-full p-2 text-slate-600 transition-all duration-200 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-4 py-4 sm:px-6">{renderContent()}</div>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const letter = name?.charAt(0).toUpperCase() || "?";
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-700">
      {letter}
    </div>
  );
}

function deriveFeedbackState(f: Feedback): FeedbackState {
  if (f.rating <= 2) return "Flagged";
  if (f.rating === 3) return "Pending";
  return "Published";
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