# Fix Docker Hub Rate Limit Error

## Problem

Build is failing with:

```
429 Too Many Requests - Server message: toomanyrequests: You have reached your unauthenticated pull rate limit.
```

## Solution Applied

I've updated the `Dockerfile` to use **AWS ECR Public Gallery** instead of Docker Hub. This avoids rate limits completely.

### Changes Made

1. **Updated Dockerfile:**

   - Changed `FROM node:18-alpine` → `FROM public.ecr.aws/docker/library/node:18-alpine`
   - Changed `FROM nginx:alpine` → `FROM public.ecr.aws/docker/library/nginx:alpine`

2. **Updated buildspec.yml:**
   - Added optional Docker Hub login (if credentials are provided)

## Next Steps

### Option 1: Use ECR Public Gallery (Recommended - Already Applied)

The Dockerfile now uses ECR Public Gallery images which don't have rate limits. Just:

1. **Commit and push the changes:**

   ```bash
   cd TrackerWorkflow
   git add Dockerfile buildspec.yml
   git commit -m "Fix Docker Hub rate limit by using ECR Public Gallery"
   git push
   ```

2. **Trigger new CodeBuild build:**
   - CodeBuild → `TrackerUI` → Start build
   - Build should now succeed

### Option 2: Add Docker Hub Authentication (Alternative)

If you prefer to use Docker Hub, add credentials to CodeBuild:

1. **Go to CodeBuild Console:**

   - Project: `TrackerUI`
   - Click "Edit"
   - Go to "Environment" → "Environment variables"

2. **Add Docker Hub credentials:**

   - **Name:** `DOCKERHUB_USERNAME`
   - **Value:** Your Docker Hub username
   - **Type:** Plaintext

   - **Name:** `DOCKERHUB_PASSWORD`
   - **Value:** Your Docker Hub password or access token
   - **Type:** Plaintext (or use Secrets Manager for better security)

3. **Save and rebuild**

## Why ECR Public Gallery is Better

- ✅ No rate limits
- ✅ Faster pulls (AWS infrastructure)
- ✅ No authentication needed
- ✅ Same images as Docker Hub (official images)

## Verification

After pushing and rebuilding, check build logs:

- Should see successful Docker image pulls
- No "429 Too Many Requests" errors
- Build should complete successfully
