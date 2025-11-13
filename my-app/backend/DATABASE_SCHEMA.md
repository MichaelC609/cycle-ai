# Database Schema Documentation

## Overview

The Cycle AI application uses PostgreSQL as its primary database, running on `localhost:5433` with database name `cycle-ai`.

## Connection Details

- **Host**: localhost
- **Port**: 5433
- **Database**: cycle-ai
- **User**: postgres
- **Engine**: PostgreSQL

## Tables

### routes_route

Main table for storing bicycle route information.

| Column         | Type         | Constraints                 | Description                          |
| -------------- | ------------ | --------------------------- | ------------------------------------ |
| route_id       | SERIAL       | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each route     |
| start_location | VARCHAR(100) | NOT NULL                    | Starting address or location name    |
| end_location   | VARCHAR(100) | NOT NULL                    | Destination address or location name |

**Indexes:**

- Primary key index on `route_id`

**Example Data:**

```sql
route_id | start_location                           | end_location
---------|------------------------------------------|------------------
1        | Test Start                               | Test End
2        | 6105 Passons Blvd, Pico Rivera, California | Cal Poly Pomona
3        | Test Start PG                            | Test End PG
```

### Django System Tables

The following tables are automatically created by Django:

#### auth_user

Stores user accounts for Django admin and authentication.

| Column       | Type         | Description           |
| ------------ | ------------ | --------------------- |
| id           | SERIAL       | Primary key           |
| username     | VARCHAR(150) | Unique username       |
| email        | VARCHAR(254) | Email address         |
| password     | VARCHAR(128) | Hashed password       |
| first_name   | VARCHAR(150) | First name            |
| last_name    | VARCHAR(150) | Last name             |
| is_active    | BOOLEAN      | Account active status |
| is_staff     | BOOLEAN      | Staff status          |
| is_superuser | BOOLEAN      | Superuser status      |
| date_joined  | TIMESTAMP    | Account creation date |
| last_login   | TIMESTAMP    | Last login date       |

#### django_migrations

Tracks applied database migrations.

| Column  | Type         | Description                |
| ------- | ------------ | -------------------------- |
| id      | SERIAL       | Primary key                |
| app     | VARCHAR(255) | Django app name            |
| name    | VARCHAR(255) | Migration filename         |
| applied | TIMESTAMP    | When migration was applied |

#### django_content_type

Django's content type framework.

| Column    | Type         | Description      |
| --------- | ------------ | ---------------- |
| id        | SERIAL       | Primary key      |
| app_label | VARCHAR(100) | Django app label |
| model     | VARCHAR(100) | Model name       |

#### django_session

Stores user session data.

| Column       | Type        | Description          |
| ------------ | ----------- | -------------------- |
| session_key  | VARCHAR(40) | Primary key          |
| session_data | TEXT        | Encoded session data |
| expire_date  | TIMESTAMP   | Session expiration   |

## SQL Queries

### Common Queries

**Get all routes:**

```sql
SELECT * FROM routes_route ORDER BY route_id;
```

**Get specific route:**

```sql
SELECT * FROM routes_route WHERE route_id = 1;
```

**Create new route:**

```sql
INSERT INTO routes_route (start_location, end_location)
VALUES ('Los Angeles, CA', 'San Francisco, CA');
```

**Update route:**

```sql
UPDATE routes_route
SET start_location = 'New Start', end_location = 'New End'
WHERE route_id = 1;
```

**Delete route:**

```sql
DELETE FROM routes_route WHERE route_id = 1;
```

**Count total routes:**

```sql
SELECT COUNT(*) FROM routes_route;
```

### Analytics Queries

**Most common starting locations:**

```sql
SELECT start_location, COUNT(*) as route_count
FROM routes_route
GROUP BY start_location
ORDER BY route_count DESC
LIMIT 10;
```

**Most common destinations:**

```sql
SELECT end_location, COUNT(*) as route_count
FROM routes_route
GROUP BY end_location
ORDER BY route_count DESC
LIMIT 10;
```

