"use client";

import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;        // 0–5
  size?: "sm" | "md";
}

const StarRating: React.FC<StarRatingProps> = ({ value, size = "md" }) => {
  const iconSize = size === "sm" ? 16 : 24;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={iconSize}
          className={
            star <= value
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }
        />
      ))}
    </div>
  );
};

export default StarRating;
