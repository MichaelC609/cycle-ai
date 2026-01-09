"use client";

import Navbar from "../components/Navbar/Navbar";
import SavedRoutesList from "../components/SavedRoutesList";
import Link from "next/link";

export default function SavedRoutesPage()
{
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
                <h1 className="text-gray-600 mt-2">
                        View and manage all your saved routes
                </h1>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        No saved routes 
                    </h1>
                    <Link
                        href="../frontend/route-optimizer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
                    >
                        Back to Map
                    </Link>
                </div>
                {/* Saved Routes list */}
                <SavedRoutesList />
            </div>
        </div>
        </>
    )
}