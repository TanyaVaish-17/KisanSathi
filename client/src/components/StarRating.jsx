import React, { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange, size = "md", label }) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === "function";
  const shown = hover || value;
  const dimension = size === "sm" ? "h-4 w-4" : "h-8 w-8";

  return (
    <div
      className="flex items-center gap-0.5"
      role={interactive ? "radiogroup" : "img"}
      aria-label={label || `${value} / 5`}
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const icon = (
          <Star
            className={`${dimension} ${star <= shown ? "fill-warn text-warn" : "text-line-strong"}`}
          />
        );

        if (!interactive) return <span key={star}>{icon}</span>;

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            className="cursor-pointer p-0.5"
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}