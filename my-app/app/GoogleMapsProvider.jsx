"use client";

import { useJsApiLoader } from "@react-google-maps/api";

export default function GoogleMapsProvider({ children }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "geometry"],   // <-- Unified loader config
    version: "weekly",
  });

  if (!isLoaded) return <p>Loading Maps...</p>;

  return children;
}
