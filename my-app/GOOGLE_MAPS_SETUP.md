# Google Maps API Setup Guide

## 🗺️ Setting up Google Maps for the Route Optimizer

The route optimizer requires a valid Google Maps API key to function properly. Follow these steps to get it working:

### Step 1: Get a Google Maps API Key

1. **Go to Google Cloud Console:**

   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a new project** (or select an existing one):

   - Click "Select a project" → "New Project"
   - Give it a name like "Cycle AI Route Optimizer"
   - Click "Create"

3. **Enable the required APIs:**

   - Go to "APIs & Services" → "Library"
   - Search for and enable these APIs:
     - **Maps JavaScript API** (for displaying maps)
     - **Routes API** (for calculating bicycle routes - NEW API)
     - **Places API (New)** (for geocoding locations - NEW API)

   > ⚠️ **Important:** Make sure to enable "Places API (New)" and "Routes API", not the older "Directions API" and "Places API". The new APIs provide better results and more features.

4. **Create credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key (it will look like: `<API Key>`)

### Step 2: Configure the API Key

1. **Update your `.env.local` file:**

   ```env
   NEXT_PUBLIC_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```

   Replace `YOUR_ACTUAL_API_KEY_HERE` with the API key you copied.

2. **Restart the development server:**
   ```bash
   npm run dev
   ```

### Step 3: Set API Restrictions (Recommended for Security)

1. **Go back to Google Cloud Console:**

   - Navigate to "APIs & Services" → "Credentials"
   - Click on your API key to edit it

2. **Set application restrictions:**

   - Choose "HTTP referrers (websites)"
   - Add these referrers:
     - `http://localhost:3000/*` (for development)
     - `http://localhost:3001/*` (alternative dev port)
     - Add your production domain when you deploy

3. **Set API restrictions:**
   - Select "Restrict key"
   - Choose the APIs you enabled:
     - Maps JavaScript API
     - Routes API
     - Places API (New)

### Step 4: Verify Setup

1. **Refresh your application** - the map should now load properly
2. **Test the functionality:**
   - Try entering addresses
   - Use the sample route buttons
   - Calculate a route to see if everything works

### 📊 Free Tier Limits

Google Maps API provides a generous free tier:

- **Maps JavaScript API:** $200 free per month (28,000+ map loads)
- **Directions API:** $200 free per month (40,000+ requests)
- **Places API:** $200 free per month (17,000+ requests)

This should be more than enough for development and moderate usage.

### 🚨 Troubleshooting

**If you still see "This page can't load Google Maps correctly":**

1. **Check the browser console** for specific error messages
2. **Verify your API key** is correctly set in `.env.local`
3. **Make sure you enabled all required APIs** in Google Cloud Console
4. **Check API restrictions** - they might be too restrictive
5. **Restart your development server** after changing the API key

**Common Error Messages:**

- `RefererNotAllowedMapError` → Check HTTP referrer restrictions
- `InvalidKeyMapError` → API key is invalid or not set
- `ApiNotActivatedMapError` → Enable the required APIs in Google Cloud Console

### 💡 Tips

- **Keep your API key secure** - never commit it to public repositories
- **Monitor your usage** in Google Cloud Console to avoid unexpected charges
- **Consider setting up billing alerts** to track API usage
- **Use API restrictions** to prevent unauthorized usage

Once configured properly, the route optimizer will provide:

- ✅ Interactive Google Maps with cycling routes
- ✅ Address autocomplete functionality
- ✅ Real-time route calculation with distance and duration
- ✅ Optimized cycling paths that avoid highways and tolls
