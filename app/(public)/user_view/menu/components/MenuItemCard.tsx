"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { Item, Tag } from "../menu.types";

interface MenuItemCardProps {
  item: Item;
  tags: Tag[];
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, tags }) => {
  const itemTags = tags.filter((tag) => item.tags.includes(tag.id));

  return (
    <article className="grid gap-4 rounded-3xl border border-gray-200 bg-white/90 p-5 shadow-sm transition hover:shadow-lg sm:grid-cols-[160px_minmax(0,1fr)]">
      <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-gray-100">
        <img
          src={item.image || "https://via.placeholder.com/640x480"}
          alt={item.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
        {item.isPromotion && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-lg">
            <Sparkles className="w-3 h-3" />
            Sale
          </span>
        )}
      </div>

      <div className="flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <div className="text-right">
              {item.originalPrice && item.isPromotion && (
                <p className="text-xs text-gray-400 line-through">{item.originalPrice} DZD</p>
              )}
              <p className="text-2xl font-bold text-gray-900">{item.price} DZD</p>
            </div>
          </div>
          {item.description && (
            <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {itemTags.map((tag) => (
            <span
              key={`${item.id}-${tag.id}`}
              className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700"
            >
              {tag.name}
            </span>
          ))}
        </div>

        {item.isPromotion && item.originalPrice && item.price && (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-600">
            Save {Math.round((1 - item.price / item.originalPrice) * 100)}%
          </p>
        )}
      </div>
    </article>
  );
};

export default MenuItemCard;
