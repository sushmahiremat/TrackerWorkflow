# CodeBuild Error Fix - buildspec.yml Not Found

## Problem

CodeBuild error: `stat /codebuild/output/src3029805783/src/github.com/sushmahiremat/TrackerWorkflow/builspec.yml: no such file or directory`

Note: The error shows `builspec.yml` (typo), but CodeBuild should automatically find `buildspec.yml` in the root directory.

## Solution

### Step 1: Verify File is Committed and Pushed

Make sure `buildspec.yml` is committed to your GitHub repository:

```bash
# Navigate to your frontend directory
cd TrackerWorkflow

# Check git status
git status

# If buildspec.yml shows as untracked or modified:
git add buildspec.yml
git commit -m "Add buildspec.yml for CodeBuild"
git push
```

### Step 2: Verify File Location

The `buildspec.yml` must be in the **root** of your repository:

```
TrackerWorkflow/
  ├── buildspec.yml  ← Must be here
  ├── Dockerfile
  ├── nginx.conf
  ├── package.json
  └── ...
```

### Step 3: Check CodeBuild Source Configuration

1. **Go to CodeBuild Console:**

   - Project: `TrackerUI`
   - Click "Edit" → "Source"

2. **Verify Source Settings:**

   - **Source provider:** GitHub
   - **Repository:** `sushmahiremat/TrackerWorkflow`
   - **Branch:** Your branch (usually `main` or `master`)
   - **Buildspec:** Leave empty or set to `buildspec.yml`
     - If empty, CodeBuild will auto-detect `buildspec.yml` in root
     - If specified, must be exact: `buildspec.yml` (not `builspec.yml`)

3. **Save changes**

### Step 4: Verify Buildspec Name in CodeBuild

If you manually specified the buildspec name:

1. **Go to CodeBuild Project:**

   - Project: `TrackerUI`
   - Edit → Buildspec

2. **Check Buildspec field:**

   - Should be: `buildspec.yml` (correct spelling)
   - NOT: `builspec.yml` (typo)

3. **Or leave empty** for auto-detection

### Step 5: Retry Build

After fixing:

1. **Go to CodeBuild Console**
2. **Select your project:** `TrackerUI`
3. **Click "Retry build"** or "Start build"
4. **Wait for completion**

## Alternative: Specify Buildspec Explicitly

If auto-detection doesn't work, specify it explicitly:

1. **CodeBuild Project → Edit → Buildspec**
2. **Buildspec name:** `buildspec.yml`
3. **Save and retry**

## Verify File in GitHub

Check that the file exists in your GitHub repository:

1. Go to: `https://github.com/sushmahiremat/TrackerWorkflow`
2. Verify `buildspec.yml` is visible in the root directory
3. If not, commit and push it

## Quick Checklist

- [ ] `buildspec.yml` exists in `TrackerWorkflow/` root directory
- [ ] File is committed to git: `git add buildspec.yml`
- [ ] File is pushed to GitHub: `git push`
- [ ] CodeBuild source points to correct repository
- [ ] CodeBuild buildspec field is empty or set to `buildspec.yml` (correct spelling)
- [ ] Retry build after fixes

## Common Issues

### File Not in Repository

- **Symptom:** CodeBuild can't find file
- **Fix:** Commit and push `buildspec.yml` to GitHub

### Wrong Branch

- **Symptom:** CodeBuild looking in wrong branch
- **Fix:** Check CodeBuild source configuration points to correct branch

### Typo in Buildspec Name

- **Symptom:** Error shows `builspec.yml` instead of `buildspec.yml`
- **Fix:** Check CodeBuild buildspec field, ensure correct spelling

### File in Wrong Location

- **Symptom:** CodeBuild can't find file
- **Fix:** Ensure `buildspec.yml` is in repository root, not in subdirectory
