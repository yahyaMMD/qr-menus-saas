"use client";

import React, { useState } from "react";
import InteractiveStars from "./InteractiveStars";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { userName: string; rating: number; comment: string }) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [userName, setUserName] = useState("");
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !userName.trim()) return;

    onSubmit({
      rating,
      userName: userName.trim(),
      comment: comment.trim(),
    });

    setRating(0);
    setUserName("");
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
          Share Your Experience
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Rating
            </label>
            <InteractiveStars value={rating} onChange={setRating} />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your Feedback
            </label>
            <textarea
              rows={4}
              placeholder="Tell us about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-medium text-sm sm:text-base hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-orange-500 text-white font-semibold text-sm sm:text-base hover:bg-orange-600 disabled:opacity-60"
              disabled={!rating || !userName.trim()}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
