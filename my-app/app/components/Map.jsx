"use client";

import { useState, useRef } from "react";
import { GoogleMap, Polyline } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "600px",
};

const defaultCenter = { lat: 34.0522, lng: -118.2437 }; // LA default

export default function Map() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(0);

  const mapRef = useRef(null);

  /* -----------------------------------------------------
     🔍 NEW PLACES API — Convert text → {latitude, longitude}
  --------------------------------------------------------*/
  async function geocodePlaceText(query) {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error("Google Maps API key is not configured");
        return null;
      }

      console.log("Geocoding query:", query);

      const res = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.location",
          },
          body: JSON.stringify({
            textQuery: query,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Places API error response:", res.status, errorText);
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            console.error("Error details:", errorJson.error.message);
            console.error("Error reason:", errorJson.error.details);
          }
        } catch (e) {
          // Error text is not JSON
        }
        return null;
      }

      const data = await res.json();
      console.log("Places API response:", data);
      console.log("Found location:", data.places?.[0]?.formattedAddress);

      if (!data.places || data.places.length === 0) {
        console.warn("No places found for query:", query);
        return null;
      }

      const loc = data.places[0].location;

      return {
        latitude: loc.latitude,
        longitude: loc.longitude,
      };
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    }
  }


  /* -----------------------------------------------------
     🚴 NEW ROUTES API v2 — Get multiple biking routes
  --------------------------------------------------------*/
  async function requestBikeRoutes(origin, destination) {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error("Google Maps API key is not configured");
        return [];
      }

      const url = "https://routes.googleapis.com/directions/v2:computeRoutes";

      const body = {
        origin: { location: { latLng: origin } },
        destination: { location: { latLng: destination } },
        travelMode: "BICYCLE",
        computeAlternativeRoutes: true,
        polylineQuality: "HIGH_QUALITY",
        polylineEncoding: "ENCODED_POLYLINE",
      };

      console.log("Requesting routes with:", body);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Routes API error response:", res.status, errorText);
        return [];
      }

      const data = await res.json();
      console.log("Routes API Response:", data);

      return data.routes || [];
    } catch (err) {
      console.error("Routes API error:", err);
      return [];
    }
  }

  /* -----------------------------------------------------
     ➰ Decode encoded polyline → lat/lng path
  --------------------------------------------------------*/
  function decodePolyline(encoded) {
    const points = google.maps.geometry.encoding.decodePath(encoded);
    return points.map((p) => ({ lat: p.lat(), lng: p.lng() }));
  }

  /* -----------------------------------------------------
     🧭 Form submission handler
  --------------------------------------------------------*/
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!start.trim() || !end.trim()) {
      alert("Please enter both start and end locations.");
      return;
    }

    // 1. Convert text → coordinates
    console.log("Geocoding start location:", start);
    const origin = await geocodePlaceText(start);
    
    if (!origin) {
      alert(`Unable to find start location: "${start}". Try a more specific place name (e.g., "123 Main St, Los Angeles, CA").`);
      return;
    }

    console.log("Geocoding end location:", end);
    const destination = await geocodePlaceText(end);

    if (!destination) {
      alert(`Unable to find end location: "${end}". Try a more specific place name (e.g., "456 Oak Ave, Los Angeles, CA").`);
      return;
    }

    // 2. Fetch bike routes
    const apiRoutes = await requestBikeRoutes(origin, destination);

    if (!apiRoutes || apiRoutes.length === 0) {
      alert("No bike routes found between these locations. Try different locations.");
      return;
    }

    // 3. Decode polyline for each route
    const decoded = apiRoutes.map((route) =>
      decodePolyline(route.polyline.encodedPolyline)
    );

    console.log("Decoded polyline routes:", decoded);

    setRoutes(decoded);
    setSelectedRoute(0); // Reset to first route when new routes are loaded

    // 4. Recenter map to fit the first route
    if (decoded.length > 0 && mapRef.current) {
      const bounds = new google.maps.LatLngBounds();
      decoded[0].forEach((pt) => bounds.extend(pt));
      mapRef.current.fitBounds(bounds);
    }
  };

  return (
    <div className="space-y-4">
      {/* -------------------- FORM -------------------- */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-gray-100 p-3 rounded-md"
      >
        <input
          type="text"
          placeholder="Start location"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          type="text"
          placeholder="End location"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded"
        >
          Find Bike Routes
        </button>
      </form>

      {/* ---------------------- MAP ---------------------- */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        onLoad={(map) => (mapRef.current = map)}
      >
        {/* Draw all route alternatives */}
        {routes.map((path, index) => (
          <Polyline
            key={index}
            path={path}
            options={{
              strokeColor: index === selectedRoute ? "#000000" : "#888888",
              strokeOpacity: index === selectedRoute ? 1.0 : 0.6,
              strokeWeight: index === selectedRoute ? 6 : 4,
              clickable: true,
            }}
            onClick={() => setSelectedRoute(index)}
          />
        ))}
      </GoogleMap>
    </div>
  );
}
