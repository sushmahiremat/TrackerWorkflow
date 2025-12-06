# CRITICAL FIX: Environment Variables Not Being Set

## Problem

The console shows **ALL environment variables are EMPTY**:

```
VITE_API_BASE_URL: ""
VITE_GOOGLE_CLIENT_ID: ""
VITE_HUGGINGFACE_API_KEY: ""
```

This means the environment variables were **NOT set in CodeBuild** or were **NOT passed to Docker build**.

## Root Cause

The environment variables must be set in **CodeBuild project settings** BEFORE building. If they're not set there, the Docker build receives empty values.

## Solution: Verify and Set Environment Variables in CodeBuild

### Step 1: Check CodeBuild Project Settings

1. **Go to CodeBuild Console:**

   - https://console.aws.amazon.com/codesuite/codebuild/projects
   - Click on project: **`TrackerUI`**
   - Click **"Edit"** button

2. **Go to Environment Section:**

   - Click **"Environment"** in left sidebar
   - Scroll down to **"Environment variables"** section

3. **Verify Variables Exist:**

   - You should see 3 variables listed:
     - `VITE_API_BASE_URL`
     - `VITE_GOOGLE_CLIENT_ID`
     - `VITE_HUGGINGFACE_API_KEY`

   **If they DON'T exist, add them now:**

### Step 2: Add Environment Variables (If Missing)

Click **"Add environment variable"** for each:

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
   - Click **"Update environment"** or **"Save"** at bottom

### Step 3: Rebuild with Environment Variables

**IMPORTANT:** After setting environment variables, you MUST rebuild:

1. **Go to CodeBuild Console:**

   - Project: `TrackerUI`
   - Click **"Start build"**
   - **Wait for build to complete** (5-10 minutes)

2. **Check Build Logs:**

   - Click on the build
   - Go to "Build logs" tab
   - Look for these lines in the build output:
     ```
     Building the React + Vite application...
     ```
   - The build should complete successfully

3. **Verify Image Pushed to ECR:**
   - Go to ECR Console
   - Repository: `tracker_ui`
   - Check that a new image with latest timestamp exists

### Step 4: Rebuild App Runner Service

**CRITICAL:** After CodeBuild completes, rebuild App Runner:

1. **Go to App Runner Console:**

   - Service: `service_track_ui`
   - Click **"Rebuild"** button (NOT "Update")
   - Wait for deployment (3-5 minutes)

2. **Verify Deployment:**
   - Wait for status to show "Running"
   - Check deployment logs for any errors

### Step 5: Test Frontend

1. **Open Frontend:**

   - `https://y55dfkjshm.us-west-2.awsapprunner.com/login`
   - Open browser console (F12)

2. **Check Console:**

   - Should see: `🔍 VITE_API_BASE_URL: https://9uwp8ycrdq.us-east-1.awsapprunner.com`
   - Should see: `🔍 VITE_GOOGLE_CLIENT_ID: 129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c...`
   - Should NOT see empty strings

3. **Test Login:**
   - Should connect to correct backend
   - Google login button should be visible

## Why This Happens

1. **Environment variables not set in CodeBuild:**

   - CodeBuild doesn't have access to variables
   - Docker build receives empty values
   - Frontend uses fallback/placeholder URLs

2. **Old Docker image still in use:**

   - App Runner might be using cached image
   - Must rebuild App Runner after CodeBuild

3. **Variables set after build:**
   - If you set variables AFTER building, they won't be in the image
   - Must rebuild CodeBuild after setting variables

## Quick Checklist

- [ ] Environment variables set in CodeBuild project `TrackerUI`
- [ ] CodeBuild build triggered and completed successfully
- [ ] New Docker image pushed to ECR (`tracker_ui`)
- [ ] App Runner service rebuilt (not just updated)
- [ ] Frontend console shows correct environment variable values
- [ ] Login works with correct backend URL
- [ ] Google login button visible

## If Still Not Working

1. **Double-check CodeBuild environment variables:**

   - Go to CodeBuild → TrackerUI → Edit → Environment
   - Verify all 3 variables are listed and have correct values
   - Check for typos in variable names (must be exact: `VITE_API_BASE_URL`)

2. **Check CodeBuild build logs:**

   - Look for any errors during Docker build
   - Verify build completed successfully

3. **Check App Runner deployment logs:**

   - Look for any errors during deployment
   - Verify service is running

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito mode
