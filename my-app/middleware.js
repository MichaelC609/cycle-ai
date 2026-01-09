import { NextResponse } from "next/server";

export default function middleware(request)
{
    //get token from cookies
    const token = request.cookies.get('access_token');

    //protected routes that require authentication
    const protectedRoutes = ['/savedRoutes', '/dashboard'];
    const isProtectedRoute = protectedRoutes.some(route => 
        request.nextUrl.pathname.startsWith(route)
    );

    //redirect to login if accessing protected route without token
    if(isProtectedRoute && !token)
    {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    //redirect to dashboard if accesing login while authenticated
    if(request.nextUrl.pathname === '/login' && token)
    {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path', '/profile/:path', '/login']
};