"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { Item, Tag } from "../menu.types";

interface MenuItemCardProps {
  item: Item;
  tags: Tag[];
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, tags }) => {
  const itemTags = tags.filter((tag) => item.tags.includes(tag.id));

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-4 flex transition-transform hover:scale-[1.02]">
      <div className="relative w-32 sm:w-40 h-24 sm:h-32 flex-shrink-0">
        <img
          src={item.image || "https://via.placeholder.com/400x300"}
          alt={item.name}
          className="w-full h-full object-cover"
        />

        {/* Tags */}
        {itemTags.length > 0 && (
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex flex-col gap-1">
            {itemTags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        {item.price && (
          <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2">
            <span className="bg-orange-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
              {item.price}DA
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 truncate">
              {item.name}
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm line-clamp-2">
              {item.description}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
