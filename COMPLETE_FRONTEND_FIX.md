# Complete Fix for Hosted Frontend Issues

## Problems Identified

1. **"Failed to fetch" error:**

   - Frontend is using placeholder URL: `https://your-backend-domain.com`
   - Should use: `https://9uwp8ycrdq.us-east-1.awsapprunner.com`
   - CORS error because backend doesn't allow frontend domain

2. **Google login button not showing:**

   - `VITE_GOOGLE_CLIENT_ID` not set during Docker build

3. **Region mismatch (not the issue):**
   - Backend: `us-east-1` ✅ (OK)
   - Frontend: `us-west-2` ✅ (OK)
   - Cross-region is fine - the issue is configuration, not region

## Solution: Two-Part Fix

### Part 1: Fix Backend CORS (Update Backend Code)

The backend needs to allow requests from your frontend domain.

1. **Backend CORS is already updated** in `main.py` to include:

   - `https://y55dfkjshm.us-west-2.awsapprunner.com`
   - `https://*.awsapprunner.com`

2. **Rebuild Backend:**
   - Trigger CodeBuild for backend (`TrackerAPI`)
   - Wait for build to complete
   - App Runner will auto-deploy new backend

### Part 2: Fix Frontend Environment Variables (CodeBuild)

The frontend needs correct environment variables during Docker build.

#### Step 1: Select Operating System

1. **In CodeBuild Environment section:**
   - **Operating system:** Select "Amazon Linux 2" (from dropdown)
   - This removes the error

#### Step 2: Add Environment Variables

1. **Scroll down** past Operating system section
2. **Find "Environment variables" section**
3. **Click "Add environment variable"** and add these 3:

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

4. **Save Changes:**
   - Scroll to bottom
   - Click "Update environment" or "Save"

#### Step 3: Rebuild Frontend Docker Image

1. **Go to CodeBuild Console:**
   - Project: `TrackerUI`
   - Click "Start build"
   - Wait for completion (5-10 minutes)

#### Step 4: Rebuild App Runner Frontend

1. **Go to App Runner Console:**
   - Service: `service_track_ui`
   - Click "Rebuild" button
   - Wait for deployment (3-5 minutes)

### Part 3: Update Google OAuth Redirect URI

1. **Get Frontend URL:**

   - `https://y55dfkjshm.us-west-2.awsapprunner.com`

2. **Update Google Cloud Console:**
   - Go to: https://console.cloud.google.com/
   - APIs & Services → Credentials
   - Edit OAuth 2.0 Client ID
   - Add authorized redirect URI:
     ```
     https://y55dfkjshm.us-west-2.awsapprunner.com/auth/google/callback
     ```
   - Save changes

## Why Region Mismatch is OK

- **Backend in `us-east-1`:** ✅ Fine
- **Frontend in `us-west-2`:** ✅ Fine
- **Cross-region communication:** ✅ Works perfectly
- **The real issues:**
  1. Frontend using wrong backend URL (placeholder)
  2. Backend CORS not allowing frontend domain
  3. Google Client ID not set

## Verification Steps

After completing all fixes:

1. **Open Frontend:**

   - `https://y55dfkjshm.us-west-2.awsapprunner.com/login`
   - Open browser console (F12)

2. **Check Console Logs:**

   - Should see: `🔍 VITE_API_BASE_URL: https://9uwp8ycrdq.us-east-1.awsapprunner.com`
   - Should see: `🔍 VITE_GOOGLE_CLIENT_ID: 129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c...`
   - Should see: `✅ Google Sign-In initialized successfully`
   - Should NOT see: `https://your-backend-domain.com`

3. **Test Login:**
   - Try email/password login
   - Should connect to backend successfully
   - Should NOT see "Failed to fetch" error
   - Google login button should be visible

## Complete Checklist

### Backend:

- [ ] CORS updated to allow `https://y55dfkjshm.us-west-2.awsapprunner.com`
- [ ] Backend CodeBuild triggered and completed
- [ ] Backend App Runner redeployed

### Frontend:

- [ ] Operating system selected: "Amazon Linux 2"
- [ ] Environment variables set in CodeBuild:
  - [ ] `VITE_API_BASE_URL=https://9uwp8ycrdq.us-east-1.awsapprunner.com`
  - [ ] `VITE_GOOGLE_CLIENT_ID=129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com`
  - [ ] `VITE_HUGGINGFACE_API_KEY=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`
- [ ] Frontend CodeBuild triggered and completed
- [ ] Frontend App Runner rebuilt

### Google OAuth:

- [ ] Redirect URI added: `https://y55dfkjshm.us-west-2.awsapprunner.com/auth/google/callback`

## Expected Result

After all fixes:

- ✅ Login works (connects to correct backend)
- ✅ Google login button visible
- ✅ No CORS errors
- ✅ No "Failed to fetch" errors
- ✅ All features working
