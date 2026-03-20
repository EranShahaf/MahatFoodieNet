declare namespace google.maps {
  class Map {}

  namespace places {
    class PlacesService {
      constructor(attrContainer: HTMLElement);
      getDetails(
        request: PlaceDetailsRequest,
        callback: (
          result: PlaceResult | null,
          status: PlacesServiceStatus
        ) => void
      ): void;
    }

    interface PlaceDetailsRequest {
      placeId: string;
      fields?: string[];
    }

    interface PlaceResult {
      name?: string;
      formatted_address?: string;
      geometry?: {
        location?: {
          lat(): number;
          lng(): number;
        };
      };
      url?: string;
      rating?: number;
    }

    enum PlacesServiceStatus {
      OK = "OK",
      ZERO_RESULTS = "ZERO_RESULTS",
      INVALID_REQUEST = "INVALID_REQUEST",
      OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
      REQUEST_DENIED = "REQUEST_DENIED",
      UNKNOWN_ERROR = "UNKNOWN_ERROR",
    }
  }
}

interface Window {
  google?: typeof google;
}
