"use client";

import { ChevronRight } from "lucide-react";
import { ItemView } from "../types";

type Props = {
  item: ItemView;
  onOpen: (item: ItemView) => void;
};

export function ItemCard({ item, onOpen }: Props) {
  const isPromo = item.isPromotion && item.originalPrice;

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group flex flex-col overflow-hidden rounded-2xl border-2 border-gray-100 bg-white text-left shadow-md transition-all hover:border-orange-200 hover:shadow-xl"
    >
      {item.image && (
        <div className="relative overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isPromo && (
            <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
              🔥 Special
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <h3 className="text-base font-bold leading-snug text-gray-900">
              {item.name}
            </h3>
            {item.description && (
              <p className="line-clamp-2 text-xs leading-relaxed text-gray-600">
                {item.description}
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-orange-500 transition-transform group-hover:translate-x-1" />
        </div>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-orange-600">
              {item.price.toFixed(2)} DZD
            </span>
            {isPromo && (
              <span className="text-xs text-gray-400 line-through">
                {item.originalPrice?.toFixed(2)} DZD
              </span>
            )}
          </div>
        </div>

        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
