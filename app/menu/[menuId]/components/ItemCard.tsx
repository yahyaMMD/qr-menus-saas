"use client";

import { ChevronRight } from "lucide-react";
import { ItemView } from "../types";

type Props = {
  item: ItemView;
  onOpen: (item: ItemView) => void;
};

export function ItemCard({ item, onOpen }: Props) {
  const isPromo = item.isPromotion && typeof item.originalPrice === "number";
  const hasDescription = Boolean(item.description?.trim());

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group flex w-full flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-lg transition hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
    >
      {item.image ? (
        <div className="h-52 w-full overflow-hidden bg-orange-50">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover object-center transition duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="h-52 w-full border-b border-orange-100 bg-orange-50/60" />
      )}

      <div className="px-5 py-4 sm:px-6 sm:py-5 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
          <ChevronRight className="h-5 w-5 text-orange-500 transition group-hover:translate-x-1" />
        </div>

        {hasDescription && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl font-bold text-orange-600">
            {item.price.toFixed(2)} DZD
          </span>
          {isPromo && (
            <span className="text-xs text-gray-400 line-through">
              {item.originalPrice.toFixed(2)} DZD
            </span>
          )}
          {isPromo && item.originalPrice && item.price && (
            <span className="ml-auto rounded-full bg-green-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              Save {Math.round((1 - item.price / item.originalPrice) * 100)}%
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
