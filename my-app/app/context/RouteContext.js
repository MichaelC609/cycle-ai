"use client";

import {createContext, useContext, useState} from "react";

//Create context for routes
const RouteContext = createContext();

//Wrap app and provide route data to all children
export function RouteProvider({ children }) {
    //state for currently viewed route
    const [currentRoute, setCurrentRoute] = useState(null);

    //state for routes user have saved
    const [savedRoutes, setSavedRoutes] = useState([]);

    //state to store all fetched routes with encoded polyline
    const [fetchedRoutes, setFetchedRoutes] = useState([]);

    //state to visualize pre-rendered route
    const [visualizingRoute, setVisualizingRoute] = useState(null);

    //add route to saved routes list
    const addSavedRoute = (route) => {
        setSavedRoutes(prev => [...prev, route]);
    };

    return (
        <RouteContext.Provider
            value = {{
                currentRoute,
                setCurrentRoute,
                savedRoutes,
                setSavedRoutes,  // Added this line to expose setSavedRoutes
                addSavedRoute,
                fetchedRoutes,
                setFetchedRoutes,
                visualizingRoute,
                setVisualizingRoute
            }}
        >
            {children}
        </RouteContext.Provider>
    );
}

//custom hook to use context to access route data
export function useRoutes()
{
    const context = useContext(RouteContext);

    if(!context)
    {
        throw new Error("useRoutes must be used within RouteProvider")
    }

    return context;
}