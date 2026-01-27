"use client";

import { useRoutes } from "../../context/RouteContext";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import RouteInfo from "../../components/RouteInfo/RouteInfo.jsx";
import "../../components/RouteInfo/RouteInfo.css";
import Navbar from "../../components/Navbar/Navbar";
import './savedRoutesList.css'

export default function SavedRoutesList()
{
    //access saved routes from context
    const {savedRoutes, setSavedRoutes, setVisualizingRoute } = useRoutes();
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch routes function using useCallback to avoid recreating on every render
    const fetchRoutes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get auth token
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                setError('Please log in to view your routes');
                setLoading(false);
                return;
            }
            
            // Fetch from Next.js API which forwards to Django backend
            const response = await fetch('/api/routes', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 401) {
                setError('Session expired. Please log in again.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setTimeout(() => router.push('/login'), 2000);
                setLoading(false);
                return;
            }
            
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
    }, [setSavedRoutes, router]);

    // Handle visualizing a route - store in context and navigate to view page
    const handleVisualizeRoute = (route) => {
        setVisualizingRoute({
            route_id: route.route_id,
            start_location: route.start_location,
            end_location: route.end_location,
            polyline: route.polyline,
            cities: route.cities || []
        });
        
        router.push('/route-view');
    };

    // Fetch routes when component mounts
    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    // Delete route handler
    const handleDeleteRoute = async (routeId) => {
        try {
            // Get auth token
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                alert('Please log in to delete routes');
                router.push('/login');
                return;
            }
            
            const response = await fetch(`/api/routes?route_id=${routeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 401) {
                alert('Session expired. Please log in again.');
                router.push('/login');
                return;
            }
            
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
            <div className="no-routes-container">
                <h3 className="font-semibold text-lg mb-3">Saved Routes</h3>
                <p className="no-routes">No saved routes. Add a route to see it here!</p>
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
        const styles = {color: "white", margin: "20px", fontSize: "1.2rem"}
        return (
        <div>
            <Navbar />
            <div className="flex justify-between items-center mb-3">
                <div className="mt-3 text-sm text-gray-600">
                    <h3 style={styles}>Total saved routes: {savedRoutes.length}</h3>
                </div>
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
                        onVisualize={() => handleVisualizeRoute(route)}
                    />
                ))}
            </div>
        </div>
    );
    }
}