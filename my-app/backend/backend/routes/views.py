from django.http import HttpResponse, JsonResponse
from rest_framework import generics, status
from rest_framework.response import Response
from .models import Route
from .serializers import RouteSerializer

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
        """Create a new route"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Route created successfully',
                'route': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'message': 'Invalid data',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)