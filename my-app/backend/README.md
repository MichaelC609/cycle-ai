# Cycle AI Backend Documentation

## Overview

The Cycle AI backend is a Django REST API that manages bicycle route data and provides endpoints for route optimization functionality. It stores route information in a PostgreSQL database and serves as the backend for the Cycle AI Next.js frontend application.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Database Configuration](#database-configuration)
- [API Endpoints](#api-endpoints)
- [Setup Instructions](#setup-instructions)
- [Important Commands](#important-commands)
- [Concepts Implemented](#concepts-implemented)
- [Frontend Integration](#frontend-integration)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

```
Frontend (Next.js) ←→ Backend (Django REST API) ←→ Database (PostgreSQL)
     Port 3000              Port 8000                 Port 5433
```

### Data Flow

1. User submits route data through Next.js frontend
2. Frontend sends HTTP POST request to Django API
3. Django processes the request and validates data
4. Data is saved to PostgreSQL database
5. API returns success response to frontend

## Technologies Used

- **Django 4.2.7**: Web framework for the backend API
- **Django REST Framework**: For building RESTful APIs
- **PostgreSQL**: Primary database for persistent storage
- **django-cors-headers**: For handling Cross-Origin Resource Sharing (CORS)
- **python-decouple**: For environment variable management
- **psycopg2-binary**: PostgreSQL adapter for Python/Django

## Project Structure

```
backend/
├── backend/
│   ├── manage.py              # Django management script
│   ├── .env                   # Environment variables
│   ├── db.sqlite3            # SQLite database (unused)
│   ├── urls.py               # Main URL configuration
│   └── routes/               # Django app directory
│       ├── __init__.py
│       ├── models.py         # Database models
│       ├── views.py          # API view logic
│       ├── serializers.py    # Data serialization
│       ├── urls.py          # App-specific URLs
│       ├── settings.py      # Django settings
│       ├── wsgi.py         # WSGI configuration
│       ├── asgi.py         # ASGI configuration
│       └── migrations/     # Database migrations
│           ├── __init__.py
│           ├── 0001_initial.py
│           ├── 0002_alter_route_route_id.py
│           └── 0003_auto_20251113_0622.py
```

## Database Configuration

### PostgreSQL Setup

The application uses PostgreSQL as the primary database with the following configuration:

```python
DATABASES = {
    "default": {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'cycle-ai',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5433',
    }
}
```

### Environment Variables

Database configuration is managed through environment variables in `.env`:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=cycle-ai

# Django Configuration
DJANGO_SECRET_KEY=django-insecure-your-secret-key-here
DJANGO_DEBUG=True
```

### Route Model

```python
class Route(models.Model):
    route_id = models.AutoField(primary_key=True)
    start_location = models.CharField(max_length=100)
    end_location = models.CharField(max_length=100)

    def __str__(self):
        return f"Route {self.route_id}: {self.start_location} → {self.end_location}"
```

**Database Table**: `routes_route`

## API Endpoints

### Base URL

```
http://localhost:8000
```

### 1. Root Endpoint

- **URL**: `/`
- **Method**: `GET`
- **Description**: API welcome message with available endpoints
- **Response**:

```json
{
  "message": "Welcome to Cycle AI Backend API",
  "endpoints": {
    "admin": "/admin/",
    "routes": "/api/routes/"
  }
}
```

### 2. List All Routes

- **URL**: `/api/routes/`
- **Method**: `GET`
- **Description**: Retrieve all routes from the database
- **Response**:

```json
{
  "message": "Routes retrieved successfully",
  "routes": [
    {
      "route_id": 1,
      "start_location": "Start Address",
      "end_location": "End Address"
    }
  ]
}
```

### 3. Create New Route

- **URL**: `/api/routes/add/`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Description**: Create a new route entry
- **Request Body**:

```json
{
  "start_location": "Start Address",
  "end_location": "End Address"
}
```

- **Success Response** (201 Created):

```json
{
  "message": "Route created successfully",
  "route": {
    "route_id": 1,
    "start_location": "Start Address",
    "end_location": "End Address"
  }
}
```

- **Error Response** (400 Bad Request):

```json
{
  "message": "Invalid data",
  "errors": {
    "start_location": ["This field is required."]
  }
}
```

### 4. Django Admin

- **URL**: `/admin/`
- **Method**: `GET`
- **Description**: Django administration interface
- **Authentication**: Required (superuser credentials)

## Setup Instructions

### Prerequisites

- Python 3.8+
- PostgreSQL server running on port 5433
- pip package manager

### Installation Steps

1. **Navigate to backend directory**:

```bash
cd my-app/backend/backend
```

2. **Install required packages**:

```bash
pip install django djangorestframework django-cors-headers python-decouple psycopg2-binary
```

3. **Configure environment variables**:
   Create/update `.env` file with your database credentials

4. **Run database migrations**:

```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Start the development server**:

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## Important Commands

### Database Management

```bash
# Create new migrations
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate

# Access database shell
python manage.py dbshell

# Access Django shell with models
python manage.py shell
```

### Server Management

```bash
# Start development server
python manage.py runserver

# Start server on specific port
python manage.py runserver 8080

# Start server with specific IP
python manage.py runserver 0.0.0.0:8000
```

### Admin Management

```bash
# Create superuser for admin access
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic
```

### Database Testing Commands

```bash
# Test database connection
python manage.py shell -c "from django.db import connection; print(f'Database: {connection.vendor}')"

# Create test route
python manage.py shell -c "from routes.models import Route; Route.objects.create(start_location='Test', end_location='Test2')"

# List all routes
python manage.py shell -c "from routes.models import Route; [print(r) for r in Route.objects.all()]"
```

## Concepts Implemented

### 1. **Model-View-Serializer (MVS) Pattern**

- **Models**: Define database structure (`Route` model)
- **Views**: Handle HTTP requests and business logic (`RouteView`)
- **Serializers**: Convert between Python objects and JSON (`RouteSerializer`)

### 2. **RESTful API Design**

- GET requests for data retrieval
- POST requests for data creation
- Proper HTTP status codes (200, 201, 400, 404)
- JSON request/response format

### 3. **Cross-Origin Resource Sharing (CORS)**

- Configured to allow requests from frontend (localhost:3000)
- Essential for frontend-backend communication
- Secure headers and credentials handling

### 4. **Database Abstraction**

- Django ORM for database operations
- PostgreSQL integration with proper configuration
- Automatic migration system for schema changes

### 5. **Environment-Based Configuration**

- Separation of configuration from code
- Environment variables for sensitive data
- Development/production configuration flexibility

### 6. **API Validation and Error Handling**

- Django REST Framework serialization validation
- Proper error response formatting
- Input sanitization and validation

## Frontend Integration

### CORS Configuration

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### Frontend Request Example

```javascript
const response = await fetch("http://localhost:8000/api/routes/add/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    start_location: "Start Address",
    end_location: "End Address",
  }),
});
```

## Troubleshooting

### Common Issues

#### 1. **ModuleNotFoundError: No module named 'backend'**

- **Solution**: Check `ROOT_URLCONF` in settings.py
- Should be `'urls'` not `'backend.urls'`

#### 2. **CORS Error from Frontend**

- **Solution**: Verify CORS settings in settings.py
- Ensure frontend URL is in `CORS_ALLOWED_ORIGINS`

#### 3. **Database Connection Error**

- **Solution**: Check PostgreSQL is running on port 5433
- Verify credentials in `.env` file
- Test connection: `python manage.py dbshell`

#### 4. **Port Already in Use**

- **Solution**: Kill existing Django process or use different port
- `python manage.py runserver 8080`

#### 5. **Migration Issues**

- **Solution**: Reset migrations if needed
- `python manage.py makemigrations routes`
- `python manage.py migrate`

### Debugging Commands

```bash
# Check database connection
python manage.py shell -c "from django.db import connection; print(connection.vendor)"

# Check installed apps
python manage.py shell -c "from django.conf import settings; print(settings.INSTALLED_APPS)"

# Check current routes
python manage.py shell -c "from routes.models import Route; print(Route.objects.count())"

# Test API endpoint
curl -X GET http://localhost:8000/api/routes/
curl -X POST http://localhost:8000/api/routes/add/ -H "Content-Type: application/json" -d '{"start_location":"Test","end_location":"Test2"}'
```

## Security Considerations

### Development vs Production

**Current Configuration** (Development):

- `DEBUG = True`
- Simple secret key
- CORS allows localhost origins
- No HTTPS enforcement

**Production Recommendations**:

- Set `DEBUG = False`
- Use strong, unique secret key
- Configure CORS for production domains
- Enable HTTPS
- Use environment-specific database credentials
- Implement proper authentication/authorization

### Data Validation

- All input data is validated through Django REST Framework serializers
- XSS protection through Django's built-in security features
- SQL injection prevention through Django ORM

## Performance Considerations

- Database indexing on frequently queried fields
- Connection pooling for PostgreSQL
- API rate limiting (can be implemented)
- Caching strategies for frequent requests

## Future Enhancements

1. **Authentication & Authorization**

   - User registration/login
   - JWT token authentication
   - User-specific routes

2. **Advanced Route Features**

   - Route optimization algorithms
   - GPS coordinates storage
   - Route preferences (avoid hills, traffic, etc.)
   - Route sharing between users

3. **API Improvements**

   - Pagination for route lists
   - Filtering and search capabilities
   - Route update and delete endpoints
   - Bulk operations

4. **Integration Features**
   - Google Maps integration
   - Weather API integration
   - Traffic data integration
   - Export routes to GPX/KML formats

---

**Last Updated**: November 13, 2025
**Django Version**: 4.2.7
**Database**: PostgreSQL on port 5433
**API Base URL**: http://localhost:8000
