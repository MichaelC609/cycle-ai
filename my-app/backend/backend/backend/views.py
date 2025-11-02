from django.http import JsonResponse
from django.db import connection

def database_status(request):
    """Simple API endpoint to check database connectivity"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            db_version = cursor.fetchone()[0]
            
        return JsonResponse({
            'status': 'success',
            'message': 'Database connection successful',
            'database_version': db_version,
            'database_name': connection.settings_dict['NAME']
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)