"use client";

import React, { useMemo, useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { Feedback } from "./feedback.types";
import { initialFeedbacks, computeSummary } from "./feedback.mock";
import StarRating from "./components/StarRating";
import FeedbackModal from "./components/FeedbackModal";

function formatRelative(dateStr: string) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const summary = useMemo(() => computeSummary(feedbacks), [feedbacks]);

  const handleAddFeedback = (data: {
    userName: string;
    rating: number;
    comment: string;
  }) => {
    const newFeedback: Feedback = {
      id: crypto.randomUUID(),
      userName: data.userName,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };

    setFeedbacks((prev) => [newFeedback, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar (mobile style) */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => history.back()}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900">
              Restaurant Demo
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Customer Feedback
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
        {/* Summary card */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-5 sm:mb-6">
          <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="text-5xl sm:text-6xl font-semibold text-gray-900">
              {summary.averageRating.toFixed(1)}
            </div>
            <StarRating value={Math.round(summary.averageRating)} />
            <p className="text-xs sm:text-sm text-gray-500">
              Based on {summary.totalReviews}{" "}
              {summary.totalReviews === 1 ? "review" : "reviews"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-5 w-full flex items-center justify-center gap-2 rounded-full bg-orange-500 text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base hover:bg-orange-600"
          >
            <span className="text-sm sm:text-base">Leave Your Feedback</span>
          </button>
        </section>

        {/* Recent Reviews */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
            Recent Reviews
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {feedbacks.map((fb) => (
              <article
                key={fb.id}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-5 flex gap-3 sm:gap-4"
              >
                {/* Avatar circle with initials */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-100 flex items-center justify-center text-sm sm:text-base font-semibold text-orange-600">
                    {fb.userName
                      .split(" ")
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                      {fb.userName}
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                      {formatRelative(fb.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={16}
                        className={
                          star <= fb.rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-200"
                        }
                      />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-700 leading-snug">
                    {fb.comment}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddFeedback}
      />
    </div>
  );
};

export default FeedbackPage;
