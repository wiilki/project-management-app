import {
  STATUSES, PRIORITIES, STORAGE_KEY, THEME_KEY,
  demoWorkspace, newWorkspace, validateWorkspace, upsertProject, archiveProject,
  deleteProject, upsertTask, moveTask, deleteTask, getMetrics, filterTasks,
  visibleTasks, projectProgress, daysUntil
} from "./model.js";

const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const ico = (name, cls = "") => '<svg class="icon ' + cls + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
const titleCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const formatted = (date, opts = { month: "short", day: "numeric" }) => date ? new Intl.DateTimeFormat(undefined, opts).format(new Date(date + "T12:00:00")) : "No date";
const relativeTime = (date) => {
  const delta = Math.max(0, Date.now() - new Date(date).getTime());
  if (!Number.isFinite(delta)) return "Recently";
  if (delta < 60000) return "Just now";
  if (delta < 3600000) return Math.floor(delta / 60000) + " min ago";
  if (delta < 86400000) return Math.floor(delta / 3600000) + " hr ago";
  return formatted(new Date(date).toISOString().slice(0, 10));
};
let state;
let recovered = false;
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  state = raw ? validateWorkspace(JSON.parse(raw)) : demoWorkspace();
} catch (error) {
  recovered = true;
  state = demoWorkspace();
}
let view = ["overview", "board", "list", "projects", "timeline", "settings"].includes(location.hash.slice(1)) ? location.hash.slice(1) : "overview";
let filters = { project: "", priority: "", search: "" };
let dragId = null;
let toastTimeout;
try { document.body.classList.toggle("dark", localStorage.getItem(THEME_KEY) === "dark"); } catch {}
const projectFor = (id) => state.projects.find((p) => p.id === id);
const activeProjects = () => state.projects.filter((p) => !p.archived);
function persist(next, message) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    state = next;
    render();
    if (message) notify(message);
    return true;
  } catch {
    notify("Couldn't save changes. Check browser storage permissions or available space.");
    return false;
  }
}
function change(operation, success) {
  try { persist(operation(state), success); } catch (error) { notify(error.message || "Unable to update workspace."); }
}
function notify(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 3600);
}
const count = (num, item) => num + " " + item + (num === 1 ? "" : "s");
const priority = (p) => '<span class="priority-pill ' + esc(p) + '">' + titleCase(p) + '</span>';
function duePill(task) {
  if (!task.dueDate) return '<span class="date-pill">No deadline</span>';
  const days = daysUntil(task.dueDate);
  const cls = task.status === "done" ? "" : days < 0 ? " overdue" : days <= 2 ? " soon" : "";
  const label = days === 0 ? "Today" : days === 1 ? "Tomorrow" : days === -1 ? "Yesterday" : formatted(task.dueDate);
  return '<span class="date-pill' + cls + '">' + ico("calendar") + " " + label + "</span>";
}
function empty(message, subtitle, action = "new-task", actionText = "Add a task") {
  return '<div class="empty-state"><div class="empty-icon">' + ico("sparkles") + '</div><h3>' + esc(message) + '</h3><p>' + esc(subtitle) + '</p>' +
    (action ? '<button class="btn btn-primary" data-action="' + action + '">' + ico("plus") + esc(actionText) + '</button>' : "") + "</div>";
}
function pageHead(eyebrow, title, subtitle, actions = "") {
  return '<section class="page-header"><div><div class="eyebrow">' + esc(eyebrow) + '</div><h1 class="page-title">' + esc(title) +
    '</h1><p class="page-subtitle">' + esc(subtitle) + '</p></div><div class="page-actions">' + actions + "</div></section>";
}
const newTaskButton = '<button class="btn btn-primary" data-action="new-task">' + ico("plus") + " New task</button>";
const newProjectButton = '<button class="btn btn-primary" data-action="new-project">' + ico("plus") + " New project</button>";
function progressBar(value) {
  return '<div class="mini-progress" role="progressbar" aria-valuenow="' + value + '" aria-valuemin="0" aria-valuemax="100" aria-label="Project completion"><span style="width:' + value + '%"></span></div>';
}
function compactTask(task) {
  const project = projectFor(task.projectId);
  return '<div class="task-compact"><button class="task-check ' + (task.status === "done" ? "done" : "") + '" data-action="toggle-task" data-id="' + esc(task.id) +
    '" aria-label="' + (task.status === "done" ? "Reopen" : "Complete") + ' ' + esc(task.title) + '">' + (task.status === "done" ? ico("check") : "") +
    '</button><div class="task-compact-name"><strong>' + esc(task.title) + '</strong><small>' + esc(project?.name || "Unknown project") +
    '</small></div>' + duePill(task) + '</div>';
}
function overview() {
  const m = getMetrics(state);
  const tasks = visibleTasks(state);
  const open = tasks.filter((t) => t.status !== "done").sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  const recent = [...tasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const projects = activeProjects().slice(0, 4);
  const date = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const stat = (label, value, foot, color, symbol) =>
    '<div class="stat-card"><div class="stat-top"><span class="stat-label">' + label + '</span><span class="stat-icon ' + color + '">' + ico(symbol) +
    '</span></div><div class="stat-value">' + value + '</div><div class="stat-foot">' + foot + '</div></div>';
  const projectRows = projects.map((p) => {
    const prog = projectProgress(state, p.id);
    return '<div class="project-row"><span class="project-icon ' + esc(p.color) + '">' + ico("folder") + '</span><div class="project-info"><strong>' +
      esc(p.name) + '</strong><small>' + count(prog.total, "task") + '</small>' + progressBar(prog.rate) +
      '</div><span class="project-percent">' + prog.rate + '%</span></div>';
  }).join("");
  const activities = state.activity.slice(0, 5).map((a) =>
    '<div class="activity-item"><span class="activity-dot">' + ico("check") + '</span><div><strong>' + esc(a.text) + '</strong><small>' + relativeTime(a.date) + '</small></div></div>'
  ).join("");
  return pageHead("YOUR WORKSPACE", "Good things are in motion.", "Here's what your projects look like today.", newTaskButton) +
    '<div class="welcome-banner"><div class="welcome-copy"><span class="greeting">' + esc(date.toUpperCase()) +
    '</span><h2>Make space for progress.</h2><p>Big ideas, small steps. Keep moving forward and let every win count.</p></div><div class="welcome-art" aria-hidden="true"><div class="orb one"></div><div class="orb two"></div><div class="orb three"></div></div></div>' +
    (state.sample ? '<div class="notice"><strong>Sample workspace:</strong> Explore with demo tasks, or start fresh in Settings & data. Edits are saved only in your browser.</div>' : "") +
    '<section class="stats-grid" aria-label="Workspace statistics">' +
    stat("Active projects", m.projects, "Spaces in progress", "violet", "folder") +
    stat("Tasks to complete", m.active, m.total + " tasks in total", "blue", "list") +
    stat("Completed", m.completed, "<strong>" + m.rate + "% completion rate</strong>", "green", "check") +
    stat("Due this week", m.upcoming, m.overdue ? m.overdue + " overdue need attention" : "Looking good so far", "peach", "calendar") + "</section>" +
    '<div class="dashboard-grid"><section class="surface-card"><div class="section-head"><h2>Project progress</h2><button class="link-button" data-view="projects">View all projects →</button></div>' +
    (projectRows || empty("No projects yet", "Create a project to start planning.", "new-project", "Create project")) +
    '</section><section class="surface-card"><div class="section-head"><h2>Recent activity</h2><span class="date-pill">Latest updates</span></div>' +
    (activities || empty("Nothing here yet", "Your updates will show up as you work.", null)) + "</section></div>" +
    '<div class="two-column"><section class="surface-card"><div class="section-head"><h2>Coming up next</h2><button class="link-button" data-view="timeline">See upcoming →</button></div>' +
    (open.slice(0, 5).map(compactTask).join("") || empty("You’re all caught up", "No open tasks on your list.", "new-task", "Create task")) +
    '</section><section class="surface-card"><div class="section-head"><h2>Recently touched</h2><button class="link-button" data-view="list">Browse tasks →</button></div>' +
    (recent.map(compactTask).join("") || empty("No tasks yet", "Your tasks will appear here once added.", "new-task", "Create task")) + "</section></div>";
}
function filterBar() {
  const options = (arr, selected) => arr.map((item) => '<option value="' + esc(item.id) + '"' + (selected === item.id ? " selected" : "") + '>' + esc(item.label) + "</option>").join("");
  const projects = [{ id: "", label: "All projects" }, ...activeProjects().map((p) => ({ id: p.id, label: p.name }))];
  const priorities = [{ id: "", label: "All priorities" }, ...PRIORITIES.map((p) => ({ id: p, label: titleCase(p) }))];
  return '<div class="filters-bar"><div class="filters-left"><select id="filterProject" class="select-filter" aria-label="Filter by project">' + options(projects, filters.project) +
    '</select><select id="filterPriority" class="select-filter" aria-label="Filter by priority">' + options(priorities, filters.priority) + '</select></div>' +
    '<div class="view-toggle" aria-label="Task display"><button data-view="board" class="' + (view === "board" ? "selected" : "") + '">Board</button><button data-view="list" class="' + (view === "list" ? "selected" : "") + '">List</button></div></div>';
}
function taskCard(t) {
  const p = projectFor(t.projectId);
  const statuses = STATUSES.map((x) => x.id);
  const index = statuses.indexOf(t.status);
  return '<article class="task-card" draggable="true" data-task-id="' + esc(t.id) + '" aria-label="' + esc(t.title) + '">' +
    '<div class="task-card-header">' + priority(t.priority) + '<button class="card-more" data-action="edit-task" data-id="' + esc(t.id) +
    '" aria-label="Edit ' + esc(t.title) + '">' + ico("more") + '</button></div><h3>' + esc(t.title) + '</h3><div class="project-tag">' +
    esc(p?.name || "Unknown project") + '</div>' + (t.description ? '<p class="task-card-desc">' + esc(t.description) + '</p>' : "") +
    '<div class="task-card-footer">' + duePill(t) + (t.assignee ? '<span class="task-assignee" title="Assigned to ' + esc(t.assignee) + '">' + esc(t.assignee.slice(0, 2).toUpperCase()) + "</span>" : "") +
    '</div><div class="card-quick-actions"><button data-action="edit-task" data-id="' + esc(t.id) + '">Edit</button>' +
    (index < statuses.length - 1 ? '<button data-action="advance-task" data-id="' + esc(t.id) + '">Next stage →</button>' :
    '<button data-action="toggle-task" data-id="' + esc(t.id) + '">Reopen task</button>') + "</div></article>";
}
function board() {
  const tasks = filterTasks(state, filters);
  return pageHead("TASK MANAGEMENT", "Your work, at a glance.", "Move cards between stages, or open a card to edit every detail.", newTaskButton) +
    filterBar() + '<div class="board" aria-label="Task board">' + STATUSES.map((status) => {
      const group = tasks.filter((t) => t.status === status.id);
      return '<section class="board-column" data-status="' + status.id + '"><div class="column-head"><span class="column-label"><span class="column-dot ' +
        status.id + '"></span>' + status.label + '</span><span class="column-count">' + group.length + '</span></div><div class="column-body">' +
        (group.map(taskCard).join("") || '<div class="empty-column">Drop tasks here or add a new one.</div>') +
        '</div><button class="column-add" data-action="new-task" data-status="' + status.id + '">' + ico("plus") + ' Add task</button></section>';
    }).join("") + "</div>";
}
function taskList() {
  const tasks = filterTasks(state, filters);
  const sorted = [...tasks].sort((a, b) => (a.status === "done") - (b.status === "done") || (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  return pageHead("TASK MANAGEMENT", "Everything on your plate.", "Search, filter, and manage your work in one place.", newTaskButton) + filterBar() +
    '<section class="surface-card task-table-wrap">' +
    (sorted.length ? '<table class="task-table"><thead><tr><th>Task</th><th>Project</th><th>Status</th><th>Priority</th><th>Due date</th><th></th></tr></thead><tbody>' +
    sorted.map((t) => '<tr><td><button class="task-title-button" data-action="edit-task" data-id="' + esc(t.id) + '">' + esc(t.title) +
      '</button></td><td>' + esc(projectFor(t.projectId)?.name || "") + '</td><td><span class="status-pill ' + esc(t.status) + '">' +
      esc(STATUSES.find((s) => s.id === t.status)?.label || "") + '</span></td><td>' + priority(t.priority) + '</td><td>' + duePill(t) +
      '</td><td><button class="table-action" data-action="edit-task" data-id="' + esc(t.id) + '" aria-label="Edit task">' + ico("edit") +
      '</button></td></tr>').join("") + '</tbody></table>' :
    empty("No matching tasks", "Try removing a filter or adding a new task.")) + "</section>";
}
function projectTile(p) {
  const prog = projectProgress(state, p.id);
  return '<article class="project-tile"><div class="project-tile-top"><span class="project-large-icon ' + esc(p.color) + '">' + ico("folder") + "</span>" +
    '<div class="tile-actions"><button data-action="edit-project" data-id="' + esc(p.id) + '" aria-label="Edit ' + esc(p.name) + '">Edit</button>' +
    '<button data-action="archive-project" data-id="' + esc(p.id) + '">' + (p.archived ? "Restore" : "Archive") + "</button>" +
    '<button class="danger" data-action="delete-project" data-id="' + esc(p.id) + '" aria-label="Delete ' + esc(p.name) + '">Delete</button></div></div>' +
    '<h3>' + esc(p.name) + '</h3><p>' + esc(p.description || "No description yet.") + '</p><div class="tile-progress"><span>' +
    count(prog.done, "completed task") + '</span><strong>' + prog.rate + '%</strong></div>' + progressBar(prog.rate) +
    '<div class="project-tile-bottom"><span>' + count(prog.total, "task") + (p.archived ? " · Archived" : "") + '</span>' +
    (p.archived ? '<span>Archived</span>' : '<button class="link-button" data-action="focus-project" data-id="' + esc(p.id) + '">Open project →</button>') + '</div></article>';
}
function projectsView() {
  const search = filters.search.toLowerCase();
  const filtered = state.projects.filter((p) => !search || (p.name + " " + p.description).toLowerCase().includes(search));
  const current = filtered.filter((p) => !p.archived);
  const archived = filtered.filter((p) => p.archived);
  return pageHead("PROJECTS", "Ideas, organized.", "A clear home for every initiative, from first draft to final delivery.", newProjectButton) +
    (current.length ? '<section class="project-grid">' + current.map(projectTile).join("") + '</section>' :
    empty("No projects found", "Start something meaningful by creating a project.", "new-project", "Create project")) +
    (archived.length ? '<section style="margin-top:36px"><div class="section-head"><h2>Archived projects</h2><span class="date-pill">' + archived.length +
    ' archived</span></div><div class="project-grid">' + archived.map(projectTile).join("") + "</div></section>" : "");
}
function timelineView() {
  const tasks = filterTasks(state, filters).filter((t) => t.dueDate && t.status !== "done").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const groups = new Map();
  for (const task of tasks) {
    if (!groups.has(task.dueDate)) groups.set(task.dueDate, []);
    groups.get(task.dueDate).push(task);
  }
  const html = [...groups.entries()].map(([date, group]) => '<div class="timeline-group"><div class="timeline-day"><strong>' +
    (daysUntil(date) === 0 ? "Today" : daysUntil(date) === 1 ? "Tomorrow" : formatted(date)) + '</strong>' +
    (daysUntil(date) < 0 ? "Overdue" : formatted(date, { weekday: "long" })) + '</div><div class="timeline-tasks">' +
    group.map((t) => '<div class="timeline-task"><span class="project-icon ' + esc(projectFor(t.projectId)?.color || "violet") +
      '">' + ico("calendar") + '</span><div style="min-width:0;flex:1"><h3>' + esc(t.title) + '</h3><small>' +
      esc(projectFor(t.projectId)?.name || "") + '</small></div>' + priority(t.priority) +
      '<button data-action="edit-task" data-id="' + esc(t.id) + '" aria-label="Edit task">' + ico("arrow") +
      '</button></div>').join("") + "</div></div>").join("");
  return pageHead("DEADLINES", "What's coming up.", "A simple timeline to help you stay one step ahead.", newTaskButton) +
    '<div class="filters-bar"><div class="filters-left"><span class="date-pill">' + count(tasks.length, "upcoming deadline") +
    '</span></div></div>' + (html ? '<div class="timeline-list">' + html + '</div>' :
    '<div class="surface-card">' + empty("A clear calendar", "Open tasks with due dates will show here.", "new-task", "Add a task") + '</div>');
}
function settingsView() {
  return pageHead("PREFERENCES", "Make it yours.", "Manage your workspace, appearance, and personal backups.") +
    '<div class="notice"><strong>Your privacy matters.</strong> This edition saves projects and tasks only on this device and browser. It has no accounts, remote database, or live collaboration. Export a backup before clearing browser storage or switching devices.</div>' +
    '<div class="settings-grid"><section class="surface-card settings-card"><h2>Your data, your control.</h2><p>Download a JSON backup of your entire workspace, or restore a previously exported file. Imports replace all current data after confirmation.</p>' +
    '<button class="btn btn-primary" data-action="export">' + ico("download") + ' Export backup</button><button class="btn" data-action="import">' +
    ico("upload") + ' Import backup</button></section><section class="surface-card settings-card"><h2>A workspace that fits.</h2><p>Switch between a clean light theme and a softer dark appearance. Your preference stays saved in this browser.</p><button class="btn" data-action="theme">' +
    ico("sun") + ' Switch appearance</button></section><section class="surface-card settings-card"><h2>Start with a blank canvas.</h2><p>Remove all your projects, tasks and activity, and create one fresh project. This is permanent unless you exported a backup first.</p>' +
    '<button class="btn btn-danger" data-action="reset">' + ico("trash") + ' Reset workspace</button></section>' +
    '<section class="surface-card settings-card"><h2>About Paceboard.</h2><p>A focused, no-subscription planning tool for personal projects. Drag tasks across the board, manage deadlines, and keep control of your work without signing in.</p>' +
    '<span class="date-pill">Local-first · v2.0</span></section></div>';
}
function render() {
  const views = { overview, board, list: taskList, projects: projectsView, timeline: timelineView, settings: settingsView };
  $("#content").innerHTML = views[view]();
  $("#breadcrumbCurrent").textContent = { overview: "Overview", board: "Board", list: "All tasks", projects: "Projects", timeline: "Upcoming", settings: "Settings & data" }[view];
  document.querySelectorAll("[data-view].nav-item").forEach((el) => {
    const active = el.dataset.view === view;
    el.classList.toggle("active", active);
    if (active) el.setAttribute("aria-current", "page"); else el.removeAttribute("aria-current");
  });
  const searchInput = $("#globalSearch");
  if (searchInput.value !== filters.search) searchInput.value = filters.search;
}
function go(next) {
  view = next;
  location.hash = next;
  $("#shell").classList.remove("menu-open");
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}
const inputField = (name, label, value, options = {}) => '<div class="field"><label for="f-' + name + '">' + label + '</label>' +
  (options.type === "select" ? '<select id="f-' + name + '" name="' + name + '" required>' + options.items.map(({ id, label: optionLabel }) =>
    '<option value="' + esc(id) + '"' + (id === value ? " selected" : "") + '>' + esc(optionLabel) + "</option>").join("") + "</select>" :
  options.type === "textarea" ? '<textarea id="f-' + name + '" name="' + name + '" maxlength="' + (options.max || 1200) + '" placeholder="' + esc(options.placeholder || "") + '">' + esc(value) + "</textarea>" :
  '<input id="f-' + name + '" type="' + (options.type || "text") + '" name="' + name + '" value="' + esc(value) + '" maxlength="' + (options.max || 160) +
  '" placeholder="' + esc(options.placeholder || "") + '"' + (options.required ? " required" : "") + ">") + "</div>";
function openEditor(type, id = null, defaultStatus = "todo") {
  if (type === "task" && activeProjects().length === 0) { notify("Create a project before adding a task."); openEditor("project"); return; }
  const item = type === "task" ? state.tasks.find((t) => t.id === id) : state.projects.find((p) => p.id === id);
  if (id && !item) { notify("This item no longer exists."); return; }
  const dialog = $("#editorDialog");
  dialog.dataset.type = type;
  dialog.dataset.id = id || "";
  const isTask = type === "task";
  const isEdit = !!id;
  const fields = isTask ?
    inputField("title", "Task name *", item?.title || "", { placeholder: "What needs to get done?", required: true }) +
    '<div class="form-grid">' +
    inputField("projectId", "Project *", item?.projectId || (filters.project && activeProjects().some((p) => p.id === filters.project) ? filters.project : activeProjects()[0]?.id),
      { type: "select", items: activeProjects().map((p) => ({ id: p.id, label: p.name })) }) +
    inputField("status", "Status *", item?.status || defaultStatus, { type: "select", items: STATUSES }) + "</div>" +
    '<div class="form-grid">' +
    inputField("priority", "Priority *", item?.priority || "medium", { type: "select", items: PRIORITIES.map((p) => ({ id: p, label: titleCase(p) })) }) +
    inputField("dueDate", "Due date", item?.dueDate || "", { type: "date" }) + "</div>" +
    inputField("assignee", "Assignee (initials or name)", item?.assignee || "", { max: 24, placeholder: "e.g. AM" }) +
    inputField("description", "Notes", item?.description || "", { type: "textarea", placeholder: "Add useful context, links or next steps..." }) :
    inputField("name", "Project name *", item?.name || "", { max: 90, required: true, placeholder: "e.g. Website redesign" }) +
    inputField("description", "Description", item?.description || "", { type: "textarea", max: 600, placeholder: "What's the goal of this project?" }) +
    inputField("color", "Accent color", item?.color || "violet", { type: "select", items: [
      { id: "violet", label: "Violet" }, { id: "blue", label: "Blue" }, { id: "peach", label: "Peach" }, { id: "mint", label: "Mint" }
    ] });
  $("#dialogBody").innerHTML = '<div class="dialog-head"><div><h2 id="dialogTitle">' + (isEdit ? "Edit " : "Create ") +
    (isTask ? "task" : "project") + '</h2><p>' + (isTask ? "Keep the details clear and the progress visible." : "Give your work a home.") +
    '</p></div><button type="button" class="dialog-close" data-action="close-dialog" aria-label="Close dialog">' + ico("x") +
    '</button></div><div class="dialog-fields">' + fields + '</div><div class="dialog-actions">' +
    (isEdit && isTask ? '<button type="button" class="btn btn-danger btn-tiny" data-action="delete-task" data-id="' + esc(id) + '">' + ico("trash") +
    ' Delete</button>' : '<span class="dialog-hint">All changes save automatically.</span>') +
    '<div class="right-actions"><button type="button" class="btn" data-action="close-dialog">Cancel</button><button class="btn btn-primary" type="submit">' +
    (isEdit ? "Save changes" : "Create " + type) + '</button></div></div>';
  dialog.showModal();
  dialog.querySelector("input:not([type=hidden])")?.focus();
}
$("#editorForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const dialog = $("#editorDialog");
  const values = Object.fromEntries(new FormData(e.currentTarget).entries());
  const id = dialog.dataset.id || null;
  const type = dialog.dataset.type;
  try {
    const next = type === "task" ? upsertTask(state, values, id) : upsertProject(state, values, id);
    if (persist(next, id ? "Changes saved." : titleCase(type) + " created.")) dialog.close();
  } catch (error) { notify(error.message); }
});
document.addEventListener("click", (e) => {
  const nav = e.target.closest("[data-view]");
  if (nav) { go(nav.dataset.view); return; }
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (action === "new-task") openEditor("task", null, btn.dataset.status || "todo");
  if (action === "new-project") openEditor("project");
  if (action === "edit-task") openEditor("task", id);
  if (action === "edit-project") openEditor("project", id);
  if (action === "close-dialog") $("#editorDialog").close();
  if (action === "advance-task") {
    const item = state.tasks.find((t) => t.id === id);
    const index = STATUSES.findIndex((s) => s.id === item?.status);
    if (index >= 0 && index < STATUSES.length - 1) change((s) => moveTask(s, id, STATUSES[index + 1].id), "Task moved forward.");
  }
  if (action === "toggle-task") {
    const item = state.tasks.find((t) => t.id === id);
    if (item) change((s) => moveTask(s, id, item.status === "done" ? "todo" : "done"), item.status === "done" ? "Task reopened." : "Task completed.");
  }
  if (action === "archive-project") change((s) => archiveProject(s, id), "Project updated.");
  if (action === "delete-project") {
    const project = projectFor(id);
    const countTasks = state.tasks.filter((t) => t.projectId === id).length;
    if (project && confirm('Delete “' + project.name + '” and its ' + count(countTasks, "task") + '? This cannot be undone.')) {
      change((s) => deleteProject(s, id), "Project deleted.");
      if (filters.project === id) filters.project = "";
    }
  }
  if (action === "delete-task") {
    const item = state.tasks.find((t) => t.id === id);
    if (item && confirm('Delete task “' + item.title + '”? This cannot be undone.')) {
      $("#editorDialog").close();
      change((s) => deleteTask(s, id), "Task deleted.");
    }
  }
  if (action === "focus-project") { filters.project = id; go("board"); }
  if (action === "theme") {
    document.body.classList.toggle("dark");
    try { localStorage.setItem(THEME_KEY, document.body.classList.contains("dark") ? "dark" : "light"); } catch {}
  }
  if (action === "export") {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href; anchor.download = "paceboard-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(href), 2000);
    notify("Workspace backup downloaded.");
  }
  if (action === "import") $("#importFile").click();
  if (action === "reset" && confirm("Delete every project, task and activity item? Export a backup first if you need one. This cannot be undone.")) {
    filters = { project: "", priority: "", search: "" };
    persist(newWorkspace(), "You have a clean workspace.");
    go("overview");
  }
});
$("#importFile").addEventListener("change", async (e) => {
  const file = e.currentTarget.files?.[0];
  e.currentTarget.value = "";
  if (!file) return;
  if (file.size > 5000000) { notify("Backup is too large (5 MB maximum)."); return; }
  try {
    const imported = validateWorkspace(JSON.parse(await file.text()));
    if (confirm("Replace your current workspace with " + count(imported.projects.length, "project") + " and " + count(imported.tasks.length, "task") + "? Export a backup first if needed.")) {
      filters = { project: "", priority: "", search: "" };
      if (persist(imported, "Workspace restored successfully.")) go("overview");
    }
  } catch (error) { notify("Import failed: " + (error.message || "Invalid backup.")); }
});
$("#globalSearch").addEventListener("input", (e) => {
  filters.search = e.currentTarget.value;
  if (view === "overview" || view === "settings" || view === "timeline") view = "list";
  render();
});
document.addEventListener("change", (e) => {
  if (e.target.id === "filterProject") { filters.project = e.target.value; render(); }
  if (e.target.id === "filterPriority") { filters.priority = e.target.value; render(); }
});
document.addEventListener("dragstart", (e) => {
  const card = e.target.closest(".task-card");
  if (!card) return;
  dragId = card.dataset.taskId;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", dragId);
  card.classList.add("dragging");
});
document.addEventListener("dragend", () => {
  dragId = null;
  document.querySelectorAll(".drop-target,.dragging").forEach((el) => el.classList.remove("drop-target", "dragging"));
});
document.addEventListener("dragover", (e) => {
  const column = e.target.closest(".board-column");
  if (!column || !dragId) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  document.querySelectorAll(".drop-target").forEach((el) => el.classList.remove("drop-target"));
  column.classList.add("drop-target");
});
document.addEventListener("drop", (e) => {
  const column = e.target.closest(".board-column");
  if (!column || !dragId) return;
  e.preventDefault();
  const id = dragId;
  dragId = null;
  change((s) => moveTask(s, id, column.dataset.status), "Task moved.");
});
$("#menuToggle").addEventListener("click", () => $("#shell").classList.toggle("menu-open"));
$("#mobileScrim").addEventListener("click", () => $("#shell").classList.remove("menu-open"));
window.addEventListener("hashchange", () => {
  const next = location.hash.slice(1);
  if (["overview", "board", "list", "projects", "timeline", "settings"].includes(next) && next !== view) { view = next; render(); }
});
document.addEventListener("keydown", (e) => {
  const target = e.target;
  const editing = target instanceof HTMLElement && (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable);
  if (e.key === "Escape") $("#shell").classList.remove("menu-open");
  if (!editing && !$("#editorDialog").open && e.key === "/") { e.preventDefault(); $("#globalSearch").focus(); }
  if (!editing && !$("#editorDialog").open && e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) openEditor("task");
});
render();
if (recovered) notify("A saved workspace couldn't be read; showing sample data. No stored data was overwritten.");
