from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def root_view(request):
    return JsonResponse({
        'message': 'Welcome to Cycle AI Backend API',
        'endpoints': {
            'admin': '/admin/',
            'routes': '/api/routes/',
        }
    })

urlpatterns = [
    path('', root_view, name='root'),  # Root URL
    path('admin/', admin.site.urls),
    path('api/routes/', include('routes.urls')),  # include your app URLs
]