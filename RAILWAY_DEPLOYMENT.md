# Railway Deployment Guide

## Environment Variables

Set these variables on the Railway app service created from GitHub, not only on the PostgreSQL service.

Required variables:

- `DATABASE_URL` - PostgreSQL connection string. Prefer a Railway reference such as `${{Postgres.DATABASE_URL}}`.
- `JWT_SECRET` - A long random secret for JWT token signing.
- `PORT` - Railway sets this automatically.

## How to Set Variables

1. Go to your Railway project dashboard.
2. Click the GitHub app service.
3. Open the Variables tab.
4. Add:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-long-random-secret-here-at-least-32-characters
```

If your PostgreSQL service is not named `Postgres`, use Railway autocomplete and select that service's `DATABASE_URL`.

## Database Setup

The app start command runs:

```bash
node dist/server/migrate.js && node dist/server/index.js
```

The migration script validates `DATABASE_URL`, runs `prisma migrate deploy`, and then the server starts.

## Deployment Steps

1. Add a PostgreSQL service: `New` -> `Database` -> `Add PostgreSQL`.
2. Add `DATABASE_URL` and `JWT_SECRET` on the app service.
3. Redeploy the app service.
4. After deployment succeeds, optionally seed demo users from the app service shell:

```bash
npm run db:seed
```

## Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"

Solution:

- Confirm `DATABASE_URL` is visible in the app service Variables tab.
- Confirm the variable is named exactly `DATABASE_URL`.
- Redeploy the newest app service deployment after saving variables.
- Use the private Railway URL or reference variable for app-to-database traffic.

### Migration Fails

Solution:

- Check Railway logs for the specific Prisma error.
- Verify PostgreSQL is running.
- Verify `DATABASE_URL` points to the Railway PostgreSQL database.

## Health Check

Once deployed, verify the deployment:

- Visit: `https://your-app.railway.app/api/health`
- Expected response: `{"status":"ok"}`
