# Railway Deployment Checklist

## Before Deploying

- [x] Fixed migration script to load environment variables
- [x] Updated package.json start command
- [x] Added nixpacks.toml configuration
- [x] Verified TypeScript compilation
- [x] Built project successfully

## In Railway Dashboard

### 1. Add PostgreSQL Database

- [ ] Click `New` -> `Database` -> `Add PostgreSQL`
- [ ] Verify database is linked to your service
- [ ] Confirm `DATABASE_URL` appears in the app service Variables tab

### 2. Set Environment Variables

Go to your app service Variables tab and add:

- [ ] `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
- [ ] `JWT_SECRET` = `your-super-long-random-secret-at-least-32-characters`

Auto-set by Railway:

- [ ] `PORT`

### 3. Deploy

- [ ] Commit all changes: `git add .`
- [ ] Commit: `git commit -m "Fix Railway deployment with proper env var handling"`
- [ ] Push: `git push`
- [ ] Wait for Railway to detect and deploy

### 4. Verify Deployment

- [ ] Check deployment logs for `Migrations completed successfully`
- [ ] Check logs for `Server listening on port XXXX`
- [ ] Visit `https://your-app.railway.app/api/health`
- [ ] Expected response: `{"status":"ok"}`

## If Deployment Still Fails

1. Check Railway logs for specific error messages.
2. Verify `DATABASE_URL` is set on the app service.
3. Confirm the PostgreSQL service is running.
4. Run migrations manually from the Railway app service shell if needed.

## Common Issues

### `DATABASE_URL` Not Found

- Fix: add `DATABASE_URL` to the app service Variables tab.
- Check: the variable name must be exactly `DATABASE_URL`.

### Connection Refused

- Fix: verify the PostgreSQL service is running.
- Check: use the internal Railway database URL or service reference.

### Migration Failed

- Fix: check migration files in `prisma/migrations/`.
- Check: ensure `prisma/schema.prisma` is valid.

## Need Help?

Check these files:

- `DEPLOYMENT_FIX_SUMMARY.md` - Detailed explanation of fixes
- `RAILWAY_DEPLOYMENT.md` - Full deployment guide
- Railway logs - Real-time deployment information
