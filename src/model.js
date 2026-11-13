export const STATUSES = [
  { id: "todo", label: "To do" },
  { id: "progress", label: "In progress" },
  { id: "review", label: "In review" },
  { id: "done", label: "Done" }
];
export const PRIORITIES = ["low", "medium", "high", "urgent"];
export const STORAGE_KEY = "paceboard.workspace.v1";
export const THEME_KEY = "paceboard.theme.v1";
const today = () => new Date().toISOString().slice(0, 10);
const offsetDate = (days) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
};
export const uid = () => globalThis.crypto?.randomUUID?.() || "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
const record = (s, text) => [{ id: uid(), text, date: new Date().toISOString() }, ...s.activity].slice(0, 80);
export function newWorkspace() {
  const project = { id: uid(), name: "My first project", description: "A fresh space for your best work.", color: "violet", archived: false, createdAt: new Date().toISOString() };
  return { version: 1, projects: [project], tasks: [], activity: [], sample: false };
}
export function demoWorkspace() {
  const ts = new Date().toISOString();
  const projects = [
    { id: "p-brand", name: "Brand refresh", description: "Create a more memorable and cohesive visual identity.", color: "violet", archived: false, createdAt: ts },
    { id: "p-platform", name: "Website launch", description: "Ship the new website with a polished customer experience.", color: "blue", archived: false, createdAt: ts },
    { id: "p-growth", name: "Growth experiments", description: "Test smarter ways to reach and convert new users.", color: "peach", archived: false, createdAt: ts }
  ];
  const rows = [
    ["Create visual direction", "p-brand", "done", "high", -3, "AM"],
    ["Audit current design system", "p-brand", "done", "medium", -2, "JD"],
    ["Finalize component library", "p-brand", "progress", "high", 2, "AM"],
    ["Review new logo concepts", "p-brand", "review", "medium", 3, "JD"],
    ["Build responsive landing page", "p-platform", "progress", "urgent", 1, "MK"],
    ["Write onboarding content", "p-platform", "todo", "medium", 5, "AM"],
    ["Set up analytics dashboard", "p-platform", "todo", "low", 7, "JD"],
    ["Draft launch checklist", "p-platform", "review", "high", 0, "MK"],
    ["Research acquisition channels", "p-growth", "done", "medium", -1, "JD"],
    ["Design newsletter experiment", "p-growth", "todo", "high", 4, "AM"],
    ["Outline referral campaign", "p-growth", "todo", "low", 9, "MK"]
  ];
  return {
    version: 1, projects,
    tasks: rows.map(([title, projectId, status, priority, offset, assignee], i) => ({
      id: "task-" + i, title, projectId, status, priority, dueDate: offsetDate(offset), assignee,
      description: "", createdAt: ts, updatedAt: ts
    })),
    activity: [{ id: "sample-event", text: "Welcome to your sample workspace", date: ts }],
    sample: true
  };
}
const text = (value, max = 300) => String(value ?? "").trim().slice(0, max);
const dateValid = (value) => value === "" || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + "T12:00:00")));
const unique = (items) => new Set(items.map((item) => item.id)).size === items.length;
export function validateWorkspace(input) {
  if (!input || typeof input !== "object" || input.version !== 1 || !Array.isArray(input.projects) || !Array.isArray(input.tasks) || !Array.isArray(input.activity)) {
    throw new Error("This is not a supported Paceboard backup.");
  }
  if (input.projects.length > 200 || input.tasks.length > 10000 || input.activity.length > 500) throw new Error("Backup exceeds safety limits.");
  const projects = input.projects.map((p) => ({
    id: text(p.id, 100), name: text(p.name, 90), description: text(p.description, 600),
    color: ["violet", "blue", "peach", "mint"].includes(p.color) ? p.color : "violet",
    archived: !!p.archived, createdAt: typeof p.createdAt === "string" ? p.createdAt.slice(0, 40) : today()
  }));
  if (projects.some((p) => !p.id || !p.name) || !unique(projects)) throw new Error("Backup contains invalid or duplicate projects.");
  const projectIds = new Set(projects.map((p) => p.id));
  const tasks = input.tasks.map((t) => ({
    id: text(t.id, 100), title: text(t.title, 160), description: text(t.description, 1200),
    projectId: text(t.projectId, 100), status: t.status, priority: t.priority,
    dueDate: text(t.dueDate, 10), assignee: text(t.assignee, 24),
    createdAt: typeof t.createdAt === "string" ? t.createdAt.slice(0, 40) : today(),
    updatedAt: typeof t.updatedAt === "string" ? t.updatedAt.slice(0, 40) : today()
  }));
  if (tasks.some((t) => !t.id || !t.title || !projectIds.has(t.projectId) || !STATUSES.some((s) => s.id === t.status) || !PRIORITIES.includes(t.priority) || !dateValid(t.dueDate)) || !unique(tasks)) {
    throw new Error("Backup contains invalid tasks or broken project links.");
  }
  const activity = input.activity.slice(0, 80).map((a) => ({
    id: text(a.id, 100) || uid(), text: text(a.text, 200),
    date: typeof a.date === "string" ? a.date.slice(0, 40) : today()
  }));
  return { version: 1, projects, tasks, activity, sample: !!input.sample };
}
const clone = (state) => structuredClone(state);
export function upsertProject(state, values, id = null) {
  const s = clone(state);
  const name = text(values.name, 90);
  if (!name) throw new Error("Project name is required.");
  const color = ["violet", "blue", "peach", "mint"].includes(values.color) ? values.color : "violet";
  if (id) {
    const found = s.projects.find((p) => p.id === id);
    if (!found) throw new Error("Project no longer exists.");
    Object.assign(found, { name, description: text(values.description, 600), color });
    s.activity = record(s, "Updated project: " + name);
  } else {
    const project = { id: uid(), name, description: text(values.description, 600), color, archived: false, createdAt: new Date().toISOString() };
    s.projects.push(project);
    s.activity = record(s, "Created project: " + name);
  }
  s.sample = false;
  return s;
}
export function archiveProject(state, id) {
  const s = clone(state);
  const project = s.projects.find((p) => p.id === id);
  if (!project) throw new Error("Project no longer exists.");
  project.archived = !project.archived;
  s.activity = record(s, (project.archived ? "Archived" : "Restored") + " project: " + project.name);
  s.sample = false;
  return s;
}
export function deleteProject(state, id) {
  const s = clone(state);
  const project = s.projects.find((p) => p.id === id);
  if (!project) throw new Error("Project no longer exists.");
  s.projects = s.projects.filter((p) => p.id !== id);
  s.tasks = s.tasks.filter((t) => t.projectId !== id);
  s.activity = record(s, "Deleted project: " + project.name);
  s.sample = false;
  return s;
}
export function upsertTask(state, values, id = null) {
  const s = clone(state);
  const title = text(values.title, 160);
  const projectId = text(values.projectId, 100);
  if (!title) throw new Error("Task title is required.");
  if (!s.projects.some((p) => p.id === projectId && !p.archived)) throw new Error("Select an active project.");
  if (!STATUSES.some((x) => x.id === values.status)) throw new Error("Invalid status.");
  if (!PRIORITIES.includes(values.priority)) throw new Error("Invalid priority.");
  if (!dateValid(values.dueDate || "")) throw new Error("Invalid due date.");
  const updated = {
    title, projectId, description: text(values.description, 1200), status: values.status,
    priority: values.priority, dueDate: values.dueDate || "", assignee: text(values.assignee, 24),
    updatedAt: new Date().toISOString()
  };
  if (id) {
    const old = s.tasks.find((t) => t.id === id);
    if (!old) throw new Error("Task no longer exists.");
    Object.assign(old, updated);
    s.activity = record(s, "Updated task: " + title);
  } else {
    s.tasks.unshift({ id: uid(), ...updated, createdAt: new Date().toISOString() });
    s.activity = record(s, "Created task: " + title);
  }
  s.sample = false;
  return s;
}
export function moveTask(state, id, status) {
  if (!STATUSES.some((s) => s.id === status)) throw new Error("Invalid status.");
  const s = clone(state);
  const task = s.tasks.find((t) => t.id === id);
  if (!task) throw new Error("Task no longer exists.");
  if (task.status !== status) {
    task.status = status;
    task.updatedAt = new Date().toISOString();
    s.activity = record(s, "Moved “" + task.title + "” to " + STATUSES.find((x) => x.id === status).label);
  }
  s.sample = false;
  return s;
}
export function deleteTask(state, id) {
  const s = clone(state);
  const task = s.tasks.find((t) => t.id === id);
  if (!task) throw new Error("Task no longer exists.");
  s.tasks = s.tasks.filter((t) => t.id !== id);
  s.activity = record(s, "Deleted task: " + task.title);
  s.sample = false;
  return s;
}
export const visibleTasks = (s) => s.tasks.filter((t) => s.projects.some((p) => p.id === t.projectId && !p.archived));
export function getMetrics(s) {
  const tasks = visibleTasks(s);
  const completed = tasks.filter((t) => t.status === "done").length;
  const upcoming = tasks.filter((t) => t.status !== "done" && t.dueDate && daysUntil(t.dueDate) >= 0 && daysUntil(t.dueDate) <= 7).length;
  const overdue = tasks.filter((t) => t.status !== "done" && t.dueDate && daysUntil(t.dueDate) < 0).length;
  return { total: tasks.length, completed, active: tasks.length - completed, upcoming, overdue, rate: tasks.length ? Math.round(completed / tasks.length * 100) : 0, projects: s.projects.filter((p) => !p.archived).length };
}
export function daysUntil(date) {
  if (!date) return null;
  const local = new Date();
  local.setHours(12, 0, 0, 0);
  const due = new Date(date + "T12:00:00");
  return Math.round((due - local) / 86400000);
}
export function filterTasks(s, opts = {}) {
  const search = text(opts.search, 200).toLocaleLowerCase();
  return visibleTasks(s).filter((t) => {
    const project = s.projects.find((p) => p.id === t.projectId);
    return (!opts.project || t.projectId === opts.project) &&
      (!opts.priority || t.priority === opts.priority) &&
      (!opts.status || t.status === opts.status) &&
      (!search || [t.title, t.description, t.assignee, project?.name].some((x) => (x || "").toLocaleLowerCase().includes(search)));
  });
}
export function projectProgress(s, id) {
  const tasks = s.tasks.filter((t) => t.projectId === id);
  const done = tasks.filter((t) => t.status === "done").length;
  return { total: tasks.length, done, rate: tasks.length ? Math.round(100 * done / tasks.length) : 0 };
}
