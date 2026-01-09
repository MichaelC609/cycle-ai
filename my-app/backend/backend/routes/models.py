from django.contrib.auth.models import AbstractUser
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

class User(AbstractUser):
    #User model to store additional Google info
    email = models.EmailField(unique=True) #make email unique and required
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    profile_picture = models.URLField(blank=True, null=True) #store google profile pic url
    is_oauth_user = models.BooleanField(default=False)

    #Override to use email as primary login field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'