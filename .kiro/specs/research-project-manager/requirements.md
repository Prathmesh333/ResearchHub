# Requirements Document

## Introduction

The Research Project Manager is a full-stack web application designed to help academic and research teams manage research projects, assign tasks, track progress, and monitor deadlines. The system supports role-based access control with Admin/Research Lead and Member/Researcher roles. It provides comprehensive project management capabilities including project creation, team member management, task assignment, progress tracking, and analytics dashboards. The application uses a REST API architecture with PostgreSQL database, JWT authentication, and is deployed on Railway.

## Glossary

- **System**: The Research Project Manager web application
- **Admin**: A user with administrative privileges who can create and manage projects, tasks, and team members
- **Member**: A user with standard privileges who can view assigned projects and update task status
- **Project**: A research initiative that contains tasks and team members
- **Task**: A specific work item within a project that can be assigned to a member
- **Dashboard**: A visual interface displaying project and task statistics
- **Authentication_Service**: The component responsible for user signup, login, and session management
- **Project_Service**: The component responsible for project creation, modification, and deletion
- **Task_Service**: The component responsible for task creation, modification, and status updates
- **Authorization_Service**: The component responsible for enforcing role-based access control
- **Database**: The PostgreSQL database storing all system data
- **API**: The REST API interface for client-server communication

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to sign up and log in securely, so that I can access the system with my credentials

#### Acceptance Criteria

1. THE Authentication_Service SHALL provide a signup endpoint at POST /api/auth/signup
2. WHEN a user submits signup data, THE Authentication_Service SHALL require a name field
3. WHEN a user submits signup data, THE Authentication_Service SHALL require an email field
4. WHEN a user submits signup data, THE Authentication_Service SHALL validate that the email format is valid
5. WHEN a user submits signup data, THE Authentication_Service SHALL verify that the email is unique in the Database
6. WHEN a user submits signup data, THE Authentication_Service SHALL require a password field
7. WHEN a user submits a valid signup request, THE Authentication_Service SHALL hash the password using bcrypt
8. WHEN a user submits a valid signup request, THE Authentication_Service SHALL store the user record in the Database
9. THE Authentication_Service SHALL provide a login endpoint at POST /api/auth/login
10. WHEN a user submits login credentials, THE Authentication_Service SHALL verify the email exists in the Database
11. WHEN a user submits login credentials, THE Authentication_Service SHALL verify the password matches the stored hash
12. WHEN login credentials are valid, THE Authentication_Service SHALL generate a JWT token
13. WHEN login credentials are valid, THE Authentication_Service SHALL return the JWT token to the user
14. THE Authentication_Service SHALL provide a user profile endpoint at GET /api/auth/me
15. WHEN a user requests their profile, THE Authorization_Service SHALL verify the JWT token is valid
16. WHEN a JWT token is valid, THE Authentication_Service SHALL return the user profile data

### Requirement 2: Role-Based Access Control

**User Story:** As a system administrator, I want role-based access control enforced, so that users can only perform actions appropriate to their role

#### Acceptance Criteria

1. THE Database SHALL store a role field for each user with values Admin or Member
2. WHEN a user is created, THE System SHALL assign a role to the user
3. WHEN a user attempts to access a protected resource, THE Authorization_Service SHALL verify the JWT token
4. WHEN a user attempts to access a protected resource, THE Authorization_Service SHALL extract the user role from the token
5. WHEN an Admin attempts to create a project, THE Authorization_Service SHALL permit the action
6. WHEN a Member attempts to create a project, THE Authorization_Service SHALL deny the action
7. WHEN an Admin attempts to edit a project, THE Authorization_Service SHALL permit the action
8. WHEN a Member attempts to edit a project, THE Authorization_Service SHALL deny the action
9. WHEN an Admin attempts to delete a project, THE Authorization_Service SHALL permit the action
10. WHEN a Member attempts to delete a project, THE Authorization_Service SHALL deny the action
11. WHEN an Admin attempts to create a task, THE Authorization_Service SHALL permit the action
12. WHEN a Member attempts to create a task, THE Authorization_Service SHALL deny the action
13. WHEN an Admin attempts to delete a task, THE Authorization_Service SHALL permit the action
14. WHEN a Member attempts to delete a task, THE Authorization_Service SHALL deny the action
15. WHEN a Member attempts to update the status of an assigned task, THE Authorization_Service SHALL permit the action
16. WHEN a Member attempts to update the status of a non-assigned task, THE Authorization_Service SHALL deny the action

### Requirement 3: Project Management

**User Story:** As an Admin, I want to create and manage research projects, so that I can organize research work

#### Acceptance Criteria

1. THE Project_Service SHALL provide a project creation endpoint at POST /api/projects
2. WHEN an Admin creates a project, THE Project_Service SHALL require a project name field
3. WHEN an Admin creates a project, THE Project_Service SHALL store the project in the Database
4. WHEN an Admin creates a project, THE Database SHALL record the Admin as the project creator
5. THE Project_Service SHALL provide a project list endpoint at GET /api/projects
6. WHEN a user requests the project list, THE Project_Service SHALL return projects the user has access to
7. WHEN an Admin requests the project list, THE Project_Service SHALL return all projects
8. WHEN a Member requests the project list, THE Project_Service SHALL return only projects where the Member is assigned
9. THE Project_Service SHALL provide a project detail endpoint at GET /api/projects/:id
10. WHEN a user requests project details, THE Project_Service SHALL return the project data if the user has access
11. THE Project_Service SHALL provide a project update endpoint at PUT /api/projects/:id
12. WHEN an Admin updates a project, THE Project_Service SHALL require a project name field
13. WHEN an Admin updates a project, THE Project_Service SHALL save the updated project data to the Database
14. THE Project_Service SHALL provide a project deletion endpoint at DELETE /api/projects/:id
15. WHEN an Admin deletes a project, THE Project_Service SHALL remove the project from the Database
16. WHEN an Admin deletes a project, THE Project_Service SHALL remove all associated tasks from the Database
17. WHEN an Admin deletes a project, THE Project_Service SHALL remove all project member associations from the Database

### Requirement 4: Project Team Management

**User Story:** As an Admin, I want to add members to projects, so that team members can collaborate on research

#### Acceptance Criteria

1. THE Project_Service SHALL provide a member addition endpoint at POST /api/projects/:id/members
2. WHEN an Admin adds a member to a project, THE Project_Service SHALL verify the user exists in the Database
3. WHEN an Admin adds a member to a project, THE Project_Service SHALL verify the project exists in the Database
4. WHEN an Admin adds a member to a project, THE Project_Service SHALL create a ProjectMember record in the Database
5. WHEN an Admin adds a member to a project, THE Database SHALL establish a many-to-many relationship between User and Project
6. THE Database SHALL allow one User to belong to many Projects
7. THE Database SHALL allow one Project to have many Members

### Requirement 5: Task Management

**User Story:** As an Admin, I want to create and manage tasks within projects, so that I can organize and assign research work

#### Acceptance Criteria

1. THE Task_Service SHALL provide a task creation endpoint at POST /api/tasks
2. WHEN an Admin creates a task, THE Task_Service SHALL require a task title field
3. WHEN an Admin creates a task, THE Task_Service SHALL require a project identifier
4. WHEN an Admin creates a task, THE Task_Service SHALL verify the project exists in the Database
5. WHEN an Admin creates a task, THE Task_Service SHALL accept an optional assigned user identifier
6. WHEN an Admin creates a task, THE Task_Service SHALL accept an optional due date field
7. WHEN an Admin creates a task with a due date, THE Task_Service SHALL validate the due date format is valid
8. WHEN an Admin creates a task, THE Task_Service SHALL accept a priority field with values LOW, MEDIUM, or HIGH
9. WHEN an Admin creates a task, THE Task_Service SHALL set the initial status to TODO
10. WHEN an Admin creates a task, THE Task_Service SHALL store the task in the Database
11. THE Database SHALL establish a many-to-one relationship between Task and Project
12. THE Database SHALL establish a many-to-one relationship between Task and assigned User
13. THE Task_Service SHALL provide a task list endpoint at GET /api/tasks
14. WHEN a user requests the task list, THE Task_Service SHALL return tasks the user has access to
15. WHEN an Admin requests the task list, THE Task_Service SHALL return all tasks
16. WHEN a Member requests the task list, THE Task_Service SHALL return only tasks assigned to the Member
17. THE Task_Service SHALL provide a task detail endpoint at GET /api/tasks/:id
18. WHEN a user requests task details, THE Task_Service SHALL return the task data if the user has access
19. THE Task_Service SHALL provide a task update endpoint at PUT /api/tasks/:id
20. WHEN an Admin updates a task, THE Task_Service SHALL accept updated title, due date, priority, and assigned user fields
21. WHEN an Admin updates a task, THE Task_Service SHALL save the updated task data to the Database
22. THE Task_Service SHALL provide a task deletion endpoint at DELETE /api/tasks/:id
23. WHEN an Admin deletes a task, THE Task_Service SHALL remove the task from the Database

### Requirement 6: Task Status Management

**User Story:** As a Member, I want to update the status of my assigned tasks, so that I can track my progress

