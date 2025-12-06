# Frontend ECR Image Setup - Quick Fix

## Problem

App Runner can't find the Docker image because it hasn't been built and pushed to ECR yet.

## Solution: Build and Push Docker Image to ECR

### Step 1: Verify ECR Repository Exists

```bash
aws ecr describe-repositories --repository-names trackerworkflow-frontend --region us-west-2
```

If it doesn't exist, create it:

```bash
aws ecr create-repository \
  --repository-name trackerworkflow-frontend \
  --region us-west-2
```

### Step 2: Build and Push Docker Image

You have two options:

#### Option A: Use CodeBuild (Recommended)

1. **Go to CodeBuild Console:**

   - https://console.aws.amazon.com/codesuite/codebuild/projects
   - Create a new project or use existing one
   - Project name: `TrackerWorkflowFrontend`

2. **Configure CodeBuild:**

   - Source: Your GitHub repository
   - Environment: Docker (latest)
   - Service role: With ECR permissions
   - Buildspec: Use `buildspec.yml` from repository

3. **Set Environment Variables in CodeBuild:**

   ```
   VITE_API_BASE_URL=https://9uwp8ycrdq.us-east-1.awsapprunner.com
   VITE_GOOGLE_CLIENT_ID=129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com
   VITE_HUGGINGFACE_API_KEY=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
   ```

4. **Start Build:**
   - Click "Start build"
   - Wait for completion (5-10 minutes)

#### Option B: Build and Push Locally

If you have Docker installed locally:

```bash
# 1. Login to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 290008131176.dkr.ecr.us-west-2.amazonaws.com

# 2. Build the Docker image with environment variables
docker build \
  --build-arg VITE_API_BASE_URL=https://9uwp8ycrdq.us-east-1.awsapprunner.com \
  --build-arg VITE_GOOGLE_CLIENT_ID=129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com \
  --build-arg VITE_HUGGINGFACE_API_KEY=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 \
  -t trackerworkflow-frontend .

# 3. Tag the image
docker tag trackerworkflow-frontend:latest 290008131176.dkr.ecr.us-west-2.amazonaws.com/trackerworkflow-frontend:latest

# 4. Push to ECR
docker push 290008131176.dkr.ecr.us-west-2.amazonaws.com/trackerworkflow-frontend:latest
```

### Step 3: Fix App Runner Port Configuration

**IMPORTANT:** The App Runner service has port set to `5173`, but nginx serves on port `80`.

1. **Go to App Runner Console:**

   - Service: `service_track_ui`
   - Configuration tab
   - Click "Edit"

2. **Update Port:**
   - Change Port from `5173` to `80`
   - Save changes

### Step 4: Verify Image in ECR

After pushing, verify the image exists:

```bash
aws ecr describe-images \
  --repository-name trackerworkflow-frontend \
  --region us-west-2
```

Or check in ECR Console:

- Go to ECR Console
- Repository: `trackerworkflow-frontend`
- Should see image with `latest` tag

### Step 5: Rebuild App Runner Service

After image is in ECR:

1. **Go to App Runner Console:**

   - Service: `service_track_ui`
   - Click orange "Rebuild" button
   - Wait for rebuild (3-5 minutes)

2. **Check Logs:**
   - Should see: "Successfully pulled your application image from ECR"
   - Should NOT see: "ECR image doesn't exist"

## Important Notes

### Environment Variables

**CRITICAL:** Vite environment variables must be set at BUILD TIME, not runtime.

- ✅ Set in CodeBuild environment variables (build-time)
- ❌ Setting in App Runner won't work (runtime)

The Docker image is built with these variables baked in.

### Port Configuration

- **Dockerfile exposes:** Port 80 (nginx)
- **App Runner should use:** Port 80
- **NOT:** Port 5173 (that's the Vite dev server port)

## Troubleshooting

### Still Getting "ECR image doesn't exist"?

1. **Verify repository name:**

   ```bash
   aws ecr list-repositories --region us-west-2
   ```

   Should see `trackerworkflow-frontend`

2. **Check image exists:**

   ```bash
   aws ecr describe-images \
     --repository-name trackerworkflow-frontend \
     --image-ids imageTag=latest \
     --region us-west-2
   ```

3. **Verify image tag:**
   - Must be `latest` (or update App Runner to use specific tag)

### Build Fails?

1. **Check Dockerfile:**

   - Verify all files exist (nginx.conf, etc.)
   - Check for syntax errors

2. **Check build logs:**

   - Look for npm install errors
   - Check for missing dependencies

3. **Local test:**
   ```bash
   docker build \
     --build-arg VITE_API_BASE_URL=http://localhost:8001 \
     -t trackerworkflow-frontend .
   ```

### App Runner Still Fails After Image Exists?

1. **Check port:**

   - Must be `80`, not `5173`

2. **Check health check:**

   - Path: `/health`
   - Should return 200 OK

3. **Check logs:**
   - App Runner → Logs tab
   - Look for nginx errors

## Quick Checklist

- [ ] ECR repository `trackerworkflow-frontend` exists
- [ ] Docker image built with environment variables
- [ ] Image pushed to ECR with `latest` tag
- [ ] App Runner port set to `80` (not 5173)
- [ ] App Runner service rebuilt
- [ ] Image successfully pulled in App Runner logs

## Expected Timeline

1. **ECR Repository:** Already exists or 1 minute to create
2. **Docker Build & Push:** 5-10 minutes
3. **App Runner Rebuild:** 3-5 minutes
4. **Total:** ~10-15 minutes
