import { Feedback, FeedbackState } from "./types";

export function deriveFeedbackState(f: Feedback): FeedbackState {
  if (f.rating <= 2) return "Flagged";
  if (f.rating === 3) return "Pending";
  return "Published";
}

export function emptyTotals() {
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
