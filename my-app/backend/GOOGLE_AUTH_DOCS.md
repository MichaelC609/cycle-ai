# Google OAuth Authentication Implementation Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Authentication Flow](#authentication-flow)
6. [Configuration](#configuration)
7. [Security Considerations](#security-considerations)
8. [Error Handling](#error-handling)
9. [Testing](#testing)

---

## Overview

This application implements Google OAuth 2.0 authentication with JWT (JSON Web Tokens) for session management. The implementation uses Google's official OAuth libraries on both frontend and backend to provide secure, seamless user authentication.

### Key Features

- **One-click Google Sign-In** using Google's OAuth 2.0 flow
- **JWT-based session management** for stateless authentication
- **Automatic user creation** and profile synchronization
- **Email verification** enforcement
- **Token refresh** mechanism for extended sessions
- **Profile picture** integration from Google accounts

### Technology Stack

**Frontend:**

- `@react-oauth/google` (v0.12.1) - Google OAuth integration for React
- `jwt-decode` (v4.0.0) - JWT token decoding and validation
- Next.js (v15.1.4) - React framework with client-side routing

**Backend:**

- Django (v4.2.x) - Web framework
- Django REST Framework (v3.14.0) - API framework
- `djangorestframework-simplejwt` (v5.3.0) - JWT token generation
- `google-auth` (v2.23.0) - Google token verification
- PostgreSQL - Database for user storage

---

## Architecture

### High-Level Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │────────▶│  Google Auth │────────▶│   Backend   │
│  (Next.js)  │◀────────│   Provider   │◀────────│   (Django)  │
└─────────────┘         └──────────────┘         └─────────────┘
      │                                                  │
      │                                                  │
      ▼                                                  ▼
┌─────────────┐                                  ┌─────────────┐
│ Local Store │                                  │  PostgreSQL │
│ (JWT Tokens)│                                  │  (Users DB) │
└─────────────┘                                  └─────────────┘
```

### Component Hierarchy

```
RootLayout (layout.js)
├── GoogleOAuthProvider (Provides Google Auth context)
│   └── clientId from env
├── AuthProvider (Custom auth context)
│   ├── User state management
│   ├── Login/Logout functions
│   └── Token management
├── GoogleMapsProvider (Maps API context)
└── RouteProvider (Application routes context)
```

---

## Backend Implementation

### 1. User Model (`models.py`)

The custom user model extends Django's `AbstractUser` to store Google OAuth-specific information:

```python
class User(AbstractUser):
    email = models.EmailField(unique=True)
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    profile_picture = models.URLField(blank=True, null=True)
    is_oauth_user = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
```

**Key Fields:**

- `email`: Primary login identifier (must be unique)
- `google_id`: Google's unique user ID (sub claim from token)
- `profile_picture`: URL to user's Google profile picture
- `is_oauth_user`: Flag to distinguish OAuth users from traditional users

**Database Table:** `users`

### 2. Authentication View (`views.py`)

The `google_login_view` is a function-based view that handles the OAuth flow:

#### View Configuration

```python
@csrf_exempt
def google_login_view(request):
```

**Why function-based view?**

- Bypasses Django REST Framework's authentication system
- Allows custom JSON response handling
- Direct access to request body for credential extraction
- Uses `@csrf_exempt` since Google OAuth provides CSRF protection

#### Token Verification Process

```python
# 1. Extract credential from request
body = json.loads(request.body)
token = body.get('credential')

# 2. Verify token with Google
idinfo = id_token.verify_oauth2_token(
    token,
    google_requests.Request(),
    settings.GOOGLE_CLIENT_ID
)

# 3. Extract user information
email = idinfo.get('email')
google_id = idinfo.get('sub')
first_name = idinfo.get('given_name', '')
last_name = idinfo.get('family_name', '')
profile_picture = idinfo.get('picture', '')
```

**Token Verification Details:**

- Uses Google's official `google-auth` library
- Validates token signature using Google's public keys
- Ensures token was issued for the correct client ID
- Checks token expiration automatically

#### User Management Logic

The view implements a three-tier user lookup strategy:

```python
# Tier 1: Look up by Google ID (best case)
try:
    user = User.objects.get(google_id=google_id)
    # Found existing OAuth user
except User.DoesNotExist:
    # Tier 2: Look up by email
    try:
        user = User.objects.get(email=email)
        # Link existing user to Google account
        user.google_id = google_id
        user.is_oauth_user = True
        user.profile_picture = profile_picture
        user.save()
    except User.DoesNotExist:
        # Tier 3: Create new user
        user = User.objects.create(
            email=email,
            username=email,
            google_id=google_id,
            first_name=first_name,
            last_name=last_name,
            profile_picture=profile_picture,
            is_oauth_user=True,
        )
```

**Why this approach?**

1. **Prevents duplicate accounts**: Checks Google ID first
2. **Links existing users**: Updates accounts that signed up with same email
3. **Auto-creates new users**: Seamless onboarding for new users
4. **Preserves data**: Existing user data is maintained when linking

#### JWT Token Generation

```python
# Generate JWT tokens using SimpleJWT
refresh = RefreshToken.for_user(user)

response_data = {
    'refresh': str(refresh),
    'access': str(refresh.access_token),
    'user': {
        'id': user.id,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'profile_picture': user.profile_picture,
    }
}
```

**Token Lifetimes (configured in settings.py):**

- Access Token: 1 hour
- Refresh Token: 7 days
- Automatic rotation on refresh

### 3. URL Configuration (`urls.py`)

```python
urlpatterns = [
    path('auth/google/', google_login_view, name='google-login'),
]
```

**Full Endpoint:** `POST /api/routes/auth/google/`

### 4. Settings Configuration (`settings.py`)

#### Google OAuth Credentials

```python
GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID', default='')
GOOGLE_CLIENT_SECRET = config('GOOGLE_CLIENT_SECRET', default='')
```

#### Custom User Model

```python
AUTH_USER_MODEL = 'routes.User'
```

#### JWT Configuration

```python
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

#### CORS Settings

```python
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000'
).split(',')

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_HEADERS = True
```

**Why these CORS settings?**

- `CORS_ALLOW_CREDENTIALS`: Required for sending cookies/auth headers
- `CORS_ALLOW_ALL_HEADERS`: Allows custom headers in development
- Origin whitelist ensures only trusted domains can authenticate

---

## Frontend Implementation

### 1. Root Layout Provider Setup (`layout.js`)

The authentication is set up at the root level with nested providers:

```javascript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        >
          <AuthProvider>
            <GoogleMapsProvider>
              <RouteProvider>{children}</RouteProvider>
            </GoogleMapsProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
```

**Provider Order:**

1. `GoogleOAuthProvider` - Outermost, provides Google OAuth context
2. `AuthProvider` - Custom auth state management
3. `GoogleMapsProvider` - Maps functionality
4. `RouteProvider` - Application routing

### 2. Auth Context (`AuthContext.js`)

The `AuthContext` manages authentication state and provides auth methods throughout the app.

#### State Management

```javascript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
```

**State Variables:**

- `user`: Current user object (null if not authenticated)
- `loading`: Prevents flashing unauthenticated UI during initial load

#### Token Persistence & Restoration

```javascript
useEffect(() => {
  const token = localStorage.getItem("access_token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      // Check if token is still valid
      if (decoded.exp * 1000 > Date.now()) {
        setUser(decoded);
      } else {
        // Token expired, clean up
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }
  setLoading(false);
}, []);
```

**How it works:**

1. Runs once on component mount
2. Retrieves access token from localStorage
3. Decodes and validates token expiration
4. Restores user session if valid
5. Cleans up if token is expired or invalid

#### Login Function

```javascript
const login = async (credential) => {
  const response = await fetch(`${API_URL}/api/routes/auth/google/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Authentication failed (${response.status})`
    );
  }

  const data = await response.json();

  // Store tokens in localStorage
  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);

  // Update user state
  setUser(data.user);

  return data;
};
```

**Flow:**

1. Sends Google credential to backend
2. Backend verifies and returns JWT tokens + user data
3. Stores tokens in localStorage for persistence
4. Updates React state to trigger re-renders

#### Logout Function

```javascript
const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  setUser(null);
};
```

**Simple but effective:**

- Removes tokens from storage
- Clears user state
- Triggers UI update to show logged-out state

#### Context Value Export

```javascript
const value = {
  user,
  login,
  logout,
  loading,
};

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
```

### 3. OAuth Login Button Component (`OAuthLoginButton.jsx`)

The button component integrates Google's pre-built sign-in UI:

```javascript
"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

function OAuthLoginButton() {
  const { login } = useAuth();
  const router = useRouter();

  const handleSuccess = async (credentialResponse) => {
    try {
      console.log(
        "Google login successful, credential: ",
        credentialResponse.credential
      );

      // Send credential to backend via AuthContext
      await login(credentialResponse.credential);
      console.log("Backend authentication successful");

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. Please try again");
    }
  };

  const handleError = () => {
    console.error("Google login failed");
    alert("Google login failed. Please try again");
  };

  return (
    <div className="flex justify-center items-center">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="outline"
        size="large"
        text="Signin_with"
      />
    </div>
  );
}

export default OAuthLoginButton;
```

**Component Features:**

- `'use client'`: Required for Next.js client components
- `GoogleLogin`: Pre-built Google sign-in button
- Auto-redirect on success
- User-friendly error alerts

**GoogleLogin Props:**

- `onSuccess`: Called with credential token on successful login
- `onError`: Called if Google login fails
- `theme='outline'`: Button styling
- `size='large'`: Button size
- `text='Signin_with'`: Shows "Sign in with Google" text

### 4. Usage in Pages

Example usage in a login page:

```javascript
import OAuthLoginButton from "../components/OAuthLoginButton";

export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <OAuthLoginButton />
    </div>
  );
}
```

---

## Authentication Flow

### Complete Step-by-Step Flow

```
┌──────────────────────────────────────────────────────────────┐
│ STEP 1: User Clicks "Sign in with Google" Button             │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 2: Google OAuth Popup Opens                             │
│ - User selects Google account                                │
│ - User grants permissions                                    │
│ - Google generates credential token                          │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 3: OAuthLoginButton.handleSuccess() Called              │
│ - Receives credentialResponse.credential (JWT from Google)   │
│ - Calls login(credential) from AuthContext                   │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 4: Frontend Sends Request to Backend                    │
│ POST /api/routes/auth/google/                                │
│ Body: { "credential": "eyJhbGciOi..." }                      │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 5: Backend Verifies Token with Google                   │
│ - Calls id_token.verify_oauth2_token()                       │
│ - Google validates token signature                           │
│ - Returns user info (email, sub, name, picture)              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 6: Backend User Management                              │
│ - Checks email_verified flag                                 │
│ - Looks up user by google_id                                 │
│ - If not found, looks up by email                            │
│ - If still not found, creates new user                       │
│ - Updates profile picture and OAuth flag                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 7: Backend Generates JWT Tokens                         │
│ - Creates RefreshToken for user                              │
│ - Generates access_token (1 hour expiry)                     │
│ - Generates refresh_token (7 day expiry)                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 8: Backend Returns Response                             │
│ Response: {                                                   │
│   "access": "eyJhbGciOiJIUz...",                             │
│   "refresh": "eyJhbGciOiJIUz...",                            │
│   "user": {                                                   │
│     "id": 1,                                                  │
│     "email": "user@example.com",                             │
│     "first_name": "John",                                    │
│     "last_name": "Doe",                                      │
│     "profile_picture": "https://..."                         │
│   }                                                           │
│ }                                                             │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 9: Frontend Stores Tokens                               │
│ - localStorage.setItem('access_token', data.access)          │
│ - localStorage.setItem('refresh_token', data.refresh)        │
│ - setUser(data.user) - updates React state                   │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ STEP 10: Navigation & UI Update                              │
│ - router.push('/') redirects to home page                    │
│ - UI components re-render with user data                     │
│ - User is now authenticated                                  │
└──────────────────────────────────────────────────────────────┘
```

### Subsequent Page Loads (Session Restoration)

```
┌──────────────────────────────────────────────────────────────┐
│ User Visits Site                                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│ AuthContext useEffect Runs                                    │
│ 1. Checks localStorage for 'access_token'                    │
│ 2. Decodes token using jwt-decode                            │
│ 3. Validates expiration (decoded.exp * 1000 > Date.now())    │
└──────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
         Token Valid               Token Expired/Invalid
                │                           │
                ▼                           ▼
    setUser(decoded)           Remove tokens from storage
    User logged in             User must login again
```

---

## Configuration

### Environment Variables

#### Frontend (.env.local)

```bash
# Google OAuth Client ID (from Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Google Maps API Key (for maps functionality)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-api-key
```

#### Backend (.env)

```bash
# Django Secret Key
DJANGO_SECRET_KEY=your-django-secret-key

# Debug Mode (False in production)
DJANGO_DEBUG=True

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your-maps-api-key

# Database Configuration
DB_NAME=cycle-ai
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5433

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
CSRF_TRUSTED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Google Cloud Console Setup

1. **Create a Project**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing

2. **Enable APIs**

   - Enable "Google+ API" or "Google Identity"
   - Enable "Google Maps JavaScript API" (for maps features)

3. **Create OAuth 2.0 Credentials**

   - Go to "Credentials" section
   - Create "OAuth 2.0 Client ID"
   - Application type: "Web application"

4. **Configure OAuth Consent Screen**

   - Add app name, logo, support email
   - Add authorized domains
   - Add scopes: `email`, `profile`, `openid`

5. **Add Authorized JavaScript Origins**

   ```
   http://localhost:3000
   https://yourdomain.com
   ```

6. **Add Authorized Redirect URIs**

   ```
   http://localhost:3000
   https://yourdomain.com
   ```

7. **Get Credentials**
   - Copy Client ID → `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - Copy Client Secret → `GOOGLE_CLIENT_SECRET`

---

## Security Considerations

### 1. Token Security

**Access Token Storage:**

- Stored in `localStorage` (not sessionStorage)
- Persists across browser sessions
- Vulnerable to XSS attacks

**Mitigation Strategies:**

- Short expiration time (1 hour)
- Regular token rotation
- Input sanitization to prevent XSS
- Content Security Policy headers

**Alternative:** Use `httpOnly` cookies for enhanced security (requires backend changes)

### 2. CSRF Protection

**Current Implementation:**

- `@csrf_exempt` on Google login endpoint
- Google OAuth provides inherent CSRF protection via state parameter

**Why CSRF is exempt:**

- Google's credential token includes anti-CSRF measures
- Token is single-use and time-limited
- Token verification happens server-side

### 3. Email Verification

```python
if not idinfo.get('email_verified', False):
    return JsonResponse({'error': 'Email not verified by Google'}, status=400)
```

**Why this matters:**

- Ensures user owns the email address
- Prevents account hijacking
- Google handles verification process

### 4. Token Verification

**Backend validates:**

- Token signature (using Google's public keys)
- Token issuer (must be accounts.google.com)
- Token audience (must match GOOGLE_CLIENT_ID)
- Token expiration
- Email verification status

### 5. HTTPS in Production

```python
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
```

**Ensures:**

- All traffic uses HTTPS
- Tokens transmitted over encrypted connections
- Prevents man-in-the-middle attacks

### 6. CORS Configuration

**Development:**

```python
CORS_ALLOWED_ORIGINS = ['http://localhost:3000']
```

**Production:**

```python
CORS_ALLOWED_ORIGINS = ['https://yourdomain.com']
```

**Never use:**

```python
CORS_ALLOW_ALL_ORIGINS = True  # ❌ INSECURE
```

---

## Error Handling

### Backend Error Responses

#### 1. Missing Credential

```json
{
  "error": "No credential provided"
}
```

Status: `400 Bad Request`

#### 2. Invalid JSON

```json
{
  "error": "Invalid JSON"
}
```

Status: `400 Bad Request`

#### 3. Invalid Google Token

```json
{
  "error": "Invalid Google token",
  "details": "Token verification failed"
}
```

Status: `401 Unauthorized`

#### 4. Email Not Verified

```json
{
  "error": "Email not verified by Google"
}
```

Status: `400 Bad Request`

#### 5. Server Error

```json
{
  "error": "Authentication failed",
  "details": "Unexpected error message"
}
```

Status: `500 Internal Server Error`

### Frontend Error Handling

#### OAuthLoginButton Component

```javascript
const handleSuccess = async (credentialResponse) => {
  try {
    await login(credentialResponse.credential);
    router.push("/");
  } catch (error) {
    console.error("Login failed", error);
    alert("Login failed. Please try again");
  }
};

const handleError = () => {
  console.error("Google login failed");
  alert("Google login failed. Please try again");
};
```

**User Experience:**

- Console logging for debugging
- User-friendly alert messages
- No automatic retries (prevents spam)

#### AuthContext Error Handling

```javascript
const login = async (credential) => {
  try {
    const response = await fetch(`${API_URL}/api/routes/auth/google/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Authentication failed (${response.status})`
      );
    }

    const data = await response.json();
    // ... success handling
  } catch (error) {
    console.error("Login error:", error);
    throw error; // Re-throw for component handling
  }
};
```

---

## Testing

### Manual Testing Checklist

#### ✅ New User Registration

1. Click "Sign in with Google"
2. Select Google account
3. Verify user created in database
4. Check profile picture loaded
5. Verify JWT tokens stored in localStorage
6. Confirm redirect to home page

#### ✅ Existing User Login

1. Login with previously registered email
2. Verify no duplicate user created
3. Check profile updated if changed
4. Confirm tokens refreshed

#### ✅ Session Persistence

1. Login successfully
2. Refresh browser page
3. Verify user still logged in
4. Check access token validated

#### ✅ Token Expiration

1. Login and get access token
2. Wait for token expiration (or manually modify expiration)
3. Refresh page
4. Verify user logged out
5. Check tokens removed from storage

#### ✅ Logout

1. Click logout button
2. Verify localStorage cleared
3. Check user state null
4. Confirm UI shows logged-out state

#### ✅ Error Scenarios

1. **Invalid Token**: Modify token manually → Expect 401 error
2. **Network Error**: Disconnect internet → Expect error message
3. **Backend Down**: Stop Django server → Expect error message
4. **Email Not Verified**: (Difficult to test) → Expect 400 error

### Backend Testing Commands

```bash
# Run Django tests
cd my-app/backend/backend
source ../../../venv/bin/activate
python manage.py test routes.tests

# Check database for users
python manage.py shell
>>> from routes.models import User
>>> User.objects.all()
>>> User.objects.filter(is_oauth_user=True)
```

### Frontend Testing

```bash
# Check browser console
# Look for logs:
# - "Google login successful, credential: ..."
# - "Backend authentication successful"
# - "Received from backend: ..."

# Check localStorage
# In browser console:
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')

# Decode token
import { jwtDecode } from 'jwt-decode';
const token = localStorage.getItem('access_token');
console.log(jwtDecode(token));
```

### API Testing with cURL

```bash
# Test Google login endpoint
curl -X POST http://localhost:8000/api/routes/auth/google/ \
  -H "Content-Type: application/json" \
  -d '{"credential": "VALID_GOOGLE_CREDENTIAL_TOKEN"}'

# Expected Response:
# {
#   "access": "eyJhbGc...",
#   "refresh": "eyJhbGc...",
#   "user": {
#     "id": 1,
#     "email": "user@example.com",
#     "first_name": "John",
#     "last_name": "Doe",
#     "profile_picture": "https://..."
#   }
# }
```

---

## Troubleshooting

### Common Issues

#### 1. "Invalid Google token" Error

**Cause:** Client ID mismatch or expired credential

**Solution:**

- Verify `GOOGLE_CLIENT_ID` matches in both frontend and backend
- Check Google Cloud Console credentials
- Ensure OAuth consent screen is configured
- Try logging in again (credentials expire quickly)

#### 2. CORS Error

**Symptom:**

```
Access to fetch at 'http://localhost:8000/api/routes/auth/google/'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**

```python
# Check settings.py
CORS_ALLOWED_ORIGINS = ['http://localhost:3000']
CORS_ALLOW_CREDENTIALS = True
```

#### 3. "Email not verified by Google"

**Cause:** User's Google account email not verified

**Solution:**

- User must verify email through Google
- Or remove email verification check (not recommended)

#### 4. Database Error: "relation 'users' does not exist"

**Solution:**

```bash
python manage.py makemigrations
python manage.py migrate
```

#### 5. Frontend: "useAuth must be used within an AuthProvider"

**Cause:** Component using `useAuth()` outside `AuthProvider`

**Solution:**
Ensure `AuthProvider` wraps the component in layout.js

#### 6. Tokens Not Persisting

**Check:**

- Browser localStorage enabled
- Not in incognito/private mode
- No browser extensions blocking localStorage

---

## Future Improvements

### Recommended Enhancements

1. **HttpOnly Cookies for Tokens**

   - More secure than localStorage
   - Prevents XSS token theft
   - Requires backend cookie handling

2. **Refresh Token Rotation**

   - Implement automatic token refresh
   - Use refresh token when access token expires
   - Improve user experience (no forced logout)

3. **Multi-Provider OAuth**

   - Add GitHub, Facebook, Microsoft login
   - Allow account linking
   - Unified user experience

4. **Email/Password Fallback**

   - Traditional authentication option
   - For users without Google accounts
   - Password reset functionality

5. **Two-Factor Authentication (2FA)**

   - Additional security layer
   - SMS or authenticator app
   - Optional for users

6. **Session Management Dashboard**

   - Show active sessions
   - Device information
   - Remote logout capability

7. **Audit Logging**

   - Track login attempts
   - Log suspicious activity
   - Compliance requirements

8. **Rate Limiting**
   - Prevent brute force attacks
   - Limit login attempts
   - Protect backend resources

---

## References

### Official Documentation

- [Google Identity Platform](https://developers.google.com/identity)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)
- [Django Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)
- [google-auth Python](https://google-auth.readthedocs.io/)

### Related Files

- Backend: [views.py](backend/routes/views.py#L332-L421)
- Backend: [models.py](backend/routes/models.py#L1-L27)
- Backend: [settings.py](backend/routes/settings.py)
- Frontend: [OAuthLoginButton.jsx](../app/components/OAuthLoginButton.jsx)
- Frontend: [AuthContext.js](../app/context/AuthContext.js)
- Frontend: [layout.js](../app/layout.js)

---

## Version History

| Version | Date       | Changes                             |
| ------- | ---------- | ----------------------------------- |
| 1.0     | 2026-01-12 | Initial comprehensive documentation |

---

_Last Updated: January 12, 2026_