## Django ORM Equivalents

### Model Operations

```python
from routes.models import Route

# Get all routes
routes = Route.objects.all()

# Get specific route
route = Route.objects.get(route_id=1)

# Create new route
route = Route.objects.create(
    start_location='Los Angeles, CA',
    end_location='San Francisco, CA'
)

# Update route
route = Route.objects.get(route_id=1)
route.start_location = 'New Start'
route.save()

# Delete route
Route.objects.filter(route_id=1).delete()

# Count routes
count = Route.objects.count()
```

## Migration History

### 0001_initial.py

- Created initial Route model
- Created routes_route table
- Initial schema setup

### 0002_alter_route_route_id.py

- Changed route_id field from BigIntegerField to AutoField
- Updated primary key configuration

### 0003_auto_20251113_0622.py

- Empty migration file for schema synchronization
- Applied to ensure PostgreSQL schema matches Django models

## Backup and Restore

### Backup Database

```bash
# Full database backup
pg_dump -h localhost -p 5433 -U postgres cycle-ai > cycle_ai_backup.sql

# Routes table only
pg_dump -h localhost -p 5433 -U postgres -t routes_route cycle-ai > routes_backup.sql
```

### Restore Database

```bash
# Full database restore
psql -h localhost -p 5433 -U postgres -d cycle-ai < cycle_ai_backup.sql

# Routes table only
psql -h localhost -p 5433 -U postgres -d cycle-ai < routes_backup.sql
```

## Performance Considerations

### Current Optimization

- Primary key index on route_id (automatic)
- Small table size (suitable for current scale)

### Future Optimization Recommendations

1. **Add indexes for frequent queries:**

   ```sql
   CREATE INDEX idx_start_location ON routes_route(start_location);
   CREATE INDEX idx_end_location ON routes_route(end_location);
   ```

2. **Add composite index for route pairs:**

   ```sql
   CREATE INDEX idx_route_pair ON routes_route(start_location, end_location);
   ```

3. **Consider full-text search for location names:**
   ```sql
   CREATE INDEX idx_location_search ON routes_route
   USING gin(to_tsvector('english', start_location || ' ' || end_location));
   ```

## Data Integrity

### Constraints

- NOT NULL constraints on start_location and end_location
- Primary key constraint on route_id

### Validation

- Django model validation ensures data consistency
- Maximum length validation (100 characters) for location fields

## Monitoring Queries

**Check table sizes:**

```sql
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE tablename = 'routes_route';
```

**Check recent route activity:**

```sql
-- Note: Requires adding created_at timestamp field
SELECT COUNT(*) as routes_today
FROM routes_route
WHERE created_at >= CURRENT_DATE;
```

## Future Schema Enhancements

### Proposed Additional Fields

```sql
ALTER TABLE routes_route ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE routes_route ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE routes_route ADD COLUMN user_id INTEGER REFERENCES auth_user(id);
ALTER TABLE routes_route ADD COLUMN distance_km DECIMAL(10,2);
ALTER TABLE routes_route ADD COLUMN estimated_time_minutes INTEGER;
ALTER TABLE routes_route ADD COLUMN route_type VARCHAR(50) DEFAULT 'bicycle';
```

### Proposed New Tables

```sql
-- User preferences
CREATE TABLE route_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth_user(id),
    avoid_hills BOOLEAN DEFAULT FALSE,
    avoid_traffic BOOLEAN DEFAULT FALSE,
    prefer_bike_lanes BOOLEAN DEFAULT TRUE,
    max_distance_km DECIMAL(10,2)
);

-- Route waypoints
CREATE TABLE route_waypoints (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes_route(route_id),
    sequence_order INTEGER,
    location_name VARCHAR(200),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8)
);
```

---

**Database Version**: PostgreSQL (latest)
**Last Schema Update**: November 13, 2025
**Total Tables**: 1 application table + Django system tables
