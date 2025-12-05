# Frontend Deployment Guide - TrackerWorkflow

## Overview

This guide covers deploying the React + Vite frontend to AWS App Runner using Docker and ECR.

## Files Created

1. **Dockerfile** - Multi-stage build (Node.js build + nginx serve)
2. **nginx.conf** - Nginx configuration for serving React SPA
3. **buildspec.yml** - AWS CodeBuild configuration
4. **.dockerignore** - Excludes unnecessary files from Docker build

## Prerequisites

1. **ECR Repository:**

   - Create ECR repository: `trackerworkflow-frontend`
   - Region: `us-west-2`
   - Account: `290008131176`

2. **CodeBuild Project:**
   - Create CodeBuild project: `TrackerWorkflowFrontend`
   - Source: GitHub repository
   - Environment: Docker (latest)
   - Service role with ECR permissions

## Step 1: Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name trackerworkflow-frontend \
  --region us-west-2
```

Or via AWS Console:

1. Go to ECR Console
2. Click "Create repository"
3. Name: `trackerworkflow-frontend`
4. Region: `us-west-2`
5. Click "Create repository"

## Step 2: Set CodeBuild Environment Variables

In CodeBuild project settings, add these environment variables:

```
VITE_API_BASE_URL=https://9uwp8ycrdq.us-east-1.awsapprunner.com
VITE_GOOGLE_CLIENT_ID=129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com
VITE_HUGGINGFACE_API_KEY=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
```

**Important:** Replace `VITE_API_BASE_URL` with your actual backend App Runner URL.

## Step 3: Trigger CodeBuild Build

1. **Go to CodeBuild Console:**

   - https://console.aws.amazon.com/codesuite/codebuild/projects
   - Select project: `TrackerWorkflowFrontend`
   - Click "Start build"
   - Wait for build to complete (5-10 minutes)

2. **Verify Build Success:**
   - Check build logs
   - Verify image pushed to ECR
   - Check ECR repository for new image

## Step 4: Create App Runner Service

1. **Go to App Runner Console:**

   - https://console.aws.amazon.com/apprunner/
   - Click "Create service"

2. **Source Configuration:**

   - **Source type:** Container registry
   - **Provider:** Amazon ECR
   - **Container image URI:** `290008131176.dkr.ecr.us-west-2.amazonaws.com/trackerworkflow-frontend:latest`
   - **Deployment trigger:** Automatic (or Manual)

3. **Service Settings:**

   - **Service name:** `trackerworkflow-frontend`
   - **Virtual CPU:** 1 vCPU
   - **Memory:** 2 GB
   - **Port:** `80` (nginx default)

4. **Auto Scaling:**

   - Min: 1
   - Max: 5 (or your preference)

5. **Health Check:**

   - Path: `/health`
   - Protocol: HTTP
   - Interval: 10 seconds
   - Timeout: 5 seconds
   - Healthy threshold: 1
   - Unhealthy threshold: 5

6. **Create Service:**
   - Click "Create & deploy"
   - Wait for service to be created (5-10 minutes)

## Step 5: Update Google OAuth Redirect URI

After App Runner service is created, update Google OAuth:

1. **Get App Runner URL:**

   - Go to App Runner service
   - Copy the default domain (e.g., `https://xxxxx.us-west-2.awsapprunner.com`)

2. **Update Google Cloud Console:**
   - Go to: https://console.cloud.google.com/
   - APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - Add authorized redirect URI:
     ```
     https://your-app-runner-url.us-west-2.awsapprunner.com/auth/google/callback
     ```
   - Save changes

## Step 6: Update Backend CORS

Update your backend App Runner service to allow the frontend domain:

1. **Go to Backend Code:**
   - File: `TrackerWorkflow_API/main.py`
   - Update CORS origins to include frontend App Runner URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Development
        "https://your-frontend-url.us-west-2.awsapprunner.com",  # Production
        "https://*.awsapprunner.com"  # All App Runner domains
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. **Rebuild Backend:**
   - Trigger CodeBuild for backend
   - Rebuild App Runner service

## Environment Variables Reference

### Build-Time Variables (CodeBuild)

These are injected during Docker build:

- `VITE_API_BASE_URL` - Backend API URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `VITE_HUGGINGFACE_API_KEY` - Hugging Face API Key

### Runtime Variables (App Runner)

No runtime environment variables needed for frontend (all are build-time).

## Troubleshooting

### Build Fails

1. **Check CodeBuild Logs:**

   - Look for npm install errors
   - Check for missing dependencies
   - Verify environment variables are set

2. **Common Issues:**
   - Missing environment variables
   - npm install failures
   - Docker build errors

### App Runner Service Fails to Start

1. **Check Logs:**

   - App Runner → Logs tab
   - Look for nginx errors
   - Check health check failures

2. **Common Issues:**
   - Port mismatch (should be 80)
   - Health check path incorrect
   - Image pull failures

### Frontend Can't Connect to Backend

1. **Check CORS:**

   - Verify backend allows frontend domain
   - Check browser console for CORS errors

2. **Check API URL:**
   - Verify `VITE_API_BASE_URL` is correct
   - Check network tab in browser dev tools

### Google OAuth Not Working

1. **Check Redirect URI:**

   - Must match exactly in Google Console
   - Include full URL with protocol

2. **Check Client ID:**
   - Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
   - Check it's included in build

## Local Testing

Test the Docker image locally:

```bash
# Build image
docker build \
  --build-arg VITE_API_BASE_URL=http://localhost:8001 \
  --build-arg VITE_GOOGLE_CLIENT_ID=your-client-id \
  -t trackerworkflow-frontend .

# Run container
docker run -p 8080:80 trackerworkflow-frontend

# Test in browser
open http://localhost:8080
```

## Updating the Frontend

1. **Make code changes**
2. **Commit and push to repository**
3. **Trigger CodeBuild** (or auto-triggers if connected)
4. **Wait for build to complete**
5. **App Runner auto-deploys** new image (if using `latest` tag)

## Cost Optimization

- Use smaller instance sizes for development
- Set auto-scaling min to 1
- Use manual deployment triggers for non-production

## Security Best Practices

1. **Don't commit sensitive keys:**

   - Use CodeBuild environment variables
   - Use AWS Secrets Manager for sensitive values

2. **Keep dependencies updated:**

   - Regularly update npm packages
   - Check for security vulnerabilities

3. **Use HTTPS:**
   - App Runner provides HTTPS by default
   - Update Google OAuth to use HTTPS URLs

## Next Steps

1. Set up custom domain (optional)
2. Configure CloudWatch alarms
3. Set up CI/CD pipeline
4. Configure monitoring and logging
