Documentation on how Google Auth was implemented

1. **Adding Google OAuth Credentials to Django Settings**

```
    GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID', default='')
    GOOGLE_CLIENT_SECRET = config('GOOGLE_CLIENT_ID', default='')
```

2. **Create Authentication View**

```
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os

class GoogleLoginView(APIView):
    """
    Handle Google OAuth login
    Receives the Google ID token from frontend, verifies it,
    and returns JWT tokens for authentication
    """
    def post(self, request):
        token = request.data.get('credential')  # Google ID token from frontend

        if not token:
            return Response(
                {'error': 'No credential provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Verify the Google ID token with Google's servers
            # This ensures the token is legitimate and hasn't been tampered with
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            # Extract user information from the verified token
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            # Check if user exists, if not create a new user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,  # Use email as username
                    'first_name': first_name,
                    'last_name': last_name,
                }
            )

            # Generate JWT tokens for the user
            # Refresh token: long-lived, used to get new access tokens
            # Access token: short-lived, used for API authentication
            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            # Token verification failed
            return Response(
                {'error': 'Invalid token', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
```

- Receives token from frontend and verifies it with Google to ensure legitimacy
- Extracts user info such as email and name, creating a user account if one doesn't exist
- Generate JWT tokens and returns them along with user info to frontend

3. **Necessary imports**

- djangorestframework-simplejwt
- google-auth

4. Update Django settings for JWT
   File: Settings.py

````REST_FRAMEWORK = {
        'DEFAULT_RENDERER_CLASSES': [
            'rest_framework.renderers.JSONRenderer',
        ],
        'DEFAULT_PARSER_CLASSES': [
            'rest_framework.parsers.JSONParser',
        ],
        'DEFAULT_AUTHENTICATION_CLASSES': [
            'rest_framework_simplejwt.authentication.JWTAuthentication',
        ],
    }```
````

5. **Add JWT Settings to settings.py**

```
    #JWT Settings
    from datetime import timedelta
    SIMPLE_JWT = {
        'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),    #access token expires in 1 hour
        'REFRESH_TOKEN_LIFETIME': timedelta(days=7),    #Refresh token expires in 7 days
        'ROTATE_REFRESH_TOKENS': True,  #Generate new refresh token on refresh
        'BLACKLIST_AFTER_ROTATION': True,   #blacklist old tokens
}
```
