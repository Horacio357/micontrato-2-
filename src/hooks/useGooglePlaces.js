import { useEffect } from "react";

let scriptLoaded = false;
let scriptLoading = false;

/**
 * Carga el script de Google Maps Places de forma lazy (solo una vez).
 * Llamar cuando el usuario llegue a un paso con campo de dirección.
 */
export function useGooglePlaces(shouldLoad = false) {
  useEffect(() => {
    if (!shouldLoad || scriptLoaded || scriptLoading) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!apiKey) return; // Sin key, no carga

    scriptLoading = true;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      scriptLoading = false;
      window.dispatchEvent(new Event("google_maps_loaded"));
    };
    document.head.appendChild(script);
  }, [shouldLoad]);
}