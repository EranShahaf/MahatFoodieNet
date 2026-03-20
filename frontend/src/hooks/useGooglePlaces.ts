import { useState, useEffect, useRef } from "react";
import {
  loadGoogleMapsScript,
  getGooglePlacesApiKey,
} from "@/lib/google-places";

export interface PlaceDetails {
  name: string;
  formattedAddress: string;
  url: string;
  lat: number;
  lng: number;
}

const cache = new Map<string, PlaceDetails>();

export function useGoogleMapsReady() {
  const [ready, setReady] = useState(!!window.google?.maps?.places);

  useEffect(() => {
    if (ready || !getGooglePlacesApiKey()) return;

    loadGoogleMapsScript()
      .then(() => setReady(true))
      .catch(() => {});
  }, [ready]);

  return ready;
}

export function usePlaceDetails(placeId?: string) {
  const [details, setDetails] = useState<PlaceDetails | null>(
    placeId ? cache.get(placeId) ?? null : null
  );
  const [loading, setLoading] = useState(false);
  const serviceRef = useRef<google.maps.places.PlacesService | null>(null);
  const mapsReady = useGoogleMapsReady();

  useEffect(() => {
    if (!placeId || !mapsReady) return;

    if (cache.has(placeId)) {
      setDetails(cache.get(placeId)!);
      return;
    }

    setLoading(true);

    if (!serviceRef.current) {
      const el = document.createElement("div");
      serviceRef.current = new google.maps.places.PlacesService(el);
    }

    serviceRef.current.getDetails(
      {
        placeId,
        fields: ["name", "formatted_address", "geometry", "url"],
      },
      (result, status) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          result
        ) {
          const place: PlaceDetails = {
            name: result.name ?? "",
            formattedAddress: result.formatted_address ?? "",
            url: result.url ?? "",
            lat: result.geometry?.location?.lat() ?? 0,
            lng: result.geometry?.location?.lng() ?? 0,
          };
          cache.set(placeId, place);
          setDetails(place);
        }
        setLoading(false);
      }
    );
  }, [placeId, mapsReady]);

  return { details, loading };
}
