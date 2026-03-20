import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoogleMapsReady } from "@/hooks/useGooglePlaces";

export interface RestaurantResult {
  name: string;
  location: string;
  placeId?: string;
}

interface RestaurantSearchInputProps {
  value: RestaurantResult | null;
  onChange: (result: RestaurantResult | null) => void;
}

interface Prediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

const RestaurantSearchInput = ({
  value,
  onChange,
}: RestaurantSearchInputProps) => {
  const [query, setQuery] = useState(value?.name ?? "");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const mapsReady = useGoogleMapsReady();

  const fetchPredictions = useCallback(
    (input: string) => {
      if (!input.trim()) {
        setPredictions([]);
        return;
      }

      if (!mapsReady) {
        setPredictions([]);
        return;
      }

      if (!serviceRef.current) {
        serviceRef.current = new google.maps.places.AutocompleteService();
      }

      setLoading(true);
      serviceRef.current.getPlacePredictions(
        { input, types: ["establishment"] },
        (results, status) => {
          setLoading(false);
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            results
          ) {
            setPredictions(
              results.map((r) => ({
                placeId: r.place_id,
                mainText: r.structured_formatting.main_text,
                secondaryText: r.structured_formatting.secondary_text,
              }))
            );
          } else {
            setPredictions([]);
          }
        }
      );
    },
    [mapsReady]
  );

  const handleInputChange = (text: string) => {
    setQuery(text);
    setOpen(true);

    if (!text.trim()) {
      onChange(null);
      setPredictions([]);
      return;
    }

    onChange({ name: text, location: "" });

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(text), 300);
  };

  const selectPrediction = (p: Prediction) => {
    setQuery(p.mainText);
    onChange({
      name: p.mainText,
      location: p.secondaryText,
      placeId: p.placeId,
    });
    setPredictions([]);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = open && predictions.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-2 rounded-xl bg-card px-4 py-3 shadow-card ring-1 ring-transparent focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) setOpen(true);
          }}
          placeholder="Search for a restaurant..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />
        )}
      </div>

      {value?.location && !showDropdown && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground pl-1">
          <Search className="h-3 w-3" />
          {value.location}
        </p>
      )}

      {showDropdown && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg animate-in fade-in-0 zoom-in-95">
          <ul className="max-h-60 overflow-y-auto py-1">
            {predictions.map((p) => (
              <li key={p.placeId}>
                <button
                  type="button"
                  onClick={() => selectPrediction(p)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/60"
                  )}
                >
                  <MapPin className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                  <div className="min-w-0">
                     <p className="text-sm font-medium text-foreground truncate">
                      {p.mainText}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.secondaryText}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RestaurantSearchInput;
