"use client";

import type { JSX } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  LogOut,
  MoreHorizontal,
  QrCode,
  ShieldCheck,
  MessageCircle,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Menu,
} from "lucide-react";
import {
  AuthTokens,
  AuthUser,
  Profile,
  UserRow,
  SubscriptionRow,
  PaymentRow,
  PlanCatalog,
  Feedback,
  SupportTicket,
  FeedbackState,
  DetailItem,
  AnalyticsSummary,
  Totals,
} from "@/components/admin/types";
import { deriveFeedbackState } from "@/components/admin/helpers";
import {
  AnalyticsSection,
  DashboardSection,
  DetailsDrawer,
  FeedbackSection,
  RestaurantsSection,
  SubscriptionsSection,
  UsersSection,
} from "@/components/admin/sections";

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
  const [announcement, setAnnouncement] = useState({ title: "", message: "", link: "" });
  const [emailBlast, setEmailBlast] = useState({ target: "all", email: "", subject: "", message: "" });

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

  const loadData = useCallback(async () => {
    if (!tokens || !user) return;
    if (user.role !== ADMIN_ROLE) {
      router.replace("/");
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
        const refreshToken =
          localStorage.getItem(REFRESH_KEY) ||
          (tokens?.refreshToken ?? null);
        if (refreshToken) {
          try {
            const refreshRes = await fetch("/api/auth?action=refresh", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });
            if (refreshRes.ok) {
              const refreshJson = await refreshRes.json();
              const newTokens = refreshJson.tokens;
              localStorage.setItem(TOKEN_KEY, JSON.stringify(newTokens));
              localStorage.setItem(ACCESS_KEY, newTokens.accessToken);
              localStorage.setItem(REFRESH_KEY, newTokens.refreshToken);
              setTokens(newTokens);
              return await fetch(input, {
                ...init,
                headers: {
                  Authorization: `Bearer ${newTokens.accessToken}`,
                  "Content-Type": "application/json",
                  ...(init?.headers || {}),
                },
              });
            }
          } catch {
            // fall through to logout
          }
        }
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
        setTokens(null);
        setUser(null);
        router.replace("/auth/login");
        throw new Error("Session expired. Please log in again.");
      }
      return res;
    };

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
  }, [tokens, user, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const totals: Totals = useMemo(() => {
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

  const exportFeedbackCsv = () => {
    const header = ["User", "Rating", "Comment", "Profile", "Created"];
    const rows = feedback.map((f) => [
      f.userName,
      String(f.rating),
      f.comment ?? "",
      f.profile?.name ?? "—",
      new Date(f.createdAt).toLocaleDateString(),
    ]);
    downloadCsv([header, ...rows], "feedback.csv");
  };

  const sendAnnouncement = async () => {
    if (!authHeaders) return;
    if (!announcement.title || !announcement.message) {
      setError("Announcement title and message are required");
      return;
    }
    setActionLoading("announcement");
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          title: announcement.title,
          message: announcement.message,
          link: announcement.link || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send announcement");
      setAnnouncement({ title: "", message: "", link: "" });
      alert(`Announcement sent to ${data.sent ?? 0} users.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send announcement");
    } finally {
      setActionLoading(null);
    }
  };

  const sendEmailBlast = async () => {
    if (!authHeaders) return;
    if (!emailBlast.subject || !emailBlast.message) {
      setError("Email subject and message are required");
      return;
    }
    if (emailBlast.target === "single" && !emailBlast.email) {
      setError("Email address is required for single target");
      return;
    }
    setActionLoading("email-blast");
    try {
      const res = await fetch("/api/admin/email", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          target: emailBlast.target,
          email: emailBlast.target === "single" ? emailBlast.email : undefined,
          subject: emailBlast.subject,
          message: emailBlast.message,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to send email");
      setEmailBlast({ target: "all", email: "", subject: "", message: "" });
      alert(`Email sent to ${data.sent ?? 0}/${data.total ?? 0}. Failed: ${data.failed ?? 0}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setActionLoading(null);
    }
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
    router.replace("/auth/login");
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

  const refreshAll = () => {
    loadData();
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

  const reconcileSubscription = async (sub: SubscriptionRow) => {
    if (!authHeaders) return;
    const ref = window.prompt("Enter payment reference to reconcile", sub.paymentRef ?? "");
    if (!ref) return;
    setActionLoading(`reconcile-${sub.id}`);
    try {
      const res = await fetch(`/api/admin/subscriptions/${sub.id}/reconcile`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ paymentRef: ref }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to reconcile subscription");
      setSubscriptions((prev) => prev.map((s) => (s.id === sub.id ? data.subscription : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reconcile subscription");
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
            <div className="pt-4">
              <button
                onClick={refreshAll}
                className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-blue-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <TrendingUp className="h-4 w-4" />
                Refresh data
              </button>
            </div>
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
            <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 text-sm text-orange-700 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">!</div>
                {error}
              </div>
              <button
                onClick={loadData}
                className="rounded-lg border border-orange-300 px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition"
              >
                Retry
              </button>
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
            announcement={announcement}
            setAnnouncement={setAnnouncement}
            onSendAnnouncement={sendAnnouncement}
            actionLoading={actionLoading}
            emailBlast={emailBlast}
            setEmailBlast={setEmailBlast}
            onSendEmail={sendEmailBlast}
            users={users}
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
      onReconcile={reconcileSubscription}
      users={users}
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
              onExport={exportFeedbackCsv}
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
