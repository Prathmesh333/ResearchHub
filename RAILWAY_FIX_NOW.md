# 🚨 URGENT: Fix DATABASE_URL in Railway

## The Problem

Your app is failing because `DATABASE_URL` is **NOT set** in your Railway app service environment variables.

The logs show:
```
DATABASE_URL environment variable is not set
```

## The Solution (Step-by-Step)

### Step 1: Check Your Railway Services

1. Go to your Railway project dashboard
2. You should see **TWO services**:
   - 📦 Your **app service** (from GitHub)
   - 🗄️ A **PostgreSQL database service**

**If you DON'T see a PostgreSQL service:**
- Click **"New"** → **"Database"** → **"Add PostgreSQL"**
- Wait for it to provision (takes ~30 seconds)

### Step 2: Set DATABASE_URL on Your App Service

**CRITICAL:** You must set `DATABASE_URL` on your **APP SERVICE**, not the database service.

1. Click on your **app service** (the one from GitHub, NOT the database)
2. Click the **"Variables"** tab
3. Click **"New Variable"** or **"+ Variable"**
4. Add this variable:

   **Variable Name:** `DATABASE_URL`
   
   **Variable Value:** Click the dropdown and select:
   ```
   ${{Postgres.DATABASE_URL}}
   ```
   
   ⚠️ **Important:** 
   - If your database service is NOT named "Postgres", use its actual name
   - Railway will show you available service references in the dropdown
   - The format is: `${{ServiceName.DATABASE_URL}}`

5. Also add `JWT_SECRET`:
   
   **Variable Name:** `JWT_SECRET`
   
   **Variable Value:** 
   ```
   your-super-long-random-secret-at-least-32-characters-long
   ```

6. Click **"Save"** or the variables will auto-save

### Step 3: Redeploy

After saving variables:

1. Go to the **"Deployments"** tab
2. Click the **"⋮"** menu on the latest deployment
3. Click **"Redeploy"**

OR just trigger a new deployment:
```bash
git commit --allow-empty -m "Trigger Railway redeploy"
git push
```

### Step 4: Verify

Watch the deployment logs. You should see:

```
✓ DATABASE_URL is configured
Running Prisma migrations...
✓ Migrations completed successfully
Server listening on port XXXX
```

Then visit: `https://your-app.railway.app/api/health`

Expected response: `{"status":"ok"}`

## Common Mistakes

### ❌ Setting DATABASE_URL on the database service
- **Wrong:** Adding variables to the PostgreSQL service
- **Right:** Adding variables to your app service (GitHub repo)

### ❌ Using a hardcoded DATABASE_URL
- **Wrong:** `DATABASE_URL=postgresql://user:pass@host:5432/db`
- **Right:** `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- **Why:** Railway references ensure the URL updates if the database changes

### ❌ Not redeploying after adding variables
- Variables only take effect on new deployments
- Always redeploy after changing variables

## Still Not Working?

### Check Database Service Name

1. Go to your Railway project
2. Look at your database service name (might be "Postgres", "PostgreSQL", or custom)
3. Use that exact name in the reference: `${{YourDatabaseName.DATABASE_URL}}`

### Check Database Service is Running

1. Click on your PostgreSQL service
2. Status should be "Active" or "Running"
3. If not, restart it

### Check Service Linking

Railway should automatically link services in the same project, but verify:

1. Click on your app service
2. Look for a "Connected Services" or "Service Variables" section
3. Your database should be listed there

## Alternative: Use Private URL

If the reference doesn't work, you can use the private URL directly:

1. Click on your **PostgreSQL service**
2. Go to **"Variables"** tab
3. Copy the value of `DATABASE_URL` (it will look like `postgresql://...railway.internal...`)
4. Go to your **app service** → **"Variables"** tab
5. Set `DATABASE_URL` to that copied value

⚠️ **Note:** This is less flexible than using the reference, but it will work.

## Need More Help?

Share a screenshot of:
1. Your Railway project showing all services
2. Your app service's Variables tab
3. The latest deployment logs

This will help diagnose the exact issue.
