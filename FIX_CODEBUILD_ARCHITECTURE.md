# 🔧 Fix CodeBuild Architecture Error

## 🎯 Problem

You're getting `exec /bin/sh: exec format error` even with `--platform linux/amd64`. This means CodeBuild might be running on ARM architecture.

## ✅ Solution 1: Check CodeBuild Compute Type (Most Important)

1. **Go to CodeBuild Console:**
   - https://console.aws.amazon.com/codesuite/codebuild/
   - Find your frontend build project
   - Click on it

2. **Check Environment Settings:**
   - Click "Edit" → "Environment"
   - Look for **"Compute type"** or **"Image"**
   - Make sure it's using **x86_64** architecture

3. **If it's ARM, change it:**
   - **Compute type:** Should be `BUILD_GENERAL1_SMALL`, `BUILD_GENERAL1_MEDIUM`, or `BUILD_GENERAL1_LARGE` (these are x86_64)
   - **NOT** `ARM` or `ARM_LARGE` (these are ARM64)

4. **Save and rebuild**

## ✅ Solution 2: Use Docker Buildx (Already Added)

I've updated `buildspec.yml` to use `docker buildx` which handles cross-platform builds better. The build will:
- Try `docker buildx build` first (better cross-platform support)
- Fall back to `docker build` if buildx fails

## ✅ Solution 3: Verify CodeBuild Image

Make sure CodeBuild is using a standard image:

- ✅ `aws/codebuild/standard:7.0` (x86_64)
- ✅ `aws/codebuild/standard:6.0` (x86_64)
- ❌ `aws/codebuild/standard:arm64` (ARM - wrong!)

## 🔍 How to Check Current Architecture

The updated `buildspec.yml` now includes:
```bash
uname -m
```

This will show:
- `x86_64` = Correct (what we need)
- `aarch64` or `arm64` = Wrong (needs to be changed)

## 📋 Step-by-Step Fix

### Step 1: Check CodeBuild Project Settings

1. Go to CodeBuild Console
2. Select your frontend build project
3. Click "Edit"
4. Go to "Environment" section
5. Check:
   - **Compute type:** Should be `BUILD_GENERAL1_*` (not ARM)
   - **Image:** Should be `aws/codebuild/standard:7.0` or similar (x86_64)

### Step 2: If Using ARM, Change to x86_64

1. In CodeBuild project settings
2. Change compute type to: `BUILD_GENERAL1_SMALL` (or MEDIUM/LARGE)
3. Save changes

### Step 3: Trigger New Build

1. Click "Start build" or wait for automatic trigger
2. Check the logs - should see `uname -m` output showing `x86_64`
3. Build should succeed

## 🎯 Quick Fix Checklist

- [ ] CodeBuild compute type is `BUILD_GENERAL1_*` (not ARM)
- [ ] CodeBuild image is x86_64 (not ARM)
- [ ] `buildspec.yml` has `--platform linux/amd64` flag
- [ ] `buildspec.yml` uses `docker buildx` (already added)
- [ ] New build triggered after changes

## 💡 Why This Happens

- CodeBuild can run on ARM or x86_64
- App Runner requires x86_64 images
- If CodeBuild is ARM, even with `--platform linux/amd64`, Docker might not properly emulate x86_64
- Solution: Use x86_64 CodeBuild compute type

---

**Most Likely Fix:** Change CodeBuild compute type from ARM to `BUILD_GENERAL1_SMALL` (or MEDIUM/LARGE).

