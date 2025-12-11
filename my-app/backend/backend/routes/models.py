from django.db import models

#Class for Routes/Route Preferences
class Route(models.Model):
    route_id = models.AutoField(primary_key=True)
    start_location = models.CharField(max_length=100)
    end_location = models.CharField(max_length=100)
    polyline = models.TextField(blank=True, null=True)  #stores encoded polyline
    cities = models.JSONField(default=list, blank=True) #stores array of cities
    
    def __str__(self):
        return f"Route {self.route_id}: {self.start_location} → {self.end_location}"
