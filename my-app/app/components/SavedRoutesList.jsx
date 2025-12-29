"use client";

import { useRoutes } from "../context/RouteContext";
import { useState, useEffect } from "react";

export default function SavedRoutesList()
{
    //access saved routes from context
    const {savedRoutes, setSavedRoutes } = useRoutes();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all routes from backend when component mounts
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8000/api/routes/');
                
                if (!response.ok) {
                    throw new Error('Failed to fetch routes');
                }
                
                const data = await response.json();
                console.log('Fetched routes:', data);
                
                // Update the context with all routes from backend
                if (data.routes && Array.isArray(data.routes)) {
                    setSavedRoutes(data.routes);
                }
            } catch (err) {
                console.error('Error fetching routes:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRoutes();
    }, []); // Empty dependency array = run once on mount

    // Show loading state
    if (loading) {
        return (
            <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-semibold text-lg mb-3">Saved Routes</h3>
                <p className="text-gray-500">Loading routes...</p>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-semibold text-lg mb-3">Saved Routes</h3>
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    //if no saved routes, show a message
    if (savedRoutes.length === 0)
    {
        return (
            <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-semibold text-lg mb-3">Saved Routes: </h3>
                <p className="text-gray-500">No saved routes. Add a route to see it here!</p>
            </div>
        );
    }

    else
    {
        return (
        <div className="bg-white p-4 rounded-md shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Saved Routes</h3>
            <div className="space-y-3">
                {savedRoutes.map((route) => (
                    <div
                        key={route.route_id}
                        className="border border-gray-300 rounded p-3 hover: border-gray-400 transition"
                    >
                        {/* Route Info */}
                        <div className="flex-justify-between items-start mb-2">
                            <div>
                                <p className="font-medium">
                                    {route.start_location} to {route.end_location}
                                </p>

                                <p className="text-sm text-gray-500">
                                    Route Number: {route.route_id}
                                </p>
                            </div>
                        </div>

                        {/* Cities */}
                        {route.cities && route.cities.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                    Cities along route: 
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {route.cities.map((city, index) => (
                                        <span
                                            key={index}
                                            className="text-xs bg-gray-100 px-2 py-1 rounded"
                                        >
                                            {city},
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                ))}
            </div>
            <div className="mt-3 text-sm text-gray-600">
                <p>Total saved routes: {savedRoutes.length}</p>
            </div>
        </div>
    )
    }
}