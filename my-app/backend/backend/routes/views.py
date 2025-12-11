from django.http import HttpResponse, JsonResponse
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Route
from .serializers import RouteSerializer
from django.conf import settings
import requests

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
        

class RouteView(generics.ListCreateAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    
    def get(self, request, *args, **kwargs):
        """List all routes"""
        routes = self.get_queryset()
        serializer = self.get_serializer(routes, many=True)
        return Response({
            'message': 'Routes retrieved successfully',
            'routes': serializer.data
        })
    
    def post(self, request, *args, **kwargs):
        """Create a new route and extract cities from polyline"""

        #get data from request
        data = request.data.copy()

        #if polyline is provided -> extract cities
        if 'polyline' in data and data['polyline']:
            try:
                cities = extractCitiesFromPolyline(data['polyline'])
                data['cities'] = cities
                print(f"Extracted {len(cities)} cities: {cities}")
            except Exception as e:
                print(f"Error extracting cities: {e}")
                import traceback
                traceback.print_exc()
                data['cities'] = []

        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Route created successfully',
                'route': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        print(f"Serializer errors: {serializer.errors}")
        return Response({
            'message': 'Invalid data',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)