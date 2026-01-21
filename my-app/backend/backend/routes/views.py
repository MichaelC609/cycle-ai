from django.http import HttpResponse, JsonResponse
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .models import Route, User
from .serializers import RouteSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator



from django.conf import settings
from django.db import connection

from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

import requests
import json

#helper function to return a list of unique cities from an encoded polyline
def extractCitiesFromPolyline(encodedPolyline):
    #decode polyline to get coordinate points
    decodedPoints = decodedPolyline(encodedPolyline)
    print(f"Decoded {len(decodedPoints)} points from polyline")

    #sample points at intervals to reduce api calls
    sampleInterval = 10
    sampledPoints = decodedPoints[::sampleInterval]
    print(f"Sampling {len(sampledPoints)} points with interval {sampleInterval}")

    cities = [] #list of cities
    seenCities = set() #avoids duplicate cities
    apiKey = settings.GOOGLE_MAPS_API_KEY   #api key
    
    if not apiKey:
        print("WARNING: GOOGLE_MAPS_API_KEY is not set!")
        return cities

    #reverse geocode each sample point to get city name
    for i, point in enumerate(sampledPoints):
        lat, long = point['lat'], point['lng']
        print(f"Processing point {i+1}/{len(sampledPoints)}: {lat}, {long}")

        #call GeoCoding API
        url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{long}&key={apiKey}"

        try:
            response = requests.get(url)
            data = response.json()
            print(f"Geocoding response status: {data.get('status')}")

            #if HTTP status code == OK && there is at least address response
            if data['status'] == 'OK' and len(data['results']) > 0:
                #extract city from address components
                city = extractCityFromGeocodeResult(data['results'][0])
                print(f"Extracted city: {city}")

                #if there is a new unique city
                if city and (city not in seenCities):
                    cities.append(city)
                    seenCities.add(city)
            else:
                print(f"Geocoding failed: {data.get('status')}, error: {data.get('error_message', 'N/A')}")

        #catch error
        except Exception as e:
            print(f"Error geocoding point {lat}, {long}: {e}")

    #return unique cities in order
    return cities




#function to decode a polyline that was encoded using Google's Routes API
def decodedPolyline(encoded):
    points = []
    index, lat, long = 0,0,0

    #go through list of encoded points
    while index < len(encoded):
        #decode latitude
        result, shift = 0,0

        while True:
            #convert ascii -> numeric value & reverse Google's encoding
            b = ord(encoded[index]) - 63
            index += 1  #go to next value in array

            #extract lowest 5 bits of b, shift amount and combine with existing result
            result |= (b & 0x1f) << shift
            shift += 5
            
            #if reached last bit of data
            if b < 0x20:
                break

        dlat = ~(result >> 1) if (result & 1) else (result >> 1)
        lat += dlat

        #decode longitude
        result, shift = 0,0
        
        while True:
            #convert ascii -> numeric value & reverse Google's encoding
            b = ord(encoded[index]) - 63
            index += 1  #go to next value in array

            #extract lowest 5 bits of b, shift amount and combine with existing result
            result |= (b & 0x1f) << shift
            shift += 5
            
            #if reached last bit of data
            if b < 0x20:
                break

        dlong = ~(result >> 1) if (result & 1) else (result >> 1)
        long += dlong

        points.append({
            'lat': lat / 1e5,
            'lng': long / 1e5
        })

    return points

#function to extract city name from Google Geocoding API result
def extractCityFromGeocodeResult(result):
    addressComponents = result.get('address_components', [])

    #find locality/city
    for component in addressComponents:
        if 'locality' in component.get('types', []):
            return component['long_name']
        
    #if no locality, try 'administrative_area_level_2'(county/district)
    for component in addressComponents:
        if 'administrative_area_level_2' in component.get('types', []):
            return component['long_name']

    return None
        

