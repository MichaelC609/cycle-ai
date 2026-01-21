"use client";

import React, { useState } from "react";
import { useRoutes } from "../context/RouteContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from 'next/navigation';

export default function SaveRoute()
{
    //access route from context
    const { currentRoute, addSavedRoute } = useRoutes();
    const { user } = useAuth();
    const router = useRouter();

    //state for ui feedback
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState("");
    
    //save current route
    async function saveRoute()
    {
        //check if there's a route to save
        if (!currentRoute)
        {
            setMessage("No route selected. Please find a route first");
            return;
        }

        // Check if user is logged in
        const token = localStorage.getItem('access_token');
        if (!token) {
            setMessage("Please log in to save routes");
            setTimeout(() => router.push('/login'), 2000);
            return;
        }

        //show loading state
        setIsSaving(true);
        setMessage("");

        //prepare route data for Django
        const routeData = {
            start_location: currentRoute.start_location,
            end_location: currentRoute.end_location,
            polyline: currentRoute.polyline,
        };

        console.log("Saving route: ", routeData);

        try {
            //send post request to next js api route
            const response = await fetch("/api/routes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(routeData),
            });

            //parse the response
            const data = await response.json();

            // Handle unauthorized
            if (response.status === 401) {
                setMessage("Session expired. Please log in again.");
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setTimeout(() => router.push('/login'), 2000);
                return;
            }

            //check if save was successful
            if(response.ok)
            {
                console.log("Route saved successfully: ", data);

                //add saved route to saved routes list
                if(data.route)
                {
                    addSavedRoute(data.route);
                }

                //show success message
                setMessage("Route saved successfully");

                //clear message after 3 seconds
                setTimeout(() => setMessage(""), 3000);
            }

                else
                {
                    //handle error response
                    console.error("Error saving route: ", data);
                    setMessage(`Error: ${data.error || "Failed to save route"}`);
                }
        } catch(error) {
            //handle network errors
            console.error("Network error:", error);
            setMessage("Network error. Please try again");
        } finally {
            //reset loading state
            setIsSaving(false);
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                id="save-route"
                onClick={saveRoute}
                disabled={isSaving || !currentRoute}
                className={`px-4 py-2 rounded font-medium ${
                    isSaving || !currentRoute
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
            >
             {isSaving ? "Saving...": "Save route"}   
            </button>

            {/*Show feedback message*/}
            {message && (
                <p className={`text-sm ${
                message.includes("successfully") ? "text-green-600" : "text-red-600"
                }`}
                >
                    {message}
                </p>
            )}
        </div>
    )
}