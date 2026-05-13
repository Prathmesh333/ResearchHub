ResearchHub
===========

ResearchHub is a full-stack research project management application designed for research teams, academic groups, and project coordinators. It helps admins organize research projects, assign team members, create tasks, monitor deadlines, and track progress from one dashboard.

The system supports two main roles: Admin and Member. Admins manage projects, users, and tasks, while members can view their assigned work and update task progress.

Project Purpose
---------------

ResearchHub is created to reduce the confusion that happens when research work is managed through separate chats, spreadsheets, notes, or emails. It gives the team one place to manage research projects, assign responsibilities, check deadlines, and follow task completion.

The project is useful for:

- Research teams working on multiple studies or academic projects
- Project coordinators who need to assign work and track progress
- Students or members who need a clear view of their assigned tasks
- Small teams that need a simple project dashboard without complex enterprise tools

Main Functionalities
--------------------

1. Authentication System

   - Users can create an account using name, email, password, and role.
   - Users can log in using email and password.
   - Passwords are hashed using bcrypt before being stored in the database.
   - JWT tokens are used to keep users authenticated.
   - The application can fetch the logged-in user's profile using the saved token.
   - Protected API routes require a valid authorization token.

2. Role-Based Access

   - The application supports two roles: Admin and Member.
   - Admin users can manage projects, members, and tasks.
   - Member users can view only the work assigned to them.
   - Admin-only routes are protected on the backend.
   - Members cannot access admin management actions.

3. Dashboard

   - Shows total number of projects.
   - Shows total number of tasks.
   - Shows completed task count.
   - Shows overdue task count.
   - Shows task status counts:
     - To Do
     - In Progress
     - Completed
   - Shows overall project progress based on completed tasks.
   - Dashboard data changes based on the logged-in user's role.

4. Project Management

   - Admins can create new research projects.
   - Each project can have a name and description.
   - Admins can delete projects.
   - Admins can assign members to projects.
   - Projects store creator information.
   - Projects are connected with members and tasks in the database.
   - Members can see projects they are assigned to.
   - Admins can view all projects.

5. Team Member Management

   - Admins can view available users.
   - Admins can add members to selected projects.
   - Project members are stored using a project-member relationship table.
   - The same member is not duplicated inside the same project.
   - Member information is shown with project details.

6. Task Management

   - Admins can create tasks for projects.
   - Tasks can include:
     - Title
     - Description
     - Project
     - Assigned member
     - Due date
     - Priority
   - Task priority options are:
     - Low
     - Medium
     - High
   - Task status options are:
     - To Do
     - In Progress
     - Completed
   - Admins can delete tasks.
   - Admins can assign tasks to project members.
   - The backend checks that the assigned user belongs to the selected project.
   - Members can update the status of tasks assigned to them.
   - Members cannot update tasks assigned to other users.

7. Member Workflow

   - Members log in to their own account.
   - Members see only their assigned tasks.
   - Members can check task title, project name, priority, due date, and status.
   - Members can change task status as work progresses.
   - This keeps the member view focused and simple.

8. Admin Workflow

   - Admin logs in to the dashboard.
   - Admin creates projects.
   - Admin assigns members to projects.
   - Admin creates tasks under projects.
   - Admin assigns tasks to members.
   - Admin monitors progress using dashboard statistics.
   - Admin removes projects or tasks when they are no longer needed.

9. REST API

   - The backend exposes REST API endpoints for authentication, users, projects, tasks, and dashboard statistics.
   - API request bodies are validated using Zod.
   - Authentication middleware protects private routes.
   - Admin middleware protects admin-only actions.
   - API responses return clear success or error messages.

10. Database

   - PostgreSQL is used as the database.
   - Prisma is used as the ORM.
   - The database includes models for:
     - User
     - Project
     - ProjectMember
     - Task
   - The database uses relationships between users, projects, project members, and assigned tasks.
   - Deleting a project also removes its related project memberships and tasks.
   - If an assigned user is removed, the task assignment can be set to null.

11. Frontend

   - React is used for the user interface.
   - Vite is used for fast frontend development and production builds.
   - The frontend includes login and signup screens.
   - The dashboard includes project cards, task lists, status labels, and admin tools.
   - The interface changes depending on whether the logged-in user is an Admin or Member.

12. Deployment Support

   - The project is prepared for deployment on Railway.
   - The Express backend serves the production React build.
   - The app can run as a single Railway web service.
   - Railway PostgreSQL can be used as the production database.
   - Environment variables are used for database connection, JWT secret, and server port.

Tech Stack
----------

- React + Vite
- Node.js + Express
- PostgreSQL + Prisma
- JWT + bcrypt
- Railway-ready single service deployment

Local Setup
-----------

1. Install dependencies:

   npm install

2. Create .env from .env.example and set DATABASE_URL and JWT_SECRET.

3. Run migrations:

   npm run db:migrate

4. Seed demo data:

   npm run db:seed

5. Start development servers:

   npm run dev

   Frontend: http://localhost:5173
   API: http://localhost:5000/api/health

Demo Accounts
-------------

After seeding:

- Admin: admin@ethara.dev / admin123
- Member: member@ethara.dev / member123

REST API
--------

- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/me
- GET /api/users
- GET /api/projects
- POST /api/projects
- GET /api/projects/:id
- PUT /api/projects/:id
- DELETE /api/projects/:id
- POST /api/projects/:id/members
- GET /api/tasks
- POST /api/tasks
- GET /api/tasks/:id
- PUT /api/tasks/:id
- DELETE /api/tasks/:id
- PATCH /api/tasks/:id/status
- GET /api/dashboard/stats

Railway Deployment
------------------

1. Push this folder to a GitHub repository.
2. Create a new Railway project from the GitHub repo.
3. Add a PostgreSQL database service in Railway.
4. Set these variables on the web service:

   DATABASE_URL=<Railway PostgreSQL connection URL>
   JWT_SECRET=<long random secret>

5. Railway will use railway.json:

   - Build command: npm run build
   - Start command: npm run start

6. After the first deploy, seed optional demo data from a Railway shell:

   npm run db:seed

The production Express server serves the built React frontend and all /api/* routes from the same HTTPS Railway URL.
