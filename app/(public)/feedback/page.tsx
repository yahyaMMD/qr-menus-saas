"use client";

import { useState, useEffect } from "react";
import { Star, Send , ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


type FeedbackView = {
  id: string;
  profileId: string;
  userName: string;
  rating: number;
  comment?: string | null;
  createdAt: string; // ISO string
};

import { useSearchParams } from "next/navigation";

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackView[]>([]);
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("profileId") || "";

  // Fetch feedbacks from API
  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    fetch(`/api/feedbacks?profileId=${profileId}`)
      .then((res) => res.json())
      .then((data) => {
        setFeedbacks(data.feedbacks || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load feedbacks");
        setLoading(false);
      });
  }, [profileId]);

  // Submit feedback to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || rating === 0 || !profileId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedbacks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId, userName, rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit feedback");
      }
      // Refetch feedbacks after submit
      fetch(`/api/feedbacks?profileId=${profileId}`)
        .then((res) => res.json())
        .then((data) => {
          setFeedbacks(data.feedbacks || []);
        });
      setUserName("");
      setRating(0);
      setComment("");
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-md px-4 py-6 space-y-6">
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50"
            aria-label="Back to menu"
          >
            <ArrowLeft className="h-4 w-4 text-gray-700" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-gray-900">Feedback</h1>
            <p className="text-xs text-gray-500">
              Share your experience with this restaurant.
            </p>
          </div>
        </header>

        {/* Feedback form */}
        <section className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Leave a review
          </h2>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Your name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className="h-5 w-5"
                      fill={star <= rating ? "#f97316" : "none"}
                      stroke={star <= rating ? "#f97316" : "#9ca3af"}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your feedback..."
                className="w-full min-h-[80px] resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg"
            >
              <Send className="h-4 w-4" />
              Submit feedback
            </button>
          </form>
        </section>

        {/* Existing feedbacks list */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Recent feedback
          </h2>
          {feedbacks.length === 0 && (
            <p className="text-xs text-gray-500">
              No feedback yet. Be the first to review!
            </p>
          )}

          <div className="space-y-3">
            {feedbacks.map((fb) => (
              <article
                key={fb.id}
                className="rounded-2xl bg-white p-3 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    {fb.userName}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-3 w-3"
                      fill={star <= fb.rating ? "#f97316" : "none"}
                      stroke={star <= fb.rating ? "#f97316" : "#d1d5db"}
                    />
                  ))}
                </div>
                {fb.comment && (
                  <p className="mt-2 text-xs text-gray-600">
                    {fb.comment}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