class RouteView(APIView):
    """API View using raw SQL queries for route operations"""
    
    def get(self, request, *args, **kwargs):
        """List all routes using raw SQL SELECT query"""
        try:
            with connection.cursor() as cursor:
                # Execute SQL SELECT query
                cursor.execute("""
                    SELECT route_id, start_location, end_location, polyline, cities 
                    FROM routes_route 
                    ORDER BY route_id ASC
                """)
                
                # Fetch all rows
                rows = cursor.fetchall()
                
                # Convert rows to list of dictionaries
                routes = []
                for row in rows:
                    # Parse cities JSON string to Python list
                    cities = row[4]
                    if isinstance(cities, str):
                        try:
                            cities = json.loads(cities)
                        except json.JSONDecodeError:
                            cities = []
                    elif not cities:
                        cities = []
                    
                    routes.append({
                        'route_id': row[0],
                        'start_location': row[1],
                        'end_location': row[2],
                        'polyline': row[3],
                        'cities': cities
                    })
                
                print(f"Retrieved {len(routes)} routes from database using SQL")
                if routes:
                    print(f"Sample route cities: {routes[0].get('cities')}")
                
                return Response({
                    'message': 'Routes retrieved successfully',
                    'routes': routes
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            print(f"Error fetching routes: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'message': 'Error fetching routes',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request, *args, **kwargs):
        """Create a new route using raw SQL INSERT query"""
        try:
            # Get data from request
            data = request.data
            start_location = data.get('start_location')
            end_location = data.get('end_location')
            polyline = data.get('polyline')
            
            # Validate required fields
            if not start_location or not end_location:
                return Response({
                    'message': 'Invalid data',
                    'errors': 'start_location and end_location are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Extract cities from polyline if provided
            cities = []
            if polyline:
                try:
                    cities = extractCitiesFromPolyline(polyline)
                    print(f"Extracted {len(cities)} cities: {cities}")
                except Exception as e:
                    print(f"Error extracting cities: {e}")
                    import traceback
                    traceback.print_exc()
            
            # Convert cities list to JSON string for SQL
            cities_json = json.dumps(cities)
            
            with connection.cursor() as cursor:
                # Execute SQL INSERT query with RETURNING clause
                cursor.execute("""
                    INSERT INTO routes_route (start_location, end_location, polyline, cities) 
                    VALUES (%s, %s, %s, %s) 
                    RETURNING route_id, start_location, end_location, polyline, cities
                """, [start_location, end_location, polyline, cities_json])
                
                # Fetch the inserted row
                row = cursor.fetchone()
                
                # Parse cities JSON string to Python list for response
                returned_cities = row[4]
                if isinstance(returned_cities, str):
                    try:
                        returned_cities = json.loads(returned_cities)
                    except json.JSONDecodeError:
                        returned_cities = []
                elif not returned_cities:
                    returned_cities = []
                
                # Create response data
                route = {
                    'route_id': row[0],
                    'start_location': row[1],
                    'end_location': row[2],
                    'polyline': row[3],
                    'cities': returned_cities
                }
                
                print(f"Route saved successfully using SQL: {route}")
                print(f"Cities in response: {returned_cities}")
                
                return Response({
                    'message': 'Route created successfully',
                    'route': route
                }, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            print(f"Error creating route: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'message': 'Error creating route',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request, *args, **kwargs):
        """Delete a route using raw SQL DELETE query"""
        try:
            # Get route_id from query parameters
            route_id = request.query_params.get('route_id')
            
            if not route_id:
                return Response({
                    'message': 'Invalid request',
                    'error': 'route_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            with connection.cursor() as cursor:
                # First check if route exists
                cursor.execute(
                    "SELECT route_id FROM routes_route WHERE route_id = %s",
                    [route_id]
                )
                
                if not cursor.fetchone():
                    return Response({
                        'message': 'Route not found',
                        'error': f'No route with id {route_id}'
                    }, status=status.HTTP_404_NOT_FOUND)
                
                # Execute SQL DELETE query
                cursor.execute(
                    "DELETE FROM routes_route WHERE route_id = %s",
                    [route_id]
                )
                
                print(f"Route {route_id} deleted successfully using SQL")
                
                return Response({
                    'message': 'Route deleted successfully',
                    'route_id': int(route_id)
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            print(f"Error deleting route: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'message': 'Error deleting route',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@csrf_exempt
def google_login_view(request):
    """
    Function-based view to handle Google OAuth login
    This bypasses REST Framework's authentication system
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    print("=== Google Login Function View Called ===")
    print(f"Request method: {request.method}")
    print(f"Content-Type: {request.content_type}")
    
    try:
        # Parse JSON body
        body = json.loads(request.body)
        token = body.get('credential')
        
        print(f"Received credential: {token[:20] if token else 'None'}...")
        
        if not token:
            return JsonResponse({'error': 'No credential provided'}, status=400)
        
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        
        print(f"Token verified for email: {idinfo.get('email')}")
        
        email = idinfo.get('email')
        google_id = idinfo.get('sub')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        profile_picture = idinfo.get('picture', '')
        
        if not idinfo.get('email_verified', False):
            return JsonResponse({'error': 'Email not verified by Google'}, status=400)
        
        # Get or create user
        user = None
        try:
            user = User.objects.get(google_id=google_id)
            print(f"Found existing user: {user.email}")
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=email)
                user.google_id = google_id
                user.is_oauth_user = True
                user.profile_picture = profile_picture
                user.save()
                print(f"Updated existing user: {user.email}")
            except User.DoesNotExist:
                user = User.objects.create(
                    email=email,
                    username=email,
                    google_id=google_id,
                    first_name=first_name,
                    last_name=last_name,
                    profile_picture=profile_picture,
                    is_oauth_user=True,
                )
                print(f"Created new user: {user.email}")
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profile_picture': user.profile_picture,
            }
        }
        
        print(f"Login successful for: {user.email}")
        return JsonResponse(response_data, status=200)
        
    except json.JSONDecodeError:
        print("ERROR: Invalid JSON in request body")
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except ValueError as e:
        print(f"Token verification failed: {str(e)}")
        return JsonResponse({'error': 'Invalid Google token', 'details': str(e)}, status=401)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({'error': 'Authentication failed', 'details': str(e)}, status=500)