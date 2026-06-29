import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  rating = 0,
  maxStars = 5,
  size = 20,
  interactive = false,
  onChange,
  showValue = false,
  className = '',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = hoverRating || rating;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= Math.floor(displayRating);
        const isHalf = !isFilled && starValue - 0.5 <= displayRating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => {
              if (interactive && onChange) {
                onChange(starValue);
              }
            }}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`
              transition-transform duration-150
              ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              disabled:opacity-100
            `}
          >
            <Star
              size={size}
              className={`
                transition-colors duration-150
                ${isFilled || isHalf
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-none text-[var(--color-neutral-300)] dark:text-[var(--color-neutral-600)]'
                }
              `}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-semibold text-[var(--text-secondary)]">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
