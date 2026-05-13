# Railway Deployment Fix Summary

## Problem

The deployment was failing with:

```text
Error: Environment variable not found: DATABASE_URL
```

This means the Railway app service did not expose `DATABASE_URL` to the start command. The fix adds a Node-based migration entrypoint with explicit validation and clearer logs, but Railway still must have `DATABASE_URL` configured on the app service.

## Solution Applied

### 1. Created Migration Script (`src/server/migrate.ts`)

- Loads environment variables using `dotenv/config`
- Validates that `DATABASE_URL` exists before running migrations
- Runs `prisma migrate deploy` through a Node process
- Provides clear error messages if migration fails

### 2. Updated Start Script (`package.json`)

Before:

```json
"start": "prisma migrate deploy && node dist/server/index.js"
```

After:

```json
"start": "node dist/server/migrate.js && node dist/server/index.js"
```

This gives the deployment a single startup path that validates configuration, applies migrations, and then starts the API.

### 3. Added Nixpacks Configuration (`nixpacks.toml`)

- Explicitly defines Node.js 20 and OpenSSL as dependencies
- Ensures consistent build environment
- Separates install, build, and start phases

## What You Need to Do in Railway

### Step 1: Add PostgreSQL Database

1. Go to your Railway project
2. Click `New` -> `Database` -> `Add PostgreSQL`

### Step 2: Set Environment Variables

In your Railway app service's Variables tab, add:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-long-random-secret-at-least-32-characters-long
```

If your database service is not named `Postgres`, use the exact database service name in the Railway reference. `PORT` is automatically set by Railway.

### Step 3: Deploy

1. Commit and push these changes to your repository
2. Railway will automatically detect the changes and redeploy
3. The new migration script will run if `DATABASE_URL` is available

## Verification

After deployment, check:

1. Health check: visit `https://your-app.railway.app/api/health`
   - Should return: `{"status":"ok"}`
2. Logs should include:
   - `DATABASE_URL is configured`
   - `Migrations completed successfully`
   - `Server listening on port XXXX`

## Files Changed

1. `package.json` - Updated start script
2. `src/server/migrate.ts` - New migration script compiled to `dist/server/migrate.js`
3. `nixpacks.toml` - New Nixpacks configuration
4. `RAILWAY_DEPLOYMENT.md` - Deployment guide
5. `DEPLOYMENT_FIX_SUMMARY.md` - This file

## Why This Works

The app now performs migrations from a compiled Node script before starting the server. That script loads local `.env` files for local runs, validates required runtime configuration, and prints clear Railway logs.

The new approach:

1. Starts a Node.js process that loads environment variables
2. Validates that `DATABASE_URL` exists
3. Runs migrations with full environment variable access
4. Starts the main application server

This still requires `DATABASE_URL` to be defined on the Railway app service.
