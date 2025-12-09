import { JSX, ReactNode, useMemo, useState, Dispatch, SetStateAction, useEffect } from "react";
import {
  BellDot,
  DollarSign,
  Download,
  Eye,
  Filter,
  MessageCircle,
  MoreHorizontal,
  QrCode,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  TicketCheck,
  ThumbsUp,
  TrendingUp,
  UserRoundPlus,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import {
  AnalyticsSummary,
  DetailItem,
  Feedback,
  FeedbackState,
  PaymentRow,
  PlanCatalog,
  Profile,
  SubscriptionRow,
  SupportTicket,
  Totals,
  UserRow,
} from "./types";
import { deriveFeedbackState } from "./helpers";

type UpgradePayload = {
  userId: string;
  plan: string;
  expiresAt: string;
  priceCents: number;
  currency: string;
  role: string;
};

export function DashboardSection({
  totals,
  analytics,
  loading,
  onExport,
  onSupport,
  onQuickAction,
}: {
  totals: Totals;
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

export function UsersSection({
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
  setUserQuery: Dispatch<SetStateAction<string>>;
  newUser: { name: string; email: string; password: string; role: string };
  setNewUser: Dispatch<SetStateAction<{ name: string; email: string; password: string; role: string }>>;
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
      (u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)) &&
      statusMatch &&
      roleMatch
    );
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

export function RestaurantsSection({
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
  setRestaurantQuery: Dispatch<SetStateAction<string>>;
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
      (p.name.toLowerCase().includes(q) ||
        (p.owner?.name?.toLowerCase().includes(q) ?? false) ||
        (p.owner?.email?.toLowerCase().includes(q) ?? false)) &&
      statusMatch &&
      ownerMatch
    );
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

export function SubscriptionsSection({
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
  users,
}: {
  plans: PlanCatalog[];
  subscriptions: SubscriptionRow[];
  payments: PaymentRow[];
  loading: boolean;
  onUpdatePlan: (plan: PlanCatalog, updates: Partial<PlanCatalog>) => Promise<void>;
  onUpgrade: () => Promise<void>;
  upgradePayload: UpgradePayload;
  setUpgradePayload: Dispatch<SetStateAction<UpgradePayload>>;
  users: UserRow[];
  actionLoading: string | null;
  subscriptionQuery: string;
  setSubscriptionQuery: Dispatch<SetStateAction<string>>;
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
  const [userSearch, setUserSearch] = useState("");

  const filteredSubs = subscriptions.filter((s) => {
    const q = subscriptionQuery.toLowerCase();
    const planMatch = planFilter === "ALL" || s.plan === planFilter;
    const statusMatch = statusFilter === "ALL" || s.status === statusFilter;
    return (
      (s.user?.name?.toLowerCase().includes(q) ||
        s.user?.email?.toLowerCase().includes(q) ||
        s.plan.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q)) &&
      planMatch &&
      statusMatch
    );
  });

  const filteredCount = filteredSubs.length;
  const totalSubs = subscriptions.length;
  const [planEdits, setPlanEdits] = useState<Record<string, { priceCents: number; description: string }>>({});

  useEffect(() => {
    const next: Record<string, { priceCents: number; description: string }> = {};
    plans.forEach((p) => {
      next[p.id] = { priceCents: p.priceCents, description: p.description ?? "" };
    });
    setPlanEdits(next);
  }, [plans]);

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
  const matchedUsers = useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    if (!q) return [];
    return users.filter((u) => u.email.toLowerCase().includes(q)).slice(0, 5);
  }, [users, userSearch]);

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
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-100">
                Plan Pricing
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-900">Review and confirm updates before saving</p>
              <p className="text-xs text-slate-600">Edit price and copy, then press Save changes to apply.</p>
            </div>
            <Badge tone="muted">{plans.length} plans</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {plans.map((p) => (
              <div key={p.id} className="grid gap-4 rounded-2xl border border-slate-100 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{p.plan}</p>
                  <p className="text-xs text-slate-500 line-clamp-2">{p.description || "Add a description to clarify value"}</p>
                </div>
                <label className="space-y-1 text-xs font-semibold text-slate-600">
                  Price (cents)
                  <input
                    type="number"
                    value={planEdits[p.id]?.priceCents ?? p.priceCents}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
                    onChange={(e) =>
                      setPlanEdits((prev) => ({
                        ...prev,
                        [p.id]: { ...(prev[p.id] ?? { priceCents: p.priceCents, description: p.description ?? "" }), priceCents: Number(e.target.value) },
                      }))
                    }
                  />
                </label>
                <label className="space-y-1 text-xs font-semibold text-slate-600 md:col-span-1">
                  Description
                  <textarea
                    value={planEdits[p.id]?.description ?? p.description ?? ""}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
                    onChange={(e) =>
                      setPlanEdits((prev) => ({
                        ...prev,
                        [p.id]: { ...(prev[p.id] ?? { priceCents: p.priceCents, description: p.description ?? "" }), description: e.target.value },
                      }))
                    }
                  />
                </label>
                <div className="flex items-end justify-end md:col-span-3">
                  <button
                    onClick={() =>
                      onUpdatePlan(p, {
                        priceCents: planEdits[p.id]?.priceCents ?? p.priceCents,
                        description: planEdits[p.id]?.description ?? p.description ?? "",
                        currency: p.currency,
                      })
                    }
                    disabled={
                      actionLoading === `plan-${p.plan}` ||
                      ((planEdits[p.id]?.priceCents ?? p.priceCents) === p.priceCents &&
                        (planEdits[p.id]?.description ?? p.description ?? "") === (p.description ?? ""))
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-orange-400/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
                  >
                    {actionLoading === `plan-${p.plan}` ? "Saving..." : "Save changes"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-6 shadow-sm shadow-orange-100/60">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Upgrade Subscription</p>
              <p className="text-xs text-slate-600">Search by email, confirm user ID, choose plan</p>
            </div>
            {upgradePayload.userId && (
              <Badge tone="success">User selected</Badge>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by email"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20"
              />
              {userSearch && matchedUsers.length > 0 && (
                <div className="mt-2 max-h-52 overflow-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
                  {matchedUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setUpgradePayload((prev) => ({ ...prev, userId: u.id, role: u.role }));
                        setUserSearch(u.email);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-orange-50"
                    >
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                      <p className="text-[11px] text-slate-500">Role: {u.role}</p>
                    </button>
                  ))}
                </div>
              )}
              {userSearch && matchedUsers.length === 0 && (
                <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                  No users matched that email. Try another address or paste the user ID directly.
                </div>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
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
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-500">
              Tip: Uses current pricing; only email, user ID, and plan are required.
            </div>
            <button
              onClick={onUpgrade}
              disabled={actionLoading === "upgrade-sub"}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40 disabled:opacity-60"
            >
              {actionLoading === "upgrade-sub" ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Upgrade / Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/50">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-slate-900">Active Subscriptions</h3>
          <p className="text-sm text-slate-600">All subscription details and billing information</p>
          <p className="text-xs text-slate-500 mt-1">
            Showing {filteredCount} of {totalSubs} subscriptions
          </p>
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

export function AnalyticsSection({
  analytics,
  totals,
  payments,
  subscriptions,
  loading,
  onExport,
}: {
  analytics: AnalyticsSummary | null;
  totals: Totals;
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

export function FeedbackSection({
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
  totals: Totals;
  loading: boolean;
  tickets: SupportTicket[];
  onRespond: (t: SupportTicket, response: string) => Promise<void>;
  actionLoading: string | null;
  onExport: () => Promise<void> | void;
  feedbackQuery: string;
  setFeedbackQuery: Dispatch<SetStateAction<string>>;
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
      (f.userName.toLowerCase().includes(q) ||
        (f.profile?.name?.toLowerCase().includes(q) ?? false) ||
        (f.comment?.toLowerCase().includes(q) ?? false)) &&
      statusMatch &&
      ratingMatch
    );
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
                  <div className="min-w-[200px] flex-1">
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

export function StatCard({ card }: { card: { label: string; value: string; sub?: string; icon?: JSX.Element; tone?: "red" | "blue" | "green" | "orange" | "purple" | "slate" } }) {
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

export function FilterBar({
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

export function ChartCard({ title, subtitle, data, loading }: { title: string; subtitle: string; data?: { date: string; scans: number }[]; loading: boolean }) {
  const hasData = Array.isArray(data) && data.length > 0;
  const bars = hasData ? data.slice(-10) : [];
  const max = bars.reduce((m, b) => Math.max(m, b.scans), 0) || 1;
  const last = bars[bars.length - 1]?.scans ?? 0;
  const prev = bars[bars.length - 2]?.scans ?? 0;
  const delta = prev ? ((last - prev) / prev) * 100 : 0;
  const labelFor = (idx: number) => {
    if (!bars.length) return "";
    if (idx === 0) return new Date(bars[0].date).toLocaleDateString();
    if (idx === bars.length - 1) return new Date(bars[bars.length - 1].date).toLocaleDateString();
    const mid = bars[Math.floor(bars.length / 2)];
    return idx === Math.floor(bars.length / 2) ? new Date(mid.date).toLocaleDateString() : "";
  };
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-600">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          {last.toLocaleString()} ({delta >= 0 ? "+" : ""}
          {delta.toFixed(1)}%)
        </div>
      </div>
      <div className="mt-4 h-52 rounded-xl bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3 shadow-inner">
        {loading && <div className="flex h-full items-center justify-center text-sm text-slate-600">Loading...</div>}
        {!loading && (
          <div className="flex h-full flex-col justify-end gap-3">
            <div className="relative flex flex-1 items-end gap-2">
              <div className="pointer-events-none absolute inset-0 rounded-lg border border-slate-100 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_top,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:14px_14px]"></div>
              {bars.map((b, idx) => {
                const height = Math.max((b.scans / max) * 100, 10);
                return (
                  <div key={b.date} className="group flex-1">
                    <div
                      className="relative w-full rounded-t-lg bg-gradient-to-t from-orange-500 via-orange-400 to-amber-300 shadow-sm shadow-orange-200 transition-all duration-300 group-hover:from-orange-600 group-hover:to-orange-500"
                      style={{ height: `${height}%`, minHeight: "14px" }}
                      title={`${new Date(b.date).toLocaleDateString()}: ${b.scans}`}
                    >
                      <div className="absolute inset-x-0 -top-7 hidden rounded-md bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white group-hover:block">
                        {b.scans.toLocaleString()}
                      </div>
                    </div>
                    <p className="mt-2 text-center text-[11px] text-slate-500">{labelFor(idx)}</p>
                  </div>
                );
              })}
              {!hasData && <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white/60 text-sm font-semibold text-slate-500">No chart data available</div>}
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-sm">
              <span>Max: {hasData ? max.toLocaleString() : "—"}</span>
              <span>Last: {hasData ? last.toLocaleString() : "—"}</span>
              <span>
                Change: {hasData ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%` : "—"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function SectionHeading({ title, subtitle, actions }: { title: string; subtitle: string; actions?: JSX.Element }) {
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

export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "success" | "danger" }) {
  const map: Record<typeof tone, string> = {
    muted: "bg-slate-100 text-slate-800",
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-orange-100 text-orange-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tone]}`}>{children}</span>;
}

export function DetailsDrawer({ item, onClose }: { item: DetailItem; onClose: () => void }) {
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
              <p>
                {(p.amountCents / 100).toLocaleString()} {p.currency}
              </p>
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

export function Avatar({ name }: { name: string }) {
  const letter = name?.charAt(0).toUpperCase() || "?";
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-700">
      {letter}
    </div>
  );
}
