"use client";

import React from "react";
import { Star } from "lucide-react";

interface InteractiveStarsProps {
  value: number;
  onChange: (value: number) => void;
}

const InteractiveStars: React.FC<InteractiveStarsProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            size={28}
            className={
              star <= value
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300 hover:text-yellow-300"
            }
          />
        </button>
      ))}
    </div>
  );
};

export default InteractiveStars;
