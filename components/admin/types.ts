export type AuthTokens = { accessToken: string; refreshToken: string };
export type AuthUser = { id?: string; email?: string; role?: string; name?: string };

export type Profile = {
  id: string;
  name: string;
  status: string;
  description: string | null;
  owner: { id: string; name: string; email: string; role: string } | null;
  stats: { menus: number; feedbacks: number; items: number; scanRecords: number };
  createdAt: string;
};

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  profileCount: number;
  createdAt: string;
};

export type SubscriptionRow = {
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

export type PaymentRow = {
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

export type PlanCatalog = {
  id: string;
  plan: string;
  priceCents: number;
  currency: string;
  description: string | null;
};

export type Feedback = {
  id: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  profile: { id: string; name: string } | null;
};

export type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
  user: { id: string; email: string; name: string };
};

export type FeedbackState = "Published" | "Pending" | "Flagged" | "Removed";

export type DetailItem =
  | { type: "feedback"; data: Feedback }
  | { type: "subscription"; data: SubscriptionRow }
  | { type: "payment"; data: PaymentRow }
  | { type: "profile"; data: Profile }
  | { type: "user"; data: UserRow }
  | { type: "ticket"; data: SupportTicket };

export type AnalyticsSummary = {
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

export type Totals = {
  totalUsers: number;
  activeUsers: number;
  totalRestaurants: number;
  activeRestaurants: number;
  totalScans: number;
  activeSubscriptions: number;
  revenueCents: number;
  avgRating: number;
  totalFeedback: number;
};
