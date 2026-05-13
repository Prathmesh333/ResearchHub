import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  LogOut,
  Plus,
  Shield,
  Trash2,
  Users
} from "lucide-react";

type Role = "Admin" | "Member";
type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type Project = {
  id: string;
  name: string;
  description?: string | null;
  creator: User;
  members: { user: User }[];
  tasks?: Task[];
  _count?: {
    tasks: number;
    members: number;
  };
};

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  project: {
    id: string;
    name: string;
  };
  assignedUser?: User | null;
};

type Stats = {
  totalProjects: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  projectProgress: number;
};

type AuthResponse = {
  token: string;
  user: User;
};

const emptyStats: Stats = {
  totalProjects: 0,
  totalTasks: 0,
  todoTasks: 0,
  inProgressTasks: 0,
  completedTasks: 0,
  overdueTasks: 0,
  projectProgress: 0
};

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed"
};

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High"
};

function formatDate(value?: string | null) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === "COMPLETED") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < today;
}

function AuthScreen({
  onAuthenticated,
  notice,
  setNotice
}: {
  onAuthenticated: (response: AuthResponse) => void;
  notice: string;
  setNotice: (message: string) => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Member");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");

    try {
      const payload =
        mode === "signup"
          ? { name, email, password, role }
          : { email, password };

      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      onAuthenticated(data as AuthResponse);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Research Project Manager</p>
          <h1>{mode === "login" ? "Sign in" : "Create account"}</h1>
        </div>

        <div className="segmented" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
          >
            Signup
          </button>
        </div>

        {notice && <div className="notice inline">{notice}</div>}

        <form className="stack" onSubmit={submit}>
          {mode === "signup" && (
            <label>
              Name
              <input value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {mode === "signup" && (
            <label>
              Role
              <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
                <option value="Member">Member</option>
                <option value="Admin">Admin</option>
              </select>
            </label>
          )}

          <button className="primary" type="submit" disabled={busy}>
            <Shield size={18} />
            {busy ? "Please wait" : mode === "login" ? "Login" : "Signup"}
          </button>
        </form>
      </section>
    </main>
  );
}

export function App() {
  const [token, setToken] = useState(() => localStorage.getItem("rpm_token") || "");
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [notice, setNotice] = useState("");

  const isAdmin = user?.role === "Admin";

  const projectOptions = useMemo(() => projects.map((project) => project), [projects]);
  const memberUsers = useMemo(() => users.filter((item) => item.role === "Member"), [users]);

  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [memberForm, setMemberForm] = useState({ projectId: "", userId: "" });
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    projectId: "",
    assignedUserId: "",
    dueDate: "",
    priority: "MEDIUM" as TaskPriority
  });

  async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(path, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data as T;
  }

  async function loadData() {
    if (!token) return;
    setLoading(true);
    setNotice("");

    try {
      const [statsData, projectData, taskData] = await Promise.all([
        api<{ stats: Stats }>("/api/dashboard/stats"),
        api<{ projects: Project[] }>("/api/projects"),
        api<{ tasks: Task[] }>("/api/tasks")
      ]);

      setStats(statsData.stats);
      setProjects(projectData.projects);
      setTasks(taskData.tasks);

      if (user?.role === "Admin") {
        const usersData = await api<{ users: User[] }>("/api/users");
        setUsers(usersData.users);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api<{ user: User }>("/api/auth/me");
        setUser(data.user);
      } catch {
        localStorage.removeItem("rpm_token");
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    void restoreSession();
  }, [token]);

  useEffect(() => {
    if (user) {
      void loadData();
    }
  }, [user]);

  useEffect(() => {
    if (!projects[0]) return;

    setMemberForm((current) => ({
      ...current,
      projectId: current.projectId || projects[0].id
    }));
    setTaskForm((current) => ({
      ...current,
      projectId: current.projectId || projects[0].id
    }));
  }, [projects]);

  useEffect(() => {
    if (!memberUsers[0]) return;

    setMemberForm((current) => ({
      ...current,
      userId: current.userId || memberUsers[0].id
    }));
    setTaskForm((current) => ({
      ...current,
      assignedUserId: current.assignedUserId || memberUsers[0].id
    }));
  }, [memberUsers]);

  function handleAuthenticated(response: AuthResponse) {
    localStorage.setItem("rpm_token", response.token);
    setToken(response.token);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem("rpm_token");
    setToken("");
    setUser(null);
    setStats(emptyStats);
    setProjects([]);
    setTasks([]);
    setUsers([]);
  }

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    try {
      await api("/api/projects", {
        method: "POST",
        body: JSON.stringify(projectForm)
      });
      setProjectForm({ name: "", description: "" });
      await loadData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Project was not created");
    }
  }

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    try {
      await api(`/api/projects/${memberForm.projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId: memberForm.userId })
      });
      await loadData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Member was not added");
    }
  }

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    try {
      await api("/api/tasks", {
        method: "POST",
        body: JSON.stringify(taskForm)
      });
      setTaskForm({
        title: "",
        description: "",
        projectId: taskForm.projectId,
        assignedUserId: taskForm.assignedUserId,
        dueDate: "",
        priority: "MEDIUM"
      });
      await loadData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Task was not created");
    }
  }

  async function updateStatus(taskId: string, status: TaskStatus) {
    setNotice("");

    try {
      await api(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
      await loadData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Task status was not updated");
    }
  }

  async function deleteProject(projectId: string) {
    setNotice("");

    try {
      await api(`/api/projects/${projectId}`, { method: "DELETE" });
      await loadData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Project was not deleted");
    }
  }

  async function deleteTask(taskId: string) {
    setNotice("");

    try {
      await api(`/api/tasks/${taskId}`, { method: "DELETE" });
      await loadData();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Task was not deleted");
    }
  }

  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} notice={notice} setNotice={setNotice} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Research Project Manager</p>
          <h1>Workspace</h1>
        </div>
        <div className="account">
          <span className="role-pill">{user.role}</span>
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button className="icon-button" type="button" onClick={logout} aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {notice && <div className="notice">{notice}</div>}

      <main className="workspace">
        <section className="stats-grid" aria-label="Dashboard statistics">
          <article className="stat-card">
            <BarChart3 size={20} />
            <span>Projects</span>
            <strong>{stats.totalProjects}</strong>
          </article>
          <article className="stat-card">
            <ClipboardList size={20} />
            <span>Tasks</span>
            <strong>{stats.totalTasks}</strong>
          </article>
          <article className="stat-card">
            <CheckCircle2 size={20} />
            <span>Completed</span>
            <strong>{stats.completedTasks}</strong>
          </article>
          <article className="stat-card urgent">
            <ClipboardList size={20} />
            <span>Overdue</span>
            <strong>{stats.overdueTasks}</strong>
          </article>
        </section>

        <section className="progress-band">
          <div>
            <span>Progress</span>
            <strong>{stats.projectProgress}%</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${stats.projectProgress}%` }} />
          </div>
          <div className="status-counts">
            <span>{stats.todoTasks} to do</span>
            <span>{stats.inProgressTasks} in progress</span>
            <span>{stats.completedTasks} completed</span>
          </div>
        </section>

        {loading ? (
          <section className="empty-state">Loading workspace</section>
        ) : (
          <div className="content-grid">
            {isAdmin && (
              <aside className="tools-panel">
                <h2>Admin Tools</h2>

                <form className="stack" onSubmit={createProject}>
                  <h3>Create Project</h3>
                  <label>
                    Project name
                    <input
                      value={projectForm.name}
                      onChange={(event) =>
                        setProjectForm((current) => ({ ...current, name: event.target.value }))
                      }
                      required
                    />
                  </label>
                  <label>
                    Description
                    <textarea
                      value={projectForm.description}
                      onChange={(event) =>
                        setProjectForm((current) => ({
                          ...current,
                          description: event.target.value
                        }))
                      }
                    />
                  </label>
                  <button className="primary" type="submit">
                    <Plus size={18} />
                    Create
                  </button>
                </form>

                <form className="stack" onSubmit={addMember}>
                  <h3>Add Member</h3>
                  <label>
                    Project
                    <select
                      value={memberForm.projectId}
                      onChange={(event) =>
                        setMemberForm((current) => ({
                          ...current,
                          projectId: event.target.value
                        }))
                      }
                      required
                    >
                      {projectOptions.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Member
                    <select
                      value={memberForm.userId}
                      onChange={(event) =>
                        setMemberForm((current) => ({ ...current, userId: event.target.value }))
                      }
                      required
                    >
                      {memberUsers.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="secondary" type="submit" disabled={!projects.length || !memberUsers.length}>
                    <Users size={18} />
                    Add
                  </button>
                </form>

                <form className="stack" onSubmit={createTask}>
                  <h3>Create Task</h3>
                  <label>
                    Title
                    <input
                      value={taskForm.title}
                      onChange={(event) =>
                        setTaskForm((current) => ({ ...current, title: event.target.value }))
                      }
                      required
                    />
                  </label>
                  <label>
                    Project
                    <select
                      value={taskForm.projectId}
                      onChange={(event) =>
                        setTaskForm((current) => ({ ...current, projectId: event.target.value }))
                      }
                      required
                    >
                      {projectOptions.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Assignee
                    <select
                      value={taskForm.assignedUserId}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          assignedUserId: event.target.value
                        }))
                      }
                    >
                      <option value="">Unassigned</option>
                      {users.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Due date
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(event) =>
                        setTaskForm((current) => ({ ...current, dueDate: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    Priority
                    <select
                      value={taskForm.priority}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          priority: event.target.value as TaskPriority
                        }))
                      }
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </label>
                  <label>
                    Description
                    <textarea
                      value={taskForm.description}
                      onChange={(event) =>
                        setTaskForm((current) => ({
                          ...current,
                          description: event.target.value
                        }))
                      }
                    />
                  </label>
                  <button className="primary" type="submit" disabled={!projects.length}>
                    <Plus size={18} />
                    Create
                  </button>
                </form>
              </aside>
            )}

            <section className="data-panel">
              <div className="section-heading">
                <h2>Projects</h2>
                <span>{projects.length}</span>
              </div>

              <div className="project-list">
                {projects.length === 0 ? (
                  <div className="empty-state">No projects available</div>
                ) : (
                  projects.map((project) => (
                    <article className="project-card" key={project.id}>
                      <div>
                        <h3>{project.name}</h3>
                        <p>{project.description || "No description"}</p>
                      </div>
                      <div className="project-meta">
                        <span>{project._count?.members ?? project.members.length} members</span>
                        <span>{project._count?.tasks ?? project.tasks?.length ?? 0} tasks</span>
                        <span>Lead: {project.creator.name}</span>
                      </div>
                      {project.members.length > 0 && (
                        <div className="avatars" aria-label="Project members">
                          {project.members.slice(0, 5).map(({ user: member }) => (
                            <span key={member.id} title={`${member.name} (${member.role})`}>
                              {member.name.slice(0, 1).toUpperCase()}
                            </span>
                          ))}
                        </div>
                      )}
                      {isAdmin && (
                        <button
                          className="danger-button"
                          type="button"
                          onClick={() => deleteProject(project.id)}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="data-panel wide">
              <div className="section-heading">
                <h2>Tasks</h2>
                <span>{tasks.length}</span>
              </div>

              <div className="task-table">
                <div className="task-row task-head">
                  <span>Task</span>
                  <span>Project</span>
                  <span>Assignee</span>
                  <span>Due</span>
                  <span>Status</span>
                  <span></span>
                </div>

                {tasks.length === 0 ? (
                  <div className="empty-state">No tasks available</div>
                ) : (
                  tasks.map((task) => (
                    <div className={`task-row ${isOverdue(task) ? "overdue" : ""}`} key={task.id}>
                      <div>
                        <strong>{task.title}</strong>
                        <small>{priorityLabels[task.priority]}</small>
                      </div>
                      <span>{task.project.name}</span>
                      <span>{task.assignedUser?.name || "Unassigned"}</span>
                      <span>{formatDate(task.dueDate)}</span>
                      <select
                        value={task.status}
                        onChange={(event) =>
                          updateStatus(task.id, event.target.value as TaskStatus)
                        }
                      >
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      {isAdmin ? (
                        <button
                          className="icon-button danger"
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          aria-label={`Delete ${task.title}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <span className="status-chip">{statusLabels[task.status]}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
