import { Feedback } from "./feedback.types";

export const initialFeedbacks: Feedback[] = [
  {
    id: "1",
    userName: "Sarah Johnson",
    rating: 5,
    comment:
      "Amazing food and great service! The vegan options are fantastic.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "2",
    userName: "Mohammed Ali",
    rating: 4,
    comment:
      "Excellent pizza and the atmosphere is very nice. Will come again!",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "3",
    userName: "Fatima Zahra",
    rating: 5,
    comment:
      "Best restaurant in town! The seafood is always fresh and delicious.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
  },
];

export function computeSummary(feedbacks: Feedback[]) {
  if (feedbacks.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }
  const total = feedbacks.reduce((sum, f) => sum + f.rating, 0);
  const avg = total / feedbacks.length;
  return {
    averageRating: parseFloat(avg.toFixed(1)),
    totalReviews: feedbacks.length,
  };
}
