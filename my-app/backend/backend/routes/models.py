from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

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

#Class for Routes/Route Preferences
class Route(models.Model):
    route_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='routes', null=True, blank=True)
    name = models.CharField(max_length=255, default='Unnamed Route')
    start_location = models.CharField(max_length=255, default='')
    end_location = models.CharField(max_length=255, default='')
    polyline = models.TextField(blank=True, default='')
    cities = models.JSONField(blank=True, null=True, default=list)
    distance = models.FloatField(default=0.0)
    duration = models.FloatField(default=0.0)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Route: {self.start_location} → {self.end_location}"