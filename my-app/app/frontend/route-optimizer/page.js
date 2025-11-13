'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import PageLayout from '../../components/PageLayout';

export default function RouteOptimizer() {
  const [formData, setFormData] = useState({
    startAddress: '',
    endAddress: '',
    routePreferences: [],
    avoidTraffic: '',
    roadTypes: [],
    avoidDetours: '',
    avoidSteepHills: ''
  });

  const [mapLoaded, setMapLoaded] = useState(false);
  const [map, setMap] = useState(null);

  // Handle all text / radio inputs safely
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value        // ensures ONLY string values are stored
    }));
  };

  const handleCheckboxChange = (e, category) => {
    const { value, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [category]: checked
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }));
  };

  // Google Maps setup
  const initializeMap = async () => {
    if (typeof window !== 'undefined' && window.google) {
      const { Map } = await window.google.maps.importLibrary('maps');
      
      const mapInstance = new Map(document.getElementById('map'), {
        zoom: 10,
        center: { lat: 37.7749, lng: -122.4194 },
        mapId: 'DEMO_MAP_ID'
      });
      
      setMap(mapInstance);
    }
  };

  const handleGoogleMapsLoad = () => {
    setMapLoaded(true);
    initializeMap();
  };

  // ✅ FIXED: This is where the circular JSON was happening
  // You were referencing undefined variables: startAddress, endAddress
  // You now correctly reference formData.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.startAddress || !formData.endAddress) {
      alert("Please enter both start and end addresses");
      return;
    }

    // 🎉 CLEAN ROUTE DATA FOR BACKEND
    const routeData = {
      start_location: formData.startAddress,
      end_location: formData.endAddress,
    };

    console.log("Submitting routeData:", routeData);

    try {
      const response = await fetch("http://localhost:8000/api/routes/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // ❗ FIXED: no circular structures anymore
        body: JSON.stringify(routeData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Route saved:", data);
        alert("Route saved successfully!");
        
        // Clear form after successful submission
        setFormData({
          ...formData,
          startAddress: '',
          endAddress: ''
        });
      } else {
        const errorText = await response.text();
        console.error("Error saving route:", errorText);
        alert(`Error saving route: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error: Could not connect to the server. Make sure the backend is running on http://localhost:8000");
    }
  };

  // Calculate route on map
  const calculateRoute = async () => {
    if (!window.google || !map) return;

    const { DirectionsService, DirectionsRenderer } = 
      await window.google.maps.importLibrary('routes');

    const directionsService = new DirectionsService();
    const directionsRenderer = new DirectionsRenderer();
    directionsRenderer.setMap(map);

    const request = {
      origin: formData.startAddress,
      destination: formData.endAddress,
      travelMode: window.google.maps.TravelMode.BICYCLING,
      avoidHighways: formData.routePreferences.includes('scenic'),
      avoidTolls: true,
    };

    try {
      const result = await directionsService.route(request);
      directionsRenderer.setDirections(result);
    } catch (error) {
      console.error('Error calculating route:', error);
      alert('Could not calculate route. Check your addresses.');
    }
  };

  useEffect(() => {
    window.initMap = handleGoogleMapsLoad;
    return () => delete window.initMap;
  }, []);

  return (
    <PageLayout>

      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,routes&v=weekly&callback=initMap`}
        strategy="lazyOnload"
      />

      <div className="route-optimizer-container">
        <h1>Plan Your Route:</h1>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="route-form">

          <div className="locations-section">
            <h2>Enter Locations:</h2>

            <div className="input-group">
              <label htmlFor="startAddress">Start Address:</label>
              <input
                type="text"
                id="startAddress"
                name="startAddress"
                value={formData.startAddress}
                onChange={handleInputChange}
                className="address-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="endAddress">End Address:</label>
              <input
                type="text"
                id="endAddress"
                name="endAddress"
                value={formData.endAddress}
                onChange={handleInputChange}
                className="address-input"
              />
            </div>
          </div>

          <button type="submit" className="submit-button">
            Save Route
          </button>
        </form>

        {/* Map */}
        <div className="map-container">
          <div id="map" className="map"></div>
          {!mapLoaded && <div className="map-loading">Loading Map...</div>}
        </div>
      </div>
    </PageLayout>
  );
}
