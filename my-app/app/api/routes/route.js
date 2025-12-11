import { NextResponse } from "next/server";

export async function POST(request)
{
    try{
        //get route data from request body
        const routeData = await request.json();
        console.log("Received route data:", routeData);

        //forward request to django backend
        const djangoResponse = await fetch('http://localhost:8000/api/routes/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(routeData)
        });

        //get Django's response
        const data = await djangoResponse.json();

        //check if request to django was successful
        if(!djangoResponse.ok)
        {
            console.error("Django error:", data);
            return NextResponse.json(
                { error: 'Failed to save route', details: data}.details,
                { status: djangoResponse.status }
            );
        }

        //return success response with saved route data
        console.log("Route saved successfully:", data);
        return NextResponse.json(data, { status: 201 });

    } catch (error) {
        //handle errors
        console.error("Error in API route: ", error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            {status: 500}
        );
    }
}