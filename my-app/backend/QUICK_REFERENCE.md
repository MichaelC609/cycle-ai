# Cycle AI Backend - Quick Reference

## 🚀 Quick Start Commands

```bash
# Navigate to backend directory
cd my-app/backend/backend

# Start development server
python manage.py runserver

# Apply database migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Access Django shell
python manage.py shell
```

## 📊 Database Commands

```bash
# Check database connection
python manage.py shell -c "from django.db import connection; print(f'Database: {connection.vendor}')"

# List all routes
python manage.py shell -c "from routes.models import Route; [print(r) for r in Route.objects.all()]"

# Create test route
python manage.py shell -c "from routes.models import Route; Route.objects.create(start_location='Test', end_location='Test2')"

# Count routes
python manage.py shell -c "from routes.models import Route; print(f'Total routes: {Route.objects.count()}')"
```

## 🌐 API Endpoints

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| GET    | `/`                | API welcome message |
| GET    | `/api/routes/`     | List all routes     |
| POST   | `/api/routes/add/` | Create new route    |
| GET    | `/admin/`          | Django admin panel  |

## 📝 Test API with curl

```bash
# Get all routes
curl -X GET http://localhost:8000/api/routes/

# Create new route
curl -X POST http://localhost:8000/api/routes/add/ \
  -H "Content-Type: application/json" \
  -d '{"start_location": "Los Angeles", "end_location": "San Francisco"}'
```

## 🔧 Common Issues & Solutions

| Issue               | Solution                                      |
| ------------------- | --------------------------------------------- |
| ModuleNotFoundError | Check `ROOT_URLCONF = 'urls'` in settings.py  |
| CORS Error          | Verify frontend URL in `CORS_ALLOWED_ORIGINS` |
| Database Error      | Check PostgreSQL is running on port 5433      |
| Port in use         | Use `python manage.py runserver 8080`         |

## 📁 Key Files

```
backend/
├── .env                    # Environment variables
├── manage.py              # Django management
├── urls.py               # Main URL config
└── routes/
    ├── models.py         # Route model
    ├── views.py          # API views
    ├── serializers.py    # Data serialization
    ├── urls.py          # App URLs
    └── settings.py      # Django settings
```

## 🗄️ Database Schema

```sql
Table: routes_route
┌───────────────┬─────────────┬─────────────────┐
│ route_id      │ SERIAL      │ PRIMARY KEY     │
│ start_location│ VARCHAR(100)│ NOT NULL        │
│ end_location  │ VARCHAR(100)│ NOT NULL        │
└───────────────┴─────────────┴─────────────────┘
```

## 🔒 Environment Variables

```env
# Required in .env file
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=cycle-ai
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
```

## 📦 Required Packages

```bash
pip install django djangorestframework django-cors-headers python-decouple psycopg2-binary
```

## 🔍 Debugging

```bash
# Check Django version
python -m django --version

# Check installed packages
pip list

# Test database shell
python manage.py dbshell

# Check migrations status
python manage.py showmigrations
```

## 🚦 Server Status

- **Development**: `http://localhost:8000`
- **Database**: PostgreSQL on `localhost:5433`
- **Frontend**: `http://localhost:3000` (Next.js)

---

_Last updated: November 13, 2025_
