#import django REST framework
from rest_framework import serializers
from .models import Route

#Serializer: Converts Database fields into JSON format

#create a serializer
class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ['route_id', 'start_location', 'end_location']