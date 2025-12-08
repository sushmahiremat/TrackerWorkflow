# 🔧 Fix: Frontend Calling Wrong API URL

## ❌ The Problem

Your frontend is trying to call:

```
POST http://127.0.0.1:8001/docs/login 404 (Not Found)
```

But it should be calling:

```
POST http://127.0.0.1:8001/login
```

The `/docs` part is being incorrectly included in the API base URL.

## ✅ Solution: Fix Your .env File

### Step 1: Check Your Current .env File

Open `TrackerWorkflow/.env` and check what `VITE_API_BASE_URL` is set to.

**❌ WRONG (includes /docs):**

```env
VITE_API_BASE_URL=http://127.0.0.1:8001/docs
```

**✅ CORRECT (no /docs):**

```env
VITE_API_BASE_URL=http://localhost:8001
```

### Step 2: Update .env File

**Option A: Using Notepad/VS Code**

1. Open `TrackerWorkflow/.env` file
2. Make sure it looks like this:

```env
VITE_API_BASE_URL=http://localhost:8001
VITE_GOOGLE_CLIENT_ID=129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com
VITE_HUGGINGFACE_API_KEY=
```

**Important:**

- ✅ Use `http://localhost:8001` (NOT `http://127.0.0.1:8001/docs`)
- ✅ NO trailing slash
- ✅ NO `/docs` path

**Option B: Using PowerShell (if you prefer)**

```powershell
cd TrackerWorkflow
@"
VITE_API_BASE_URL=http://localhost:8001
VITE_GOOGLE_CLIENT_ID=129237008005-gi3c2jogmsb5kuuiag664305f7vgh30c.apps.googleusercontent.com
VITE_HUGGINGFACE_API_KEY=
"@ | Out-File -FilePath .env -Encoding utf8
```

### Step 3: Restart Your Frontend Dev Server

**IMPORTANT:** After changing `.env`, you MUST restart Vite:

1. **Stop** your current frontend server (press `Ctrl+C` in the terminal)
2. **Start** it again:
   ```powershell
   cd TrackerWorkflow
   npm run dev
   ```

**Why?** Vite only reads `.env` files when it starts. Changes won't take effect until you restart.

### Step 4: Verify It's Working

1. Open your browser console (F12)
2. Look for these logs:

   ```
   🔍 VITE_API_BASE_URL: http://localhost:8001
   🔧 API_BASE_URL: http://localhost:8001
   ```

3. Try to login again
4. Check the console - it should now show:

   ```
   📤 Making API request to: http://localhost:8001/login
   ```

   **NOT** `http://127.0.0.1:8001/docs/login`

## 🎯 Quick Checklist

- [ ] `.env` file has `VITE_API_BASE_URL=http://localhost:8001` (no `/docs`)
- [ ] `.env` file has NO trailing slash
- [ ] Frontend dev server was restarted after changing `.env`
- [ ] Browser console shows correct API URL
- [ ] Login works from UI

## 🐛 Still Not Working?

### Check 1: Clear Browser Cache

Sometimes the browser caches the old config. Try:

- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or open in Incognito/Private window

### Check 2: Verify .env File Location

Make sure `.env` is in the **root** of `TrackerWorkflow` folder:

```
TrackerWorkflow/
  ├── .env          ← Should be here
  ├── package.json
  ├── src/
  └── ...
```

### Check 3: Check Browser Console

Open DevTools (F12) → Console tab, and look for:

```
🔍 VITE_API_BASE_URL: ...
🔧 API_BASE_URL: ...
```

If it still shows the wrong URL, the `.env` file might not be read correctly.

### Check 4: Verify Backend is Running

Make sure your backend is running on port 8001:

```powershell
# In TrackerWorkflow_API directory
uvicorn main:app --reload --port 8001
```

You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8001
```

## 📝 Summary

The issue is that your `VITE_API_BASE_URL` in `.env` includes `/docs`.

**Fix:** Change it to `http://localhost:8001` (without `/docs`) and restart your frontend dev server.

---

**After fixing, you should see:**

- ✅ Console: `📤 Making API request to: http://localhost:8001/login`
- ✅ Login works from UI
- ✅ No more 404 errors
