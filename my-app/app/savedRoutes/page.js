"use client";

import Navbar from "../components/Navbar/Navbar";
import SavedRoutesList from "../pages/savedRoutesList/SavedRoutesList";
import Link from "next/link";
import './savedRoutes.css';

export default function SavedRoutesPage()
{
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