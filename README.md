# Research Project Manager

A simple full-stack research project management app with Admin and Member roles.

## Features

- JWT authentication with signup, login, and profile lookup
- Admin project creation, deletion, and team member assignment
- Admin task creation, assignment, priority, due date, and deletion
- Member task visibility and assigned task status updates
- Dashboard statistics for projects, tasks, status counts, progress, and overdue work
- PostgreSQL schema with Prisma relationships and validation through Zod
- React frontend built with Vite and served by the Express API in production

## Tech Stack

- React + Vite
- Node.js + Express
- PostgreSQL + Prisma
- JWT + bcrypt
- Railway-ready single service deployment

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and set `DATABASE_URL` and `JWT_SECRET`.

3. Run migrations:

   ```bash
   npm run db:migrate
   ```

4. Seed demo data:

   ```bash
   npm run db:seed
   ```

5. Start development servers:

   ```bash
   npm run dev
   ```

   Frontend: `http://localhost:5173`  
   API: `http://localhost:5000/api/health`

## Demo Accounts

After seeding:

- Admin: `admin@ethara.dev` / `admin123`
- Member: `member@ethara.dev` / `member123`

## REST API

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/users`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/members`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `GET /api/dashboard/stats`

## Railway Deployment

1. Push this folder to a GitHub repository.
2. Create a new Railway project from the GitHub repo.
3. Add a PostgreSQL database service in Railway.
4. Set these variables on the web service:

   ```bash
   DATABASE_URL=<Railway PostgreSQL connection URL>
   JWT_SECRET=<long random secret>
   ```

5. Railway will use `railway.json`:

   - Build command: `npm run build`
   - Start command: `npm run start`

6. After the first deploy, seed optional demo data from a Railway shell:

   ```bash
   npm run db:seed
   ```

The production Express server serves the built React frontend and all `/api/*` routes from the same HTTPS Railway URL.
