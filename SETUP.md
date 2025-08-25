# Workflow Tracker - Setup Guide

## Environment Configuration

### Frontend Setup

1. **Copy environment template:**

   ```bash
   cp .env.example .env
   ```

2. **Fill in your environment variables in `.env`:**
   ```env
   VITE_API_BASE_URL=http://localhost:8001
   VITE_GOOGLE_CLIENT_ID=129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com
   ```

### Backend Setup

1. **Copy environment template:**

   ```bash
   cp .env.example .env
   ```

2. **Fill in your environment variables in `.env`:**
   ```env
   DATABASE_URL=postgresql://postgres:123@localhost:5432/TrackerWorkflow
   SECRET_KEY=uygduweydwudywugcgmjkiuytcxzszdsiutuytytrthfd
   GOOGLE_CLIENT_ID=129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=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
   ```

## Vercel Deployment

### Frontend Deployment

1. **Set environment variables in Vercel:**

   - Go to your project → Settings → Environment Variables
   - Add:
     - `VITE_API_BASE_URL` = `https://your-backend-domain.com`
     - `VITE_GOOGLE_CLIENT_ID` = `your-google-client-id`

2. **Deploy:**
   - Push to GitHub
   - Vercel will auto-deploy

### Backend Deployment

1. **Deploy to your preferred hosting service** (Railway, Render, Heroku, etc.)
2. **Set environment variables** in your hosting platform
3. **Update CORS** in `main.py` to include your frontend domain

## Google OAuth Setup

1. **Go to Google Cloud Console**
2. **Add authorized origins:**
   - `http://localhost:5173` (development)
   - `https://your-vercel-domain.vercel.app` (production)
3. **Copy Client ID and Secret** to your environment files

## Security Notes

- **Never commit `.env` files** to Git
- **Use strong secret keys** for JWT
- **Keep Google OAuth credentials secure**
- **Use HTTPS in production**

## Development Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
python main.py       # Start development server
```
