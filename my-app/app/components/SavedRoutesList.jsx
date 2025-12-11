"use client";

import { useRoutes } from "../context/RouteContext";

export default function SavedRoutesList()
{
    //access saved routes from context
    const {savedRoutes } = useRoutes();

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
                                            {city}
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