"use client";

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useRoutes } from '../context/RouteContext';
import Navbar from "../components/Navbar/Navbar";
import Map from "../components/Map/Map";
import Link from "next/link";

export default function RouteViewPage() {
    const { user, loading } = useAuth();
    const { visualizingRoute } = useRoutes();
    const router = useRouter();

    useEffect(() => {
        // Only redirect after loading is complete
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Redirect if no route is selected
    useEffect(() => {
        if (!loading && !visualizingRoute) {
            router.push('/savedRoutes');
        }
    }, [visualizingRoute, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-600">Loading...</p>
                </div>
            </>
        );
    }

    // Don't render the page if user is not logged in
    if (!user) {
        return null;
    }

    // Don't render if no route to visualize
    if (!visualizingRoute) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-6xl mx-auto p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Link 
                            href="/savedRoutes"
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                        >
                            ← Back to Saved Routes
                        </Link>
                        <h1 className="text-3xl font-bold">
                            {visualizingRoute.start_location} to {visualizingRoute.end_location}
                        </h1>
                    </div>

                    {/* Route metadata */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Start Location</h3>
                                <p className="text-gray-700">{visualizingRoute.start_location}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">End Location</h3>
                                <p className="text-gray-700">{visualizingRoute.end_location}</p>
                            </div>
                        </div>
                        
                        {visualizingRoute.cities && visualizingRoute.cities.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-semibold text-lg mb-2">Cities Along Route</h3>
                                <p className="text-gray-700">{visualizingRoute.cities.join(', ')}</p>
                            </div>
                        )}
                    </div>

                    {/* Map component */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">Route Map</h2>
                        <Map visualizingMode={true} />
                    </div>
                </div>
            </div>
        </>
    );
}
