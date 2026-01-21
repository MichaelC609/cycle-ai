"use client";

import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from "../components/Navbar/Navbar";
import SavedRoutesList from "../pages/savedRoutesList/SavedRoutesList";
import Link from "next/link";
import './savedRoutes.css';

export default function SavedRoutesPage()
{
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Only redirect after loading is complete
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

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

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="title-header">
                        View and manage all your saved routes
                </h1>
                {/* Saved Routes list */}
                <SavedRoutesList />
            </div>
        </div>
        </>
    )
}