# Fix CodeBuild buildspec.yml Error

## Problem
CodeBuild is looking for `builspec.yml` (typo - missing 'd') instead of `buildspec.yml`.

Error: `stat /codebuild/output/src3479000548/src/github.com/sushmahiremat/TrackerWorkflow/builspec.yml: no such file or directory`

## Root Cause
The CodeBuild project has a manual buildspec specification with a typo, or it's configured incorrectly.

## Solution: Fix CodeBuild Project Configuration

### Step 1: Check CodeBuild Buildspec Setting

1. **Go to AWS CodeBuild Console:**
   - https://console.aws.amazon.com/codesuite/codebuild/projects
   - Click on project: `TrackerUI`
   - Click "Edit" button

2. **Go to Buildspec Section:**
   - In the left sidebar, click "Buildspec"
   - Or scroll to "Buildspec" section

3. **Check Buildspec Name:**
   - Look for a field that says "Buildspec name" or "Buildspec file"
   - If it shows `builspec.yml` (typo), change it to `buildspec.yml`
   - **OR** leave it **empty** for auto-detection

4. **Save Changes**

### Step 2: Alternative - Use Auto-Detection (Recommended)

The best approach is to let CodeBuild auto-detect the buildspec:

1. **CodeBuild Project → Edit → Buildspec**
2. **Buildspec name:** Leave **EMPTY** (blank)
3. **Save**

CodeBuild will automatically look for `buildspec.yml` in the root directory.

### Step 3: Verify File is in GitHub

Make absolutely sure the file is in your GitHub repository:

1. **Go to GitHub:**
   - https://github.com/sushmahiremat/TrackerWorkflow
   - Check if `buildspec.yml` is visible in the root directory

2. **If not visible, commit and push:**
   ```bash
   cd TrackerWorkflow
   git add buildspec.yml
   git commit -m "Add buildspec.yml"
   git push origin main
   # or git push origin master (depending on your branch)
   ```

### Step 4: Verify File Location in Repository

The file must be in the **root** of the repository:

```
TrackerWorkflow/          ← Repository root
  ├── buildspec.yml      ← Must be here
  ├── Dockerfile
  ├── nginx.conf
  ├── package.json
  └── src/
```

NOT in a subdirectory like:
```
TrackerWorkflow/
  └── some-folder/
      └── buildspec.yml  ← Wrong location
```

### Step 5: Retry Build

After fixing the configuration:

1. **Go to CodeBuild Console**
2. **Project:** `TrackerUI`
3. **Click "Retry build"** or "Start build"
4. **Wait for completion**

## Quick Fix Checklist

- [ ] CodeBuild project buildspec field is **empty** (for auto-detection) OR set to `buildspec.yml` (correct spelling)
- [ ] `buildspec.yml` exists in GitHub repository root
- [ ] File is committed and pushed to GitHub
- [ ] CodeBuild source points to correct repository and branch
- [ ] Retry build after fixes

## If Still Not Working

### Option 1: Create buildspec with typo name (Temporary workaround)

If CodeBuild configuration can't be changed immediately:

```bash
cd TrackerWorkflow
cp buildspec.yml builspec.yml
git add builspec.yml
git commit -m "Add builspec.yml for CodeBuild compatibility"
git push
```

**Note:** This is a workaround. The proper fix is to correct the CodeBuild configuration.

### Option 2: Specify Full Path

In CodeBuild project settings:
- Buildspec name: `buildspec.yml` (correct spelling)
- Or: `./buildspec.yml`

### Option 3: Check Source Configuration

1. **CodeBuild Project → Edit → Source**
2. **Verify:**
   - Repository: `sushmahiremat/TrackerWorkflow`
   - Branch: Your branch (main/master)
   - Source version: Latest (or specific commit)

## Verification Commands

Check if file exists in repository:

```bash
# Check local file
ls -la TrackerWorkflow/buildspec.yml

# Check git status
cd TrackerWorkflow
git status

# Verify it's tracked
git ls-files | grep buildspec.yml
```

## Expected Result

After fixing:
- CodeBuild should find `buildspec.yml` automatically
- Build should proceed past DOWNLOAD_SOURCE phase
- Should see: "Phase complete: DOWNLOAD_SOURCE State: SUCCEEDED"

