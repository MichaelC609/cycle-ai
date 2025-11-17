# Map & Route Feature Implementation Documentation

## Overview

The Map component provides an interactive Google Maps interface for finding and displaying bicycle routes between two locations. Users can enter start and end locations, view multiple route alternatives, and click to select different routes.

## Architecture

### Component Structure

- **File**: `app/components/Map.jsx`
- **Type**: Client-side React component
- **External Dependencies**:
  - `@react-google-maps/api` for Google Maps integration
  - Google Maps JavaScript API
  - Google Places API (New)
  - Google Routes API

### State Management

```javascript
const [start, setStart] = useState(""); // Start location text input
const [end, setEnd] = useState(""); // End location text input
const [routes, setRoutes] = useState([]); // Array of decoded route paths
const [selectedRoute, setSelectedRoute] = useState(0); // Index of currently selected route
const mapRef = useRef(null); // Reference to Google Map instance
```

## API Integration

### 1. Places API (New) - Geocoding

**Purpose**: Convert text addresses to geographic coordinates

**Endpoint**: `https://places.googleapis.com/v1/places:searchText`

**Implementation**:

```javascript
async function geocodePlaceText(query)
```

**Request Format**:

- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `X-Goog-Api-Key: [API_KEY]`
  - `X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.location`
- **Body**:
  ```json
  {
    "textQuery": "Santa Monica Pier, CA"
  }
  ```

**Response Handling**:

- Extracts latitude/longitude from first matching place
- Returns `{ latitude: number, longitude: number }` or `null`
- Includes error logging for debugging

**Error Handling**:

- Checks for missing API key
- Validates HTTP response status
- Parses and logs detailed error messages
- Returns `null` on failure

### 2. Routes API - Route Calculation

**Purpose**: Calculate bicycle routes between two coordinates

**Endpoint**: `https://routes.googleapis.com/directions/v2:computeRoutes`

**Implementation**:

```javascript
async function requestBikeRoutes(origin, destination)
```

**Request Format**:

- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `X-Goog-Api-Key: [API_KEY]`
  - `X-Goog-FieldMask: routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline`
- **Body**:
  ```json
  {
    "origin": {
      "location": { "latLng": { "latitude": 34.0, "longitude": -118.5 } }
    },
    "destination": {
      "location": { "latLng": { "latitude": 34.1, "longitude": -118.3 } }
    },
    "travelMode": "BICYCLE",
    "computeAlternativeRoutes": true,
    "polylineQuality": "HIGH_QUALITY",
    "polylineEncoding": "ENCODED_POLYLINE"
  }
  ```

**Response Handling**:

- Returns array of route objects
- Each route contains encoded polyline, distance, and duration
- Returns empty array `[]` on failure

**Features**:

- Multiple alternative routes
- Optimized for bicycle travel
- High-quality polyline encoding for smooth route visualization

### 3. Polyline Decoding

**Purpose**: Convert Google's encoded polyline format to coordinate arrays

**Implementation**:

```javascript
function decodePolyline(encoded)
```

**Process**:

1. Uses `google.maps.geometry.encoding.decodePath()` to decode
2. Converts Google Maps LatLng objects to plain objects
3. Returns array of `{ lat: number, lng: number }` objects

## User Flow

### 1. Location Input

```
User enters start location → setStart()
User enters end location → setEnd()
User clicks "Find Bike Routes" → handleSubmit()
```

### 2. Form Submission Process

```
handleSubmit() is triggered
    ↓
Validate inputs (non-empty)
    ↓
Geocode start location → geocodePlaceText(start)
    ↓
Check if origin found (show error alert if not)
    ↓
Geocode end location → geocodePlaceText(end)
    ↓
Check if destination found (show error alert if not)
    ↓
Request bike routes → requestBikeRoutes(origin, destination)
    ↓
Check if routes found (show error alert if not)
    ↓
Decode all route polylines → routes.map(decodePolyline)
    ↓
Update state: setRoutes(decoded), setSelectedRoute(0)
    ↓
Fit map to show first route → map.fitBounds()
```

### 3. Route Selection

```
User hovers over route → Cursor changes (clickable)
User clicks on route → setSelectedRoute(index)
Map updates → Selected route highlighted
```

## Visual Design

### Route Styling

**Selected Route**:

- Color: Black (`#000000`)
- Opacity: 100% (`1.0`)
- Weight: 6px

**Unselected Routes**:

- Color: Gray (`#888888`)
- Opacity: 60% (`0.6`)
- Weight: 4px

### Map Configuration

- **Default Center**: Los Angeles (34.0522°N, 118.2437°W)
- **Default Zoom**: 12
- **Container Height**: 600px
- **Width**: 100%

### Form Styling

- Background: Light gray (`bg-gray-100`)
- Padding: 12px (`p-3`)
- Border radius: Medium (`rounded-md`)
- Button: Black background with white text
- Inputs: Full width with border

## Error Handling

### User-Facing Errors

1. **Empty Input Fields**:

   - Alert: "Please enter both start and end locations."

