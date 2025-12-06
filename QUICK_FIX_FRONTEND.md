# Quick Fix: Frontend ECR Image Issue

## Problem Identified

1. ✅ ECR repository `tracker_ui` exists
2. ❌ No Docker image in the repository (empty)
3. ❌ App Runner is configured to use `trackerworkflow-frontend` but repository is `tracker_ui`

## Solution: Two Options

### Option 1: Update App Runner to Use `tracker_ui` (Recommended)

Since you already have `tracker_ui` repository, update App Runner to use it:

1. **Go to App Runner Console:**

   - Service: `service_track_ui`
   - Configuration tab
   - Click "Edit"

2. **Update Source:**

   - Change image URI from:
     ```
     290008131176.dkr.ecr.us-west-2.amazonaws.com/trackerworkflow-frontend:latest
     ```
   - To:
     ```
     290008131176.dkr.ecr.us-west-2.amazonaws.com/tracker_ui:latest
     ```

3. **Update Port:**

   - Change from `5173` to `80`
   - Save changes

4. **Build and Push Image:**
   - Follow steps below to build and push image to `tracker_ui`

### Option 2: Create `trackerworkflow-frontend` Repository

If you prefer to keep the name `trackerworkflow-frontend`:

1. **Create new repository:**

   ```bash
   aws ecr create-repository \
     --repository-name trackerworkflow-frontend \
     --region us-west-2
   ```

2. **Keep App Runner configuration as is**
3. **Build and push to `trackerworkflow-frontend`**

## Build and Push Docker Image

### Step 1: Build the Docker Image

You need to build the image with environment variables:

```bash
# Navigate to your frontend directory
cd TrackerWorkflow

# Build the Docker image
docker build \
  --build-arg VITE_API_BASE_URL=https://9uwp8ycrdq.us-east-1.awsapprunner.com \
  --build-arg VITE_GOOGLE_CLIENT_ID=129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com \
  --build-arg VITE_HUGGINGFACE_API_KEY=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 \
  -t tracker_ui .
```

### Step 2: Login to ECR

```bash
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 290008131176.dkr.ecr.us-west-2.amazonaws.com
```

### Step 3: Tag the Image

```bash
docker tag tracker_ui:latest 290008131176.dkr.ecr.us-west-2.amazonaws.com/tracker_ui:latest
```

### Step 4: Push to ECR

```bash
docker push 290008131176.dkr.ecr.us-west-2.amazonaws.com/tracker_ui:latest
```

### Step 5: Verify Image in ECR

```bash
aws ecr describe-images \
  --repository-name tracker_ui \
  --region us-west-2
```

Or check in ECR Console:

- Go to ECR → `tracker_ui` repository
- Click "Images" tab
- Should see image with `latest` tag

## Complete Command Sequence

Here's the complete sequence to run:

```bash
# 1. Login to ECR
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 290008131176.dkr.ecr.us-west-2.amazonaws.com

# 2. Build image
docker build \
  --build-arg VITE_API_BASE_URL=https://9uwp8ycrdq.us-east-1.awsapprunner.com \
  --build-arg VITE_GOOGLE_CLIENT_ID=129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com \
  --build-arg VITE_HUGGINGFACE_API_KEY=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 \
  -t tracker_ui .

# 3. Tag image
docker tag tracker_ui:latest 290008131176.dkr.ecr.us-west-2.amazonaws.com/tracker_ui:latest

# 4. Push to ECR
docker push 290008131176.dkr.ecr.us-west-2.amazonaws.com/tracker_ui:latest

# 5. Verify
aws ecr describe-images --repository-name tracker_ui --region us-west-2
```

## Update App Runner Configuration

After image is pushed:

1. **Go to App Runner Console:**

   - Service: `service_track_ui`
   - Configuration tab
   - Click "Edit"

2. **Update these settings:**

   - **Source Image URI:** `290008131176.dkr.ecr.us-west-2.amazonaws.com/tracker_ui:latest`
   - **Port:** `80` (not 5173)

3. **Save and Rebuild:**
   - Click "Save changes"
   - Or click "Rebuild" button
   - Wait for deployment (3-5 minutes)

## Troubleshooting

### Docker Build Fails?

1. **Check Dockerfile exists:**

   ```bash
   ls -la TrackerWorkflow/Dockerfile
   ```

2. **Check nginx.conf exists:**

   ```bash
   ls -la TrackerWorkflow/nginx.conf
   ```

3. **Check for errors in build output:**
   - Look for npm install errors
   - Check for missing files

### Push Fails?

1. **Verify ECR login:**

   ```bash
   aws ecr get-authorization-token --region us-west-2
   ```

2. **Check IAM permissions:**
   - Need `ecr:GetAuthorizationToken`
   - Need `ecr:BatchCheckLayerAvailability`
   - Need `ecr:GetDownloadUrlForLayer`
   - Need `ecr:PutImage`
   - Need `ecr:InitiateLayerUpload`
   - Need `ecr:UploadLayerPart`
   - Need `ecr:CompleteLayerUpload`

### App Runner Still Can't Find Image?

1. **Verify repository name matches:**

   - ECR: `tracker_ui`
   - App Runner: `tracker_ui` (not `trackerworkflow-frontend`)

2. **Verify image tag:**

   - Must be `latest` (or update App Runner to use specific tag)

3. **Check region:**
   - Both ECR and App Runner should be in `us-west-2`

## Quick Checklist

- [ ] ECR repository `tracker_ui` exists ✅
- [ ] Docker image built with environment variables
- [ ] Image tagged correctly: `tracker_ui:latest`
- [ ] Image pushed to ECR successfully
- [ ] App Runner source updated to `tracker_ui:latest`
- [ ] App Runner port set to `80`
- [ ] App Runner service rebuilt
- [ ] Image successfully pulled in App Runner logs

## Expected Result

After completing these steps:

- ECR repository `tracker_ui` will have an image
- App Runner will successfully pull the image
- Service will deploy successfully
- Frontend will be accessible at: `https://y55dfkjshm.us-west-2.awsapprunner.com`
