# Fix Hosted Frontend - Login and Google OAuth Issues

## Problems Identified

1. **"Failed to fetch" error on login:**

   - Frontend is trying to connect to `https://your-backend-domain.com` (placeholder)
   - Should connect to: `https://9uwp8ycrdq.us-east-1.awsapprunner.com`

2. **Google login button not showing:**
   - `VITE_GOOGLE_CLIENT_ID` not set during Docker build
   - GoogleLogin component requires Client ID to initialize

## Solution: Set CodeBuild Environment Variables

### Step 1: Go to CodeBuild Project

1. **Go to CodeBuild Console:**
   - https://console.aws.amazon.com/codesuite/codebuild/projects
   - Click on project: `TrackerUI`
   - Click "Edit"

### Step 2: Add Environment Variables

1. **Go to Environment Section:**

   - Click "Environment" in left sidebar
   - Scroll down to "Environment variables"

2. **Add These Variables:**

   Click "Add environment variable" for each:

   **Variable 1:**

   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://9uwp8ycrdq.us-east-1.awsapprunner.com`
   - **Type:** Plaintext

   **Variable 2:**

   - **Name:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** `129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com`
   - **Type:** Plaintext

   **Variable 3:**

   - **Name:** `VITE_HUGGINGFACE_API_KEY`
   - **Value:** `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`
   - **Type:** Plaintext

3. **Save Changes:**c
   - Click "Update environment"
   - Or click "Save" at the bottom

### Step 3: Rebuild Docker Image

After setting environment variables:

1. **Go to CodeBuild Console**
2. **Project:** `TrackerUI`
3. **Click "Start build"**
4. **Wait for build to complete** (5-10 minutes)

The build will:

- Use the environment variables during Docker build
- Bake them into the frontend application
- Push new image to ECR

### Step 4: Rebuild App Runner Service

After CodeBuild completes:

1. **Go to App Runner Console:**
   - Service: `service_track_ui`
   - Click orange "Rebuild" button
   - Wait for deployment (3-5 minutes)

### Step 5: Update Google OAuth Redirect URI

After frontend is deployed:

1. **Get your frontend App Runner URL:**

   - App Runner service: `service_track_ui`
   - Copy the default domain: `https://y55dfkjshm.us-west-2.awsapprunner.com`

2. **Update Google Cloud Console:**

   - Go to: https://console.cloud.google.com/
   - APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - Add authorized redirect URI:
     ```
     https://y55dfkjshm.us-west-2.awsapprunner.com/auth/google/callback
     ```
   - Save changes

3. **Update Backend CORS:**
   - Make sure backend allows frontend domain
   - Backend should already allow `*.awsapprunner.com`

## Verification

After rebuilding:

1. **Open hosted frontend:**

   - Go to: `https://y55dfkjshm.us-west-2.awsapprunner.com`
   - Open browser console (F12)

2. **Check console logs:**

   - Should see: `🔍 VITE_API_BASE_URL: https://9uwp8ycrdq.us-east-1.awsapprunner.com`
   - Should see: `🔍 VITE_GOOGLE_CLIENT_ID: 129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c...`
   - Should see: `✅ Google Sign-In initialized successfully`

3. **Test login:**
   - Try logging in with email/password
   - Should connect to backend successfully
   - Google login button should be visible

## Quick Checklist

- [ ] CodeBuild environment variables set:
  - [ ] `VITE_API_BASE_URL=https://9uwp8ycrdq.us-east-1.awsapprunner.com`
  - [ ] `VITE_GOOGLE_CLIENT_ID=129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com`
  - [ ] `VITE_HUGGINGFACE_API_KEY=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`
- [ ] CodeBuild build triggered and completed
- [ ] New Docker image pushed to ECR
- [ ] App Runner service rebuilt
- [ ] Google OAuth redirect URI updated
- [ ] Test login on hosted frontend
- [ ] Google login button visible

## Why This Happens

### Issue 1: Wrong Backend URL

- **Root cause:** `VITE_API_BASE_URL` not set during build
- **Result:** Frontend uses placeholder `https://your-backend-domain.com`
- **Fix:** Set in CodeBuild environment variables

### Issue 2: Google Login Not Showing

- **Root cause:** `VITE_GOOGLE_CLIENT_ID` not set during build
- **Result:** GoogleLogin component can't initialize (line 36-39 in GoogleLogin.jsx)
- **Fix:** Set in CodeBuild environment variables

### Why Localhost Works

- Localhost uses `http://localhost:8001` (hardcoded fallback in config.js line 12)
- Localhost might have `.env` file with variables
- Hosted version needs variables baked into Docker image at build time

## Expected Result

After fixing:

- ✅ Login works on hosted frontend
- ✅ Google login button visible
- ✅ Both connect to correct backend URL
- ✅ All features work as expected
