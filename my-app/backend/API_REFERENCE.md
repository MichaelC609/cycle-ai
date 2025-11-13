# Cycle AI API Reference

## Quick Start

### Base URL

```
http://localhost:8000
```

### Authentication

Currently no authentication required (development mode)

## Endpoints

### GET /

Welcome message and API information

**Response:**

```json
{
  "message": "Welcome to Cycle AI Backend API",
  "endpoints": {
    "admin": "/admin/",
    "routes": "/api/routes/"
  }
}
```

### GET /api/routes/

List all routes

**Response:**

```json
{
  "message": "Routes retrieved successfully",
  "routes": [
    {
      "route_id": 1,
      "start_location": "6105 Passons Blvd, Pico Rivera, California",
      "end_location": "Cal Poly Pomona"
    },
    {
      "route_id": 2,
      "start_location": "Test Start",
      "end_location": "Test End"
    }
  ]
}
```

### POST /api/routes/add/

Create a new route

**Request Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "start_location": "Starting address or location",
  "end_location": "Destination address or location"
}
```

**Success Response (201 Created):**

```json
{
  "message": "Route created successfully",
  "route": {
    "route_id": 3,
    "start_location": "Starting address or location",
    "end_location": "Destination address or location"
  }
}
```

**Error Response (400 Bad Request):**

```json
{
  "message": "Invalid data",
  "errors": {
    "start_location": ["This field is required."],
    "end_location": ["This field is required."]
  }
}
```

## Error Codes

| Status Code | Meaning                    |
| ----------- | -------------------------- |
| 200         | Success                    |
| 201         | Created                    |
| 400         | Bad Request - Invalid data |
| 404         | Not Found                  |
| 500         | Internal Server Error      |

## CORS Configuration

The API allows requests from:

- `http://localhost:3000`
- `http://127.0.0.1:3000`

## Rate Limiting

Currently no rate limiting implemented (development mode)

## Data Models

### Route Model

```python
{
    "route_id": "integer (auto-generated primary key)",
    "start_location": "string (max 100 characters)",
    "end_location": "string (max 100 characters)"
}
```

## Example Usage

### JavaScript/Frontend

```javascript
// Get all routes
const routes = await fetch("http://localhost:8000/api/routes/").then(
  (response) => response.json()
);

// Create new route
const newRoute = await fetch("http://localhost:8000/api/routes/add/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    start_location: "Los Angeles, CA",
    end_location: "San Francisco, CA",
  }),
}).then((response) => response.json());
```

### cURL

```bash
# Get all routes
curl -X GET http://localhost:8000/api/routes/

# Create new route
curl -X POST http://localhost:8000/api/routes/add/ \
  -H "Content-Type: application/json" \
  -d '{"start_location": "Los Angeles, CA", "end_location": "San Francisco, CA"}'
```

### Python requests

```python
import requests

# Get all routes
response = requests.get('http://localhost:8000/api/routes/')
routes = response.json()

# Create new route
data = {
    'start_location': 'Los Angeles, CA',
    'end_location': 'San Francisco, CA'
}
response = requests.post('http://localhost:8000/api/routes/add/', json=data)
new_route = response.json()
```
