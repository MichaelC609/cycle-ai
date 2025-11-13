# Cycle AI Backend Setup & Deployment Guide

## Table of Contents

- [Local Development Setup](#local-development-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Production Deployment](#production-deployment)
- [Docker Setup (Optional)](#docker-setup-optional)
- [Testing](#testing)
- [Maintenance](#maintenance)

## Local Development Setup

### Prerequisites

- Python 3.8 or higher
- PostgreSQL 12 or higher
- pip (Python package installer)
- Git

### Step-by-Step Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd cycle-ai/my-app/backend/backend
   ```

2. **Create virtual environment (recommended):**

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

   If `requirements.txt` doesn't exist, install manually:

   ```bash
   pip install django djangorestframework django-cors-headers python-decouple psycopg2-binary
   ```

4. **Create requirements.txt:**

   ```bash
   pip freeze > requirements.txt
   ```

5. **Configure environment variables:**
   Create `.env` file in the backend directory:

   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5433
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   DB_NAME=cycle-ai

   # Django Configuration
   DJANGO_SECRET_KEY=your-secret-key-here
   DJANGO_DEBUG=True
   ```

6. **Setup database:**

   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py createsuperuser  # Optional
   ```

7. **Start development server:**

   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://localhost:8000`

## Environment Configuration

### Development (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=cycle-ai

# Django
DJANGO_SECRET_KEY=django-insecure-development-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Production (.env.production)

```env
# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USER=your-production-user
DB_PASSWORD=your-secure-password
DB_NAME=cycle_ai_production

# Django
DJANGO_SECRET_KEY=your-very-secure-secret-key
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# CORS
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

## Database Setup

### PostgreSQL Installation

#### macOS (using Homebrew):

```bash
brew install postgresql
brew services start postgresql
createdb cycle-ai
```

#### Ubuntu/Debian:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo -u postgres createdb cycle-ai
```

#### Windows:

1. Download PostgreSQL installer from official website
2. Run installer and follow setup wizard
3. Use pgAdmin or command line to create database

### Database Configuration

1. **Create database user:**

   ```sql
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE "cycle-ai" TO postgres;
   ```

2. **Test connection:**

   ```bash
   python manage.py dbshell
   ```

3. **Apply migrations:**
   ```bash
   python manage.py migrate
   ```

## Production Deployment

### Using Gunicorn + Nginx

1. **Install production dependencies:**

   ```bash
   pip install gunicorn
   ```

2. **Create Gunicorn configuration:**

   ```python
   # gunicorn.conf.py
   bind = "127.0.0.1:8000"
   workers = 3
   worker_class = "sync"
   worker_connections = 1000
   max_requests = 1000
   max_requests_jitter = 50
   timeout = 30
   keepalive = 2
   preload_app = True
   ```

3. **Start Gunicorn:**

   ```bash
   gunicorn --config gunicorn.conf.py routes.wsgi:application
   ```

4. **Nginx configuration:**

   ```nginx
   # /etc/nginx/sites-available/cycle-ai
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /static/ {
           alias /path/to/your/static/files/;
       }
   }
   ```

### Using Docker

1. **Create Dockerfile:**

   ```dockerfile
   # Dockerfile
   FROM python:3.11-slim

   WORKDIR /app

   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   COPY . .

   EXPOSE 8000

   CMD ["gunicorn", "--bind", "0.0.0.0:8000", "routes.wsgi:application"]
   ```

2. **Create docker-compose.yml:**

   ```yaml
   # docker-compose.yml
   version: "3.8"

   services:
     db:
       image: postgres:13
       environment:
         POSTGRES_DB: cycle-ai
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: password
       volumes:
         - postgres_data:/var/lib/postgresql/data
       ports:
         - "5432:5432"

     web:
       build: .
       ports:
         - "8000:8000"
       environment:
         - DB_HOST=db
         - DB_PORT=5432
         - DB_NAME=cycle-ai
         - DB_USER=postgres
         - DB_PASSWORD=password
       depends_on:
         - db
       volumes:
         - .:/app

   volumes:
     postgres_data:
   ```

3. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

## Docker Setup (Optional)

### Development Docker Setup

1. **Create Dockerfile:**

   ```dockerfile
   FROM python:3.11-slim

   # Set environment variables
   ENV PYTHONDONTWRITEBYTECODE 1
   ENV PYTHONUNBUFFERED 1

   # Set work directory
   WORKDIR /app

   # Install dependencies
   COPY requirements.txt /app/
   RUN pip install --upgrade pip && pip install -r requirements.txt

   # Copy project
   COPY . /app/

   # Collect static files
   RUN python manage.py collectstatic --noinput

   # Expose port
   EXPOSE 8000

   # Run server
   CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
   ```

2. **Build and run:**
   ```bash
   docker build -t cycle-ai-backend .
   docker run -p 8000:8000 --env-file .env cycle-ai-backend
   ```

## Testing

### Unit Tests

1. **Create test file:**

   ```python
   # routes/tests.py
   from django.test import TestCase
   from django.urls import reverse
   from rest_framework.test import APITestCase
   from rest_framework import status
   from .models import Route

   class RouteModelTest(TestCase):
       def test_route_creation(self):
           route = Route.objects.create(
               start_location="Test Start",
               end_location="Test End"
           )
           self.assertEqual(str(route), f"Route {route.route_id}: Test Start → Test End")

   class RouteAPITest(APITestCase):
       def test_create_route(self):
           url = reverse('add-route')
           data = {
               'start_location': 'Test Start',
               'end_location': 'Test End'
           }
           response = self.client.post(url, data, format='json')
           self.assertEqual(response.status_code, status.HTTP_201_CREATED)
           self.assertEqual(Route.objects.count(), 1)
   ```

2. **Run tests:**
   ```bash
   python manage.py test
   ```

### API Testing

1. **Test with curl:**

   ```bash
   # Test GET endpoint
   curl -X GET http://localhost:8000/api/routes/

   # Test POST endpoint
   curl -X POST http://localhost:8000/api/routes/add/ \
        -H "Content-Type: application/json" \
        -d '{"start_location": "Test", "end_location": "Test2"}'
   ```

2. **Test with Python:**

   ```python
   import requests

   # Test API endpoints
   base_url = "http://localhost:8000"

   # GET request
   response = requests.get(f"{base_url}/api/routes/")
   print(response.json())

   # POST request
   data = {"start_location": "Test", "end_location": "Test2"}
   response = requests.post(f"{base_url}/api/routes/add/", json=data)
   print(response.json())
   ```

## Maintenance

### Regular Tasks

1. **Database backup:**

   ```bash
   # Daily backup
   pg_dump -h localhost -p 5433 -U postgres cycle-ai > backup_$(date +%Y%m%d).sql
   ```

2. **Log rotation:**

   ```bash
   # Setup logrotate for Django logs
   sudo nano /etc/logrotate.d/django
   ```

3. **Update dependencies:**
   ```bash
   pip list --outdated
   pip install --upgrade package_name
   pip freeze > requirements.txt
   ```

### Monitoring

1. **Health check endpoint:**
   Add to `urls.py`:

   ```python
   def health_check(request):
       return JsonResponse({"status": "healthy", "timestamp": timezone.now()})

   urlpatterns = [
       path('health/', health_check),
       # ... other patterns
   ]
   ```

2. **Database monitoring:**
   ```bash
   # Check active connections
   python manage.py shell -c "
   from django.db import connection
   cursor = connection.cursor()
   cursor.execute('SELECT count(*) FROM pg_stat_activity;')
   print(f'Active connections: {cursor.fetchone()[0]}')
   "
   ```

### Security Updates

1. **Regular security checks:**

   ```bash
   pip audit
   python manage.py check --deploy
   ```

2. **Update Django and dependencies regularly**
3. **Monitor Django security releases**
4. **Review and update CORS settings**
5. **Implement rate limiting for production**

### Performance Optimization

1. **Database query optimization:**

   ```bash
   # Enable query logging
   python manage.py shell -c "
   from django.conf import settings
   settings.LOGGING['loggers']['django.db.backends'] = {
       'level': 'DEBUG',
       'handlers': ['console'],
   }
   "
   ```

2. **Add database indexes:**

   ```python
   # In models.py
   class Route(models.Model):
       # ... existing fields

       class Meta:
           indexes = [
               models.Index(fields=['start_location']),
               models.Index(fields=['end_location']),
           ]
   ```

3. **Implement caching:**
   ```python
   # In settings.py
   CACHES = {
       'default': {
           'BACKEND': 'django.core.cache.backends.redis.RedisCache',
           'LOCATION': 'redis://127.0.0.1:6379/1',
       }
   }
   ```

---

**Last Updated**: November 13, 2025
**Supported Python Versions**: 3.8+
**Supported Django Versions**: 4.2+
