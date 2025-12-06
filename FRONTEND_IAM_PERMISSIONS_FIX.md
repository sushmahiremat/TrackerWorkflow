# Fix CodeBuild ECR Permissions for Frontend

## Problem

The CodeBuild service role for `TrackerUI` doesn't have permissions to access Amazon ECR.

Error: `Command did not exit successfully aws ecr get-login-password --region us-west-2 | docker login... exit status 1`

## Solution: Add ECR Permissions to CodeBuild Service Role

### Step 1: Find the CodeBuild Service Role

1. **Go to CodeBuild Console:**
   - https://console.aws.amazon.com/codesuite/codebuild/projects
   - Click on project: `TrackerUI`
   - Click "Edit" → "Environment"
   - Look for "Service role" - note the role name (usually `codebuild-TrackerUI-service-role`)

### Step 2: Add ECR Permissions

1. **Go to IAM Console:**

   - https://console.aws.amazon.com/iam/
   - Click "Roles" in left sidebar
   - Search for your CodeBuild service role (e.g., `codebuild-TrackerUI-service-role`)
   - Click on the role name

2. **Add Inline Policy:**
   - Click "Add permissions" → "Create inline policy"
   - Click "JSON" tab
   - Paste the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "arn:aws:ecr:us-west-2:290008131176:repository/tracker_ui"
    }
  ]
}
```

3. **Review and Create:**
   - Name the policy: `CodeBuild-ECR-Permissions-Frontend`
   - Click "Create policy"

### Step 3: Verify Permissions

After adding the policy, verify it's attached:

- Go back to IAM → Roles → Your CodeBuild role
- Should see the new inline policy listed

### Step 4: Retry CodeBuild

1. **Go to CodeBuild Console**
2. **Project:** `TrackerUI`
3. **Click "Retry build"**
4. **Wait for completion**

The build should now be able to:

- Login to ECR ✅
- Pull base images ✅
- Push the built image ✅

## Alternative: Using AWS CLI

If you prefer using CLI:

```bash
aws iam put-role-policy \
    --role-name codebuild-TrackerUI-service-role \
    --policy-name CodeBuild-ECR-Permissions-Frontend \
    --policy-document '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": ["ecr:GetAuthorizationToken"],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:BatchGetImage",
                    "ecr:PutImage",
                    "ecr:InitiateLayerUpload",
                    "ecr:UploadLayerPart",
                    "ecr:CompleteLayerUpload"
                ],
                "Resource": "arn:aws:ecr:us-west-2:290008131176:repository/tracker_ui"
            }
        ]
    }'
```

**Note:** Replace `codebuild-TrackerUI-service-role` with your actual service role name.

## Required Permissions Summary

The CodeBuild service role needs:

- `ecr:GetAuthorizationToken` - To get login token (required for all ECR operations)
- `ecr:BatchCheckLayerAvailability` - To check if image layers exist
- `ecr:GetDownloadUrlForLayer` - To download image layers
- `ecr:BatchGetImage` - To pull images
- `ecr:PutImage` - To push images
- `ecr:InitiateLayerUpload` - To start uploading layers
- `ecr:UploadLayerPart` - To upload layer parts
- `ecr:CompleteLayerUpload` - To complete layer upload

## Troubleshooting

### Still Getting Permission Errors?

1. **Verify role name:**

   - Check CodeBuild project → Environment → Service role
   - Make sure you're editing the correct role

2. **Check policy is attached:**

   - IAM → Roles → Your role → Permissions tab
   - Should see the inline policy listed

3. **Verify repository name:**

   - Make sure the policy includes `tracker_ui` repository
   - Check ECR console to confirm repository name

4. **Wait a few minutes:**
   - IAM changes can take a minute to propagate
   - Retry build after 1-2 minutes

## Quick Checklist

- [ ] Found CodeBuild service role name
- [ ] Added inline policy with ECR permissions
- [ ] Policy includes `ecr:GetAuthorizationToken` for all resources
- [ ] Policy includes ECR actions for `tracker_ui` repository
- [ ] Retried CodeBuild build
- [ ] Build successfully logs into ECR

## Expected Result

After adding permissions:

- CodeBuild should successfully login to ECR
- Should see: "Login Succeeded" in build logs
- Build should proceed to Docker build phase
