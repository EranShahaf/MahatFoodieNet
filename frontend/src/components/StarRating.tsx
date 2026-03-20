import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description?: string;
}

const StarRating = ({ value, onChange, label, description }: StarRatingProps) => {
  const [hovered, setHovered] = useState(0);

  const display = hovered || value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {value > 0 && (
          <span className="text-xs font-semibold text-star tabular-nums">
            {value}/5
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <div
        className="flex gap-1"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onClick={() => onChange(star === value ? 0 : star)}
            className="p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Star
              className={cn(
                "h-7 w-7 transition-colors duration-150",
                star <= display
                  ? "text-star fill-star"
                  : "text-muted-foreground/25"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default StarRating;
