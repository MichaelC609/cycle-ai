# Production Deployment Guide

Complete step-by-step instructions for deploying Cycle AI to production.

## 📋 Prerequisites

- GitHub account
- Vercel account (free tier available)
- Render account (free tier available)
- Google Maps API key
- Your repository pushed to GitHub

---

## Part 1: Deploy Backend to Render with PostgreSQL

### Step 1: Create Render Account & PostgreSQL Database

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"PostgreSQL"**
3. Configure database:
   - **Name**: `cycle-ai-db`
   - **Database**: `cycle_ai_production`
   - **User**: (auto-generated, note it down)
   - **Region**: Choose closest to you
   - **Plan**: Free tier
4. Click **"Create Database"**
5. **IMPORTANT**: On the database page, note down:
   - Internal Database URL (starts with `postgres://...`)
   - Hostname
   - Port
   - Database name
   - Username
   - Password

### Step 2: Create Django Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (`MichaelC609/cycle-ai`)
3. Configure the service:
   - **Name**: `cycle-ai-backend`
   - **Region**: Same as database
   - **Root Directory**: `my-app/backend/backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command**: `gunicorn routes.wsgi:application`
   - **Plan**: Free tier

### Step 3: Add Environment Variables

In the **Environment** section, add these variables:

```
DJANGO_SECRET_KEY=<generate-secure-random-key-50-chars>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=cycle-ai-backend.onrender.com
DB_NAME=cycle_ai_production
DB_USER=<your-db-username-from-step-1>
DB_PASSWORD=<your-db-password-from-step-1>
DB_HOST=<your-db-hostname-from-step-1>
DB_PORT=5432
GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**Note**: Replace `<...>` with actual values. Update `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` after deploying frontend.

**To generate DJANGO_SECRET_KEY**, run locally:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. Once deployed, note your backend URL: `https://cycle-ai-backend.onrender.com`

### Step 5: Run Database Migrations

1. In Render dashboard, go to your web service
2. Click **"Shell"** tab
3. Run:

```bash
python manage.py migrate
python manage.py createsuperuser  # Optional: create admin user
```

### Step 6: Test Backend

Visit `https://cycle-ai-backend.onrender.com/api/routes/` - you should see your API response.

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Add New..."** → **"Project"**

### Step 2: Import Repository

1. Select `MichaelC609/cycle-ai` repository
2. Click **"Import"**

### Step 3: Configure Project

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: Click "Edit" → Select `my-app`
3. **Build Settings**: (leave defaults)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

```
NEXT_PUBLIC_API_URL=https://cycle-ai-backend.onrender.com
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
```

**Note**: Replace with your actual backend URL from Part 1, Step 4.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-5 minutes
3. Note your frontend URL: `https://your-app-name.vercel.app`

---

## Part 3: Connect Frontend & Backend

### Step 1: Update Backend CORS Settings

1. Go to Render dashboard → Your web service
2. Go to **"Environment"** tab
3. Update these variables:
   ```
   DJANGO_ALLOWED_HOSTS=cycle-ai-backend.onrender.com,your-app-name.vercel.app
   CORS_ALLOWED_ORIGINS=https://your-app-name.vercel.app,http://localhost:3000
   ```
4. **Save Changes** (this will redeploy)

### Step 2: Verify Deployment

1. Visit your Vercel app: `https://your-app-name.vercel.app`
2. Test route creation and saving
3. Check browser console for any errors
4. Verify API calls are going to your Render backend

---

## Part 4: Database Migration from SQLite to PostgreSQL

If you have existing data in SQLite that you want to migrate:

### Option A: Manual Migration (Small Dataset)

1. Export data locally:

```bash
cd my-app/backend/backend
python manage.py dumpdata --exclude auth.permission --exclude contenttypes > data.json
```

2. In Render Shell, import data:

```bash
python manage.py loaddata data.json
```

### Option B: Start Fresh

Just let the migrations run on the new PostgreSQL database (already done in Part 1, Step 5).

---

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)

**Vercel (Frontend):**

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

**Render (Backend):**

1. Go to Settings → Custom Domain
2. Add your API subdomain (e.g., `api.yourdomain.com`)
3. Update DNS records
4. Update `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`

### Environment Variables to Update

If you add a custom domain, update:

- Render: `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`
- Vercel: `NEXT_PUBLIC_API_URL`

---

## 🚨 Troubleshooting

### Backend Issues

**"DisallowedHost" error:**

- Add your domain to `DJANGO_ALLOWED_HOSTS` in Render environment variables

**Database connection errors:**

- Verify all DB\_\* environment variables match your PostgreSQL credentials
- Check database is in the same region as web service

**Static files not loading:**

- Ensure `collectstatic` runs in build command
- Check `STATIC_ROOT` is set in settings.py

### Frontend Issues

**API calls failing (CORS):**

- Verify backend URL in `NEXT_PUBLIC_API_URL`
- Check `CORS_ALLOWED_ORIGINS` includes your Vercel domain

**Environment variables not working:**

- Must start with `NEXT_PUBLIC_` for client-side access
- Redeploy after changing environment variables

### Free Tier Limitations

**Render Free Tier:**

- Spins down after 15 minutes of inactivity
- First request after spindown takes 30-60 seconds
- Consider paid tier ($7/month) for always-on

**Vercel Free Tier:**

- 100GB bandwidth/month
- Serverless function execution limits
- Generally sufficient for development/small projects

---

## 📝 Checklist

### Before Deployment

- [ ] Push all code to GitHub
- [ ] Have Google Maps API key ready
- [ ] Create Render account
- [ ] Create Vercel account

### Backend Deployment

- [ ] PostgreSQL database created on Render
- [ ] Web service created and configured
- [ ] Environment variables added
- [ ] Migrations run successfully
- [ ] Backend URL accessible

### Frontend Deployment

- [ ] Project imported to Vercel
- [ ] Root directory set to `my-app`
- [ ] Environment variables configured
- [ ] Frontend deployed successfully
- [ ] Frontend URL accessible

### Final Configuration

- [ ] Backend CORS updated with frontend URL
- [ ] Backend ALLOWED_HOSTS updated
- [ ] Frontend can communicate with backend
- [ ] Routes can be created and saved
- [ ] Google Maps loads correctly

---

## 🎉 Success!

Your app should now be live at:

- **Frontend**: https://your-app-name.vercel.app
- **Backend**: https://cycle-ai-backend.onrender.com

### Next Steps

1. **Monitor logs**: Check Render and Vercel dashboards for errors
2. **Set up monitoring**: Consider tools like Sentry for error tracking
3. **Backup database**: Render free tier doesn't include automated backups
4. **Performance**: Monitor response times and optimize as needed

### Local Development

To continue local development:

1. Keep your local `.env.local` files with `localhost` URLs
2. Run backend: `python manage.py runserver`
3. Run frontend: `npm run dev`

Production and development use different environment variables, so you can work locally without affecting production.
