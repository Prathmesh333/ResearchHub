# 🔧 Railway Troubleshooting Guide

## Current Issue: DATABASE_URL Not Set

Your deployment logs show:
```
Migration failed: Error: DATABASE_URL environment variable is not set
```

This is **NOT a code problem** - the code is working correctly. This is a **Railway configuration problem**.

## Quick Fix Checklist

### ✅ Step 1: Verify PostgreSQL Service Exists
1. Open Railway dashboard
2. Look for a **PostgreSQL** service in your project
3. If missing → Click "New" → "Database" → "Add PostgreSQL"

### ✅ Step 2: Set DATABASE_URL on App Service
1. Click your **app service** (Node.js app, NOT the database)
2. Click **"Variables"** tab
3. Click **"New Variable"**
4. Add:
   ```
   Variable Name: DATABASE_URL
   Variable Value: ${{Postgres.DATABASE_URL}}
   ```
5. Click **"Add"**

**Important:** Replace `Postgres` with your actual database service name if different.

### ✅ Step 3: Set JWT_SECRET
While in Variables tab, also add:
```
Variable Name: JWT_SECRET
Variable Value: your-super-long-random-secret-at-least-32-characters-long
```

### ✅ Step 4: Redeploy
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
   OR
3. Push a new commit to trigger deployment

## How to Verify Variables Are Set

### In Railway Dashboard:
**App Service → Variables Tab should show:**
```
DATABASE_URL     ${{Postgres.DATABASE_URL}}     
JWT_SECRET       your-secret-here                
PORT             3000                            (auto-set)
```

### In Deployment Logs (after fix):
You should see:
```
Running database migrations...
Environment check:
- NODE_ENV: production
- RAILWAY_ENVIRONMENT: production
- DATABASE_URL: ✓ SET
✓ DATABASE_URL is configured
Running Prisma migrations...
✓ Migrations completed successfully
Server listening on port 3000
```

## Common Issues & Solutions

### Issue 1: "I added DATABASE_URL but still getting the error"

**Possible causes:**
1. ❌ Added variable to **database service** instead of **app service**
   - **Fix:** Add it to the app service (the one running Node.js)

2. ❌ Didn't redeploy after adding variable
   - **Fix:** Redeploy or push a new commit

3. ❌ Typo in variable name (e.g., `DATABASE_URl`, `DB_URL`)
   - **Fix:** Must be exactly `DATABASE_URL`

4. ❌ Wrong reference syntax
   - **Fix:** Use `${{ServiceName.DATABASE_URL}}` format

### Issue 2: "I don't see a PostgreSQL service"

**Solution:**
1. Click **"New"** in Railway dashboard
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Wait for it to provision (green checkmark)
5. It should auto-link to your app service

### Issue 3: "What's my database service name?"

**To find it:**
1. Look at your Railway project dashboard
2. You'll see service cards (boxes)
3. One will be labeled "PostgreSQL" or "Postgres" or similar
4. That's the name to use in `${{NAME.DATABASE_URL}}`

**Common names:**
- `Postgres`
- `PostgreSQL`
- `database`
- `db`

### Issue 4: "Variables tab is empty"

**This means:**
- You're looking at the wrong service, OR
- Variables haven't been set yet

**Solution:**
1. Make sure you clicked on the **app service** (not database)
2. The app service is the one with your GitHub repo connected
3. Add the variables manually

### Issue 5: "Railway reference not working"

**Try manual URL instead:**
1. Go to **PostgreSQL service**
2. Go to **"Variables"** tab
3. Find `DATABASE_URL` and copy its value (looks like `postgresql://...`)
4. Go to **app service** → **"Variables"**
5. Add `DATABASE_URL` with the copied value

**Note:** Manual URLs may break if database restarts. References are better.

## Using Railway CLI (Alternative Method)

If the dashboard isn't working, try the CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Set variables
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
railway variables set JWT_SECRET='your-secret-here'

# Verify
railway variables

# Trigger redeploy
railway up
```

## Debug: Check What Variables Railway Provides

The updated migration script now logs environment info. After redeploying, check logs for:

```
Environment check:
- NODE_ENV: production
- RAILWAY_ENVIRONMENT: production
- DATABASE_URL: ✓ SET
- Found database-related variables: DATABASE_URL, POSTGRES_URL
```

If you see:
```
- DATABASE_URL: ✗ NOT SET
- No database-related variables found in environment
```

Then Railway is definitely not providing the variable to your app.

## Still Not Working?

### Last Resort Checks:

1. **Is this the right Railway project?**
   - Verify you're looking at the correct project

2. **Is the app service connected to GitHub?**
   - Settings → Should show connected repository

3. **Are you deploying the right branch?**
   - Settings → Check which branch is being deployed

4. **Try deleting and recreating the app service:**
   - This is drastic but sometimes fixes weird issues
   - Make sure to reconnect to GitHub and re-add variables

5. **Check Railway status:**
   - Visit https://status.railway.app/
   - Ensure no ongoing incidents

## Contact Railway Support

If nothing works, Railway support can help:
1. Go to Railway dashboard
2. Click the "?" icon (bottom right)
3. Click "Contact Support"
4. Explain: "DATABASE_URL environment variable not being injected into app service"

## Expected Success State

Once fixed, your deployment should:
1. ✅ Build successfully
2. ✅ Run migrations successfully
3. ✅ Start server successfully
4. ✅ Respond to health check: `https://your-app.railway.app/api/health`

## Summary

**The code is correct.** The issue is that Railway hasn't been configured to provide `DATABASE_URL` to your app service. Follow the steps above to configure Railway properly.
