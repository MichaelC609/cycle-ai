"use client";

import { useRoutes } from "../context/RouteContext";
import { useState, useEffect, useCallback } from "react";
import RouteInfo from "./RouteInfo/RouteInfo.jsx";
import "./RouteInfo/RouteInfo.css";

export default function SavedRoutesList()
{
    //access saved routes from context
    const {savedRoutes, setSavedRoutes } = useRoutes();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch routes function using useCallback to avoid recreating on every render
    const fetchRoutes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch from Next.js API which forwards to Django backend
            const response = await fetch('/api/routes');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch routes: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Fetched routes from backend:', data);
            
            // Validate and update the context with routes from backend
            if (data.routes && Array.isArray(data.routes)) {
                // Ensure each route has the expected structure
                const validRoutes = data.routes.map(route => ({
                    route_id: route.route_id,
                    start_location: route.start_location || '',
                    end_location: route.end_location || '',
                    polyline: route.polyline || '',
                    cities: Array.isArray(route.cities) ? route.cities : []
                }));
                
                setSavedRoutes(validRoutes);
                console.log(`Loaded ${validRoutes.length} routes`);
            } else {
                console.warn('Invalid routes data structure:', data);
                setSavedRoutes([]);
            }
        } catch (err) {
            console.error('Error fetching routes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [setSavedRoutes]);

    // Fetch routes when component mounts
    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    // Delete route handler
    const handleDeleteRoute = async (routeId) => {
        try {
            const response = await fetch(`/api/routes?route_id=${routeId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete route');
            }
            
            const data = await response.json();
            console.log('Route deleted:', data);
            
            // Remove route from local state
            setSavedRoutes(prev => prev.filter(route => route.route_id !== routeId));
            
        } catch (err) {
            console.error('Error deleting route:', err);
            alert(`Failed to delete route: ${err.message}`);
        }
    };

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
                <button 
                    onClick={fetchRoutes}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    //if no saved routes, show a message
    if (savedRoutes.length === 0)
    {
        return (
            <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-semibold text-lg mb-3">Saved Routes</h3>
                <p className="text-gray-500">No saved routes. Add a route to see it here!</p>
                <button 
                    onClick={fetchRoutes}
                    className="mt-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                    Refresh
                </button>
            </div>
        );
    }

    else
    {
        const styles = {color: "blue"}
        return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg">Saved Routes</h3>
                <button 
                    onClick={fetchRoutes}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
            <div className="routes-grid">
                {savedRoutes.map((route, index) => (
                    <RouteInfo
                        key={route.route_id} 
                        routeNum={index + 1}
                        startLocation={route.start_location} 
                        endLocation={route.end_location}
                        cities={route.cities || []}
                        onDelete={() => handleDeleteRoute(route.route_id)}
                    />
                ))}
            </div>
            <div className="mt-3 text-sm text-gray-600">
                <h3 style={styles}>Total saved routes: {savedRoutes.length}</h3>
            </div>
        </div>
    );
    }
}