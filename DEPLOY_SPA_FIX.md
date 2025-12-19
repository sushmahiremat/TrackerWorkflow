# Deploy SPA Routing Fix - No Docker Required

## ✅ What Was Fixed

1. **Created `public/static.json`** - Tells AppRunner to serve `index.html` for all routes
2. **Enhanced `nginx.conf`** - Added explicit SPA routing rules

## 🚀 Deployment Steps (Using CodeBuild)

Since you're using AWS CodeBuild, you **don't need Docker locally**. Just commit and push!

### Step 1: Verify Changes Are Ready

Check that these files exist:
- ✅ `public/static.json` - Created
- ✅ `nginx.conf` - Updated with SPA routing

### Step 2: Commit and Push to GitHub

```powershell
# Check what files changed
git status

# Add the new files
git add public/static.json
git add nginx.conf
git add SPA_ROUTING_FIX.md

# Commit
git commit -m "Fix SPA routing: Add static.json and enhance nginx.conf for 405 error"

# Push to GitHub
git push origin main
```

### Step 3: Trigger CodeBuild Build

**Option A: Automatic (if configured)**
- If CodeBuild is connected to GitHub webhooks, it will build automatically
- Check CodeBuild console for new build

**Option B: Manual Trigger**
1. Go to AWS CodeBuild Console:
   - https://console.aws.amazon.com/codesuite/codebuild/projects
2. Find your project: `TrackerWorkflowFrontend` (or similar)
3. Click **"Start build"**
4. Wait for build to complete (5-10 minutes)

### Step 4: Verify Build Success

1. **Check CodeBuild Logs:**
   - Should see: "Build completed successfully"
   - Should see: "Pushing the Docker image to ECR"

2. **Check ECR Repository:**
   - Go to ECR Console
   - Repository: `tracker_ui` (or `trackerworkflow-frontend`)
   - Should see new image with `latest` tag
   - Check image was pushed recently

### Step 5: App Runner Will Auto-Deploy (if configured)

If App Runner is set to auto-deploy:
- It will detect the new ECR image
- Automatically deploy the new version
- Wait 3-5 minutes for deployment

**OR Manually Trigger:**
1. Go to App Runner Console
2. Select your service: `service_track_ui`
3. Click **"Deploy"** or **"Rebuild"**
4. Wait for deployment (3-5 minutes)

### Step 6: Test the Fix

1. **Test Direct Route:**
   - Visit: `https://y55dfkjshm.us-west-2.awsapprunner.com/login`
   - **Expected:** Should show React login page (NOT 405 error)

2. **Test Google OAuth:**
   - Click "Sign in with Google"
   - Should redirect and work properly

3. **Test Other Routes:**
   - `/dashboard`
   - `/project/123`
   - All should work (not 405)

## 🔍 Verify static.json is in Build

After CodeBuild completes, you can verify:

1. **Check CodeBuild Logs:**
   Look for:
   ```
   COPY public/static.json → dist/static.json
   ```

2. **Or check in ECR (if you have access):**
   The built Docker image should contain:
   ```
   /usr/share/nginx/html/static.json
   ```

## 📋 Quick Checklist

- [ ] `public/static.json` exists
- [ ] `nginx.conf` has SPA routing
- [ ] Changes committed to git
- [ ] Pushed to GitHub
- [ ] CodeBuild build triggered
- [ ] Build completed successfully
- [ ] Image pushed to ECR
- [ ] App Runner deployed new version
- [ ] `/login` route works (not 405)
- [ ] Google OAuth works

## 🚨 If Build Fails

### Check CodeBuild Environment Variables

Make sure these are set in CodeBuild project:
```
VITE_API_BASE_URL=https://9cqn6rispm.us-west-2.awsapprunner.com
VITE_GOOGLE_CLIENT_ID=181234528314-h1a19g5pmjifbhlrg05suul24m67gmjt.apps.googleusercontent.com
VITE_HUGGINGFACE_API_KEY=your-key-here
```

### Check ECR Permissions

CodeBuild service role needs:
- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:GetDownloadUrlForLayer`
- `ecr:BatchGetImage`
- `ecr:PutImage`
- `ecr:InitiateLayerUpload`
- `ecr:UploadLayerPart`
- `ecr:CompleteLayerUpload`

## 💡 Why This Works

1. **static.json** - Standard SPA routing config (Vercel/AppRunner compatible)
2. **nginx.conf** - Fallback SPA routing in Docker container
3. **Both together** - Maximum compatibility across different deployment scenarios

The `static.json` file gets copied to `dist/` during Vite build, then to Docker image, and AppRunner reads it to configure routing.