2. **Start Location Not Found**:

   - Alert: "Unable to find start location: "{location}". Try a more specific place name (e.g., "123 Main St, Los Angeles, CA")."

3. **End Location Not Found**:

   - Alert: "Unable to find end location: "{location}". Try a more specific place name (e.g., "456 Oak Ave, Los Angeles, CA")."

4. **No Routes Found**:
   - Alert: "No bike routes found between these locations. Try different locations."

### Console Logging

All API operations include detailed console logging:

- Geocoding queries and responses
- Route requests and responses
- Error details with status codes
- Found location addresses
- Decoded polyline data

## Environment Configuration

### Required Environment Variables

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Note**: The `NEXT_PUBLIC_` prefix is required for client-side access in Next.js.

### Required Google Cloud APIs

1. **Maps JavaScript API** - For map display
2. **Places API (New)** - For geocoding (NOT the old Places API)
3. **Routes API** - For route calculation (NOT Directions API)

### API Key Configuration

The API key must be configured in Google Cloud Console with:

- All three APIs enabled
- Appropriate API restrictions (optional but recommended)
- HTTP referrer restrictions (for production):
  - `http://localhost:3000/*` (development)
  - Your production domain

## Google Maps Provider Setup

### Provider Component

**File**: `app/GoogleMapsProvider.jsx`

**Libraries Loaded**:

```javascript
libraries: ["places", "geometry"];
```

- **places**: Required for Places API functionality
- **geometry**: Required for polyline decoding

**Configuration**:

```javascript
{
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  libraries: ["places", "geometry"],
  version: "weekly"
}
```

### Usage Pattern

The Map component must be wrapped with GoogleMapsProvider:

```jsx
<GoogleMapsProvider>
  <Map />
</GoogleMapsProvider>
```

## Interactive Features

### Route Selection

- **Click Handler**: `onClick={() => setSelectedRoute(index)}`
- **Visual Feedback**: Selected route becomes bold and black
- **Cursor**: Changes to pointer on hover (via `clickable: true`)

### Map Interactions

- **Zoom**: Mouse wheel or +/- controls
- **Pan**: Click and drag
- **Auto-fit**: Map automatically fits bounds to show entire first route

## Performance Considerations

### API Calls

- Geocoding: 2 API calls per form submission (start + end)
- Routes: 1 API call per form submission
- Total: 3 API calls per route search

### Rate Limiting

Google Maps APIs have generous free tier:

- **Places API (New)**: $200/month free (~17,000 requests)
- **Routes API**: $200/month free (~40,000 requests)
- **Maps JavaScript API**: $200/month free (~28,000 map loads)

### Optimization Opportunities

1. **Caching**: Could cache geocoded locations
2. **Debouncing**: Could add debounce to form inputs
3. **Loading States**: Could add loading spinners during API calls

## Testing Recommendations

### Sample Locations

**Short Routes**:

- Santa Monica Pier, CA → Venice Beach, CA
- Griffith Observatory, Los Angeles → Hollywood Sign, Los Angeles

**Medium Routes**:

- UCLA, Los Angeles, CA → Santa Monica Beach, CA
- Downtown Los Angeles → Pasadena, CA

**Long Routes**:

- San Francisco, CA → San Jose, CA
- Los Angeles, CA → San Diego, CA

### Edge Cases to Test

1. Invalid/nonexistent locations
2. Very long routes
3. International locations
4. Locations without bike routes
5. Special characters in location names

## Common Issues & Solutions

### Issue: "Places API (New) has not been used"

**Solution**: Enable Places API (New) in Google Cloud Console

### Issue: "API key not valid"

**Solution**: Check that API key is correctly set in `.env.local`

### Issue: "No routes found"

**Solution**:

- Verify Routes API is enabled
- Check that locations are bike-accessible
- Try more specific location names

### Issue: Routes not displaying

**Solution**:

- Check browser console for errors
- Verify geometry library is loaded
- Ensure polyline data is being decoded correctly

## Future Enhancement Ideas

1. **Route Information Display**:

   - Show distance and duration for each route
   - Display elevation changes
   - Show route difficulty

2. **Waypoints**:

   - Allow multiple stops along the route
   - Drag and drop route modification

3. **Save Routes**:

   - Save favorite routes
   - Share routes with others

4. **Real-time Updates**:

   - Traffic conditions
   - Weather along route
   - Bike lane availability

5. **User Preferences**:
   - Route preferences (safest, fastest, most scenic)
   - Avoid certain road types
   - Preferred bike lane types

## Code Maintenance

### Key Files

- `app/components/Map.jsx` - Main map component
- `app/GoogleMapsProvider.jsx` - Google Maps API loader
- `.env.local` - API key configuration
- `GOOGLE_MAPS_SETUP.md` - Setup instructions

### Dependencies

- `@react-google-maps/api`: ^2.x
- React: 18.x
- Next.js: 14.x

### Browser Support

- Modern browsers with ES6+ support
- Requires JavaScript enabled
- Responsive design for mobile devices
