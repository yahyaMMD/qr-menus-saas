export interface Feedback {
  id: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO string or date-like
}

export interface FeedbackSummary {
  averageRating: number;
  totalReviews: number;
}
