import { MapPin, ExternalLink } from "lucide-react";
import { usePlaceDetails } from "@/hooks/useGooglePlaces";

interface RestaurantLocationProps {
  name: string;
  location: string;
  placeId?: string;
}

const RestaurantLocation = ({
  name,
  location,
  placeId,
}: RestaurantLocationProps) => {
  const { details, loading } = usePlaceDetails(placeId);

  const address = details?.formattedAddress || location;
  const mapsUrl =
    details?.url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      name + " " + location
    )}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5 group hover:bg-muted transition-colors"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
        <MapPin className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground leading-tight">
          {name}
        </p>
        <p
          className={`text-xs text-muted-foreground mt-0.5 truncate ${
            loading ? "animate-pulse" : ""
          }`}
        >
          {address}
        </p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </a>
  );
};

export default RestaurantLocation;
