"use client";

import { X, Star } from "lucide-react";
import { ItemView } from "../types";

type Props = {
  item: ItemView | null;
  onClose: () => void;
  onGiveFeedback: () => void;
};

export function ItemModal({ item, onClose, onGiveFeedback }: Props) {
  if (!item) return null;

  const isPromo = item.isPromotion && item.originalPrice;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-md animate-slide-up rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="relative max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur hover:bg-white transition-all"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>

          {item.image && (
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="h-64 w-full object-cover sm:rounded-t-3xl"
              />
              {isPromo && (
                <span className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                  🔥 Special Offer
                </span>
              )}
            </div>
          )}

          <div className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="mb-2 text-2xl font-bold text-gray-900">
                  {item.name}
                </h2>
                {item.description && (
                  <p className="text-sm leading-relaxed text-gray-600">
                    {item.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-3 border-y border-gray-100 py-3">
              <span className="text-3xl font-bold text-orange-600">
                {item.price.toFixed(2)} DZD
              </span>
              {isPromo && (
                <span className="text-lg text-gray-400 line-through">
                  {item.originalPrice?.toFixed(2)} DZD
                </span>
              )}
            </div>

            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full px-4 py-2 text-sm font-semibold shadow-sm text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onGiveFeedback}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Star className="h-4 w-4" />
              Give Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
