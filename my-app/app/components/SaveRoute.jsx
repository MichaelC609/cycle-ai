import React from "react";
import Map from "./Map";

export default function SaveRoute()
{
    //Function to add start/end location to api request body
    function saveRoute()
    {
        const request = {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
                start_location: Map.start_location,
                end_location: Map.end_location,
            }),
        };

        fetch("/api/add-route")
    }

    return(
        <button id="save-route" onClick={saveRoute}>Save Route</button>
    );
}