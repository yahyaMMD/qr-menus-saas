"use client";

import React from "react";
import { ChevronRight, Percent } from "lucide-react";
import { Item, Tag } from "../menu.types";

interface MenuItemCardProps {
  item: Item;
  tags: Tag[];
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, tags }) => {
  const itemTags = tags.filter((tag) => item.tags.includes(tag.id));
  const hasDescription = !!item.description;
  const originalPrice = item.originalPrice ?? undefined;

  return (
    <article className="group bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden mb-4 transition hover:shadow-lg">
      <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gray-100">
        <img
          src={item.image || "https://via.placeholder.com/640x480"}
          alt={item.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />

        {item.isPromotion && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-lg">
              <Percent className="w-3 h-3" />
              Sale
            </span>
          </div>
        )}

        {itemTags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {itemTags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {item.price !== null && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1">
            {item.isPromotion && originalPrice && (
              <span className="bg-gray-800/70 text-[11px] text-white px-2 py-0.5 rounded-full line-through opacity-80">
                {originalPrice}DA
              </span>
            )}
            <span
              className={`text-white px-3 py-1 rounded-full text-xs font-semibold ${
                item.isPromotion ? "bg-green-500" : "bg-orange-500"
              }`}
            >
              {item.price}DA
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {item.name}
            </h3>
            {hasDescription && (
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                {item.description}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        </div>

        {itemTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {itemTags.map((tag) => (
              <span
                key={`${item.id}-${tag.id}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-gray-700 border border-gray-200"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {item.isPromotion && item.originalPrice && item.price && (
          <p className="text-xs text-green-600 font-semibold">
            Save {Math.round((1 - item.price / item.originalPrice) * 100)}%
          </p>
        )}
      </div>
    </article>
  );
};

export default MenuItemCard;