#### Acceptance Criteria

1. THE Task_Service SHALL provide a task status update endpoint at PATCH /api/tasks/:id/status
2. WHEN a user updates task status, THE Task_Service SHALL accept status values TODO, IN_PROGRESS, or COMPLETED
3. WHEN a user updates task status, THE Task_Service SHALL validate the status value is one of the allowed values
4. WHEN a Member updates task status, THE Authorization_Service SHALL verify the task is assigned to the Member
5. WHEN a user submits a valid status update, THE Task_Service SHALL save the new status to the Database
6. THE Database SHALL store the task status field with values TODO, IN_PROGRESS, or COMPLETED

### Requirement 7: Dashboard Analytics

**User Story:** As a user, I want to view dashboard statistics, so that I can monitor project and task progress

#### Acceptance Criteria

1. THE System SHALL provide a dashboard statistics endpoint at GET /api/dashboard/stats
2. WHEN a user requests dashboard statistics, THE System SHALL calculate the total number of projects the user has access to
3. WHEN a user requests dashboard statistics, THE System SHALL calculate the total number of tasks the user has access to
4. WHEN a user requests dashboard statistics, THE System SHALL calculate the number of tasks with status TODO
5. WHEN a user requests dashboard statistics, THE System SHALL calculate the number of tasks with status IN_PROGRESS
6. WHEN a user requests dashboard statistics, THE System SHALL calculate the number of tasks with status COMPLETED
7. WHEN a user requests dashboard statistics, THE System SHALL calculate the number of overdue tasks
8. WHEN calculating overdue tasks, THE System SHALL identify tasks where the due date is before the current date and status is not COMPLETED
9. WHEN a user requests dashboard statistics, THE System SHALL calculate the project progress percentage
10. WHEN calculating project progress percentage, THE System SHALL divide completed tasks by total tasks and multiply by 100
11. WHEN a user requests dashboard statistics, THE System SHALL return all calculated metrics in the response
12. WHEN an Admin requests dashboard statistics, THE System SHALL include all projects and tasks in calculations
13. WHEN a Member requests dashboard statistics, THE System SHALL include only assigned projects and tasks in calculations

### Requirement 8: Data Validation

**User Story:** As a system administrator, I want data validation enforced, so that data integrity is maintained

#### Acceptance Criteria

1. WHEN a user submits data to any API endpoint, THE System SHALL validate required fields are present
2. WHEN a user submits an email field, THE System SHALL validate the email format matches standard email patterns
3. WHEN a user submits a task status field, THE System SHALL validate the value is TODO, IN_PROGRESS, or COMPLETED
4. WHEN a user submits a task priority field, THE System SHALL validate the value is LOW, MEDIUM, or HIGH
5. WHEN a user submits a due date field, THE System SHALL validate the date format is valid
6. WHEN validation fails, THE System SHALL return an error response with status code 400
7. WHEN validation fails, THE System SHALL return an error message describing the validation failure
8. THE System SHALL use Zod or express-validator for request validation

### Requirement 9: Database Schema

**User Story:** As a system administrator, I want a properly structured database schema, so that data relationships are maintained

#### Acceptance Criteria

1. THE Database SHALL contain a User table with fields for id, name, email, password, and role
2. THE Database SHALL contain a Project table with fields for id, name, and creator user id
3. THE Database SHALL contain a ProjectMember table with fields for project id and user id
4. THE Database SHALL contain a Task table with fields for id, title, description, status, priority, due date, project id, and assigned user id
5. THE Database SHALL enforce a foreign key relationship between Project creator and User
6. THE Database SHALL enforce a foreign key relationship between ProjectMember project and Project
7. THE Database SHALL enforce a foreign key relationship between ProjectMember user and User
8. THE Database SHALL enforce a foreign key relationship between Task project and Project
9. THE Database SHALL enforce a foreign key relationship between Task assigned user and User
10. THE Database SHALL enforce a unique constraint on User email field
11. THE System SHALL use Prisma as the ORM for database operations

### Requirement 10: Deployment

**User Story:** As a project stakeholder, I want the application deployed and accessible, so that users can access the system

#### Acceptance Criteria

1. THE System SHALL be deployed on Railway platform
2. THE System SHALL provide a live URL for accessing the application
3. THE System SHALL include a GitHub repository containing the source code
4. THE System SHALL include a README file with setup instructions
5. THE System SHALL include a demo video demonstrating the application functionality
6. THE System SHALL use PostgreSQL as the production database
7. THE System SHALL serve the React frontend built with Vite
8. THE System SHALL serve the Node.js Express backend API
9. WHEN the application is deployed, THE System SHALL be accessible via HTTPS protocol
