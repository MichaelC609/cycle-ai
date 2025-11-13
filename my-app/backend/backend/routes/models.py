from django.db import models

#Class for Routes/Route Preferences
class Route(models.Model):
    route_id = models.BigIntegerField(primary_key=True)
    start_location = models.CharField(max_length=100)
    end_location = models.CharField(max_length=100)