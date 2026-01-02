import { NextResponse } from "next/server";

// GET - Fetch all routes via Django backend
export async function GET(request)
{
    try {
        console.log("Fetching routes from Django backend...");
        
        // Forward request to Django backend
        const djangoResponse = await fetch('http://localhost:8000/api/routes/', {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await djangoResponse.json();
        
        if (!djangoResponse.ok) {
            console.error("Django error:", data);
            return NextResponse.json(
                { error: data.message || 'Failed to fetch routes', details: data },
                { status: djangoResponse.status }
            );
        }

        console.log(`Retrieved routes successfully from Django`);
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Error fetching routes:", error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// POST - Save new route via Django backend
export async function POST(request)
{
    try {
        // Get route data from request body
        const routeData = await request.json();
        console.log("Received route data:", routeData);

        // Forward request to Django backend
        const djangoResponse = await fetch('http://localhost:8000/api/routes/', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(routeData)
        });

        console.log("Django response received, status:", djangoResponse.status);

        // Get Django's response
        const data = await djangoResponse.json();
        
        console.log("Django response data:", data);

        // Check if request to Django was successful
        if (!djangoResponse.ok) {
            console.error("Django error:", data);
            return NextResponse.json(
                { error: data.message || 'Failed to save route', details: data.errors || data },
                { status: djangoResponse.status }
            );
        }

        // Return success response with saved route data
        console.log("Route saved successfully:", data);
        return NextResponse.json(data, { status: 201 });

    } catch (error) {
        // Handle errors
        console.error("Error in API route:", error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}

// DELETE - Remove a route via Django backend
export async function DELETE(request)
{
    try {
        // Get route_id from URL search params
        const { searchParams } = new URL(request.url);
        const route_id = searchParams.get('route_id');
        
        if (!route_id) {
            return NextResponse.json(
                { error: 'route_id is required' },
                { status: 400 }
            );
        }
        
        console.log(`Deleting route ${route_id} via Django backend...`);
        
        // Forward delete request to Django backend
        const djangoResponse = await fetch(`http://localhost:8000/api/routes/?route_id=${route_id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await djangoResponse.json();
        
        if (!djangoResponse.ok) {
            console.error("Django error:", data);
            return NextResponse.json(
                { error: data.message || 'Failed to delete route', details: data },
                { status: djangoResponse.status }
            );
        }

        console.log("Route deleted successfully:", data);
        return NextResponse.json(data, { status: 200 });

    } catch (error) {
        console.error("Error deleting route:", error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}