from django.contrib.auth.models import AbstractUser
from django.db import models

#Class for Routes/Route Preferences
class Route(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='routes')
    name = models.CharField(max_length=255)
    start_location = models.CharField(max_length=255)
    end_location = models.CharField(max_length=255)
    distance = models.FloatField()
    duration = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    
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