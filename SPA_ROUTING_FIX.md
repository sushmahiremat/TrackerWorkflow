# SPA Routing Fix for AWS AppRunner - 405 Error Solution

## 🔍 Problem

**Error:** `405 Method Not Allowed` when accessing `/login` or other React routes in production

**Root Cause:**
- AWS AppRunner/Nginx is trying to serve `/login` as a physical file
- React routes don't exist as files - they're handled by the SPA
- Without proper SPA routing, Nginx returns 405 instead of serving `index.html`

## ✅ Solution Implemented

### 1. **Created `public/static.json`** (Option 1 - Best Practice)
   - Location: `TrackerWorkflow/public/static.json`
   - This file tells AppRunner to serve `index.html` for all routes
   - Automatically copied to `dist/` during build by Vite

### 2. **Enhanced `nginx.conf`**
   - Already had SPA routing with `try_files $uri $uri/ /index.html;`
   - Added explicit route handling for common paths
   - Ensures all React routes serve `index.html`

## 📋 Files Created/Modified

1. ✅ `public/static.json` - Created
2. ✅ `nginx.conf` - Enhanced with explicit route handling

## 🚀 Deployment Steps

### Step 1: Rebuild Your Frontend

```bash
cd TrackerWorkflow
npm run build
```

### Step 2: Verify static.json is in dist

After build, check:
```bash
ls dist/static.json
```

Should exist and contain:
```json
{
  "routes": {
    "/**": "index.html"
  }
}
```

### Step 3: Rebuild Docker Image

```bash
docker build -t your-frontend-image .
```

### Step 4: Deploy to AWS AppRunner

Push the new Docker image and deploy.

## 🧪 Testing

### Test 1: Direct Route Access
1. Visit: `https://y55dfkjshm.us-west-2.awsapprunner.com/login`
2. **Expected:** Should show your React login page (not 405)
3. **If still 405:** Check AppRunner configuration

### Test 2: Google OAuth Flow
1. Visit: `https://y55dfkjshm.us-west-2.awsapprunner.com/login`
2. Click "Sign in with Google"
3. **Expected:** 
   - Google redirects to `/login?credential=...`
   - Page loads (not 405)
   - Login processes successfully

### Test 3: Other Routes
Test these routes should all work:
- `/dashboard`
- `/project/123`
- `/recent`
- `/starred`
- `/teams`

## 🔧 If Still Getting 405

### Check 1: Verify static.json in Docker Image

```bash
docker run -it your-frontend-image sh
ls /usr/share/nginx/html/static.json
cat /usr/share/nginx/html/static.json
```

Should show the static.json file.

### Check 2: Verify nginx.conf is Used

```bash
docker run -it your-frontend-image sh
cat /etc/nginx/conf.d/default.conf
```

Should show your nginx.conf with SPA routing.

### Check 3: Test nginx Locally

```bash
docker run -p 8080:80 your-frontend-image
# Visit http://localhost:8080/login
# Should work, not 405
```

### Check 4: AWS AppRunner Configuration

If using AppRunner with custom configuration:
1. Check AppRunner service settings
2. Verify it's using your Dockerfile (not auto-detecting)
3. Check if there are any AppRunner-specific routing rules

## 📝 How It Works

### Before Fix:
```
User → https://y55dfkjshm.../login
     → Nginx looks for /login file
     → File doesn't exist
     → 405 Method Not Allowed ❌
```

### After Fix:
```
User → https://y55dfkjshm.../login
     → Nginx checks static.json or nginx.conf
     → Serves /index.html
     → React loads
     → React Router handles /login route
     → Login page displays ✅
```

## 🎯 Key Points

1. **static.json** - Standard way to configure SPA routing (Vercel, AppRunner compatible)
2. **nginx.conf** - Fallback/primary method for Docker deployments
3. **Both work together** - static.json for AppRunner, nginx.conf for Docker container

## ✅ Verification Checklist

- [ ] `public/static.json` exists
- [ ] `nginx.conf` has SPA routing
- [ ] Built `dist/` folder contains `static.json`
- [ ] Docker image includes `static.json` in `/usr/share/nginx/html/`
- [ ] `/login` route works (not 405)
- [ ] Google OAuth redirect works
- [ ] All React routes work

## 🚨 Important Notes

- **Vite automatically copies** `public/` files to `dist/` root
- **static.json** must be in `public/` folder (source) → gets copied to `dist/` (build output)
- **nginx.conf** is copied to Docker image during build
- Both configurations work together for maximum compatibility

