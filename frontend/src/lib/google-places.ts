const API_KEY = (import.meta.env.VITE_GOOGLE_PLACES_API_KEY as string) || "";

let loadPromise: Promise<void> | null = null;

export function getGooglePlacesApiKey(): string {
  return API_KEY;
}

export function loadGoogleMapsScript(): Promise<void> {
  if (!API_KEY) return Promise.reject(new Error("No API key configured"));

  if (window.google?.maps?.places) return Promise.resolve();

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.maps?.places) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
