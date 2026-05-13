# 🎯 Railway Setup Instructions - EXACT STEPS

## Your Environment Variables

You have these variables locally in `.env`:

```env
DATABASE_URL=postgresql://postgres:eZjzmwwolpVnpuyzDRTpVAlpvUAhqIaH@postgres.railway.internal:5432/railway
JWT_SECRET="replace-with-a-long-random-secret"
PORT=5000
```

**BUT** Railway doesn't see them because `.env` is in `.gitignore` (which is correct for security).

## What You MUST Do Now

### Step 1: Go to Railway Dashboard

1. Open https://railway.app
2. Go to your project
3. Click on your **app service** (the one connected to GitHub)

### Step 2: Add Environment Variables

Click the **"Variables"** tab, then add these **THREE** variables:

#### Variable 1: DATABASE_URL
```
DATABASE_URL
```
**Value:** Use the Railway reference (recommended):
```
${{Postgres.DATABASE_URL}}
```

**OR** if that doesn't work, use your direct URL:
```
postgresql://postgres:eZjzmwwolpVnpuyzDRTpVAlpvUAhqIaH@postgres.railway.internal:5432/railway
```

⚠️ **Important:** If your database service is NOT named "Postgres", replace "Postgres" with your actual database service name.

#### Variable 2: JWT_SECRET
```
JWT_SECRET
```
**Value:** Generate a strong secret (don't use the example):
```
your-super-long-random-secret-at-least-32-characters-long-make-it-unique
```

**To generate a secure secret**, run this locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Variable 3: PORT (Optional)
Railway sets this automatically, but you can add it:
```
PORT
```
**Value:**
```
5000
```

### Step 3: Save and Redeploy

1. After adding all variables, they should auto-save
2. Go to the **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment

**OR** trigger a new deployment:
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push
```

### Step 4: Watch the Logs

In Railway, watch the deployment logs. You should now see:

```
✓ DATABASE_URL is configured
Running Prisma migrations...
✓ Migrations completed successfully
Server listening on port 5000
```

### Step 5: Test Your App

Visit: `https://your-app.railway.app/api/health`

Expected response:
```json
{"status":"ok"}
```

## Visual Guide

### Where to Add Variables in Railway:

```
Railway Dashboard
└── Your Project
    └── [Your App Service] ← Click this (GitHub icon)
        └── Variables tab ← Click this
            └── + New Variable ← Click this
                ├── Name: DATABASE_URL
                └── Value: ${{Postgres.DATABASE_URL}}
```

## Troubleshooting

### If DATABASE_URL reference doesn't work:

1. Check your database service name in Railway
2. It might be "PostgreSQL", "postgres", or something custom
3. Use the exact name: `${{YourDatabaseName.DATABASE_URL}}`

### If you can't find the database service:

You need to create it first:
1. In your Railway project, click **"New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Wait for it to provision
5. Then add the `DATABASE_URL` variable to your app service

### If deployment still fails:

Share the latest deployment logs from Railway and I'll help debug further.

## Why This Happens

- **Local development:** Uses `.env` file (loaded by `dotenv`)
- **Railway production:** Uses environment variables set in dashboard
- **Security:** `.env` is in `.gitignore` so secrets aren't committed to Git

This is the correct and secure way to handle environment variables!

## Next Steps After Successful Deployment

1. ✅ Verify health endpoint works
2. ✅ Test API endpoints
3. ✅ Optionally seed demo data:
   ```bash
   # In Railway app service shell
   npm run db:seed
   ```

## Quick Checklist

- [ ] PostgreSQL database service exists in Railway project
- [ ] DATABASE_URL added to app service variables
- [ ] JWT_SECRET added to app service variables (with a strong secret)
- [ ] Variables saved
- [ ] App service redeployed
- [ ] Deployment logs show "DATABASE_URL is configured"
- [ ] Deployment logs show "Migrations completed successfully"
- [ ] Health endpoint returns {"status":"ok"}

Once all checkboxes are complete, your app is live! 🚀
