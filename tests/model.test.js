import test from "node:test";
import assert from "node:assert/strict";
import {
  demoWorkspace, newWorkspace, validateWorkspace, upsertProject, archiveProject,
  deleteProject, upsertTask, moveTask, deleteTask, getMetrics, filterTasks, projectProgress
} from "../src/model.js";

const task = (projectId, overrides = {}) => ({
  title: "Prepare kickoff notes", projectId, status: "todo", priority: "high",
  dueDate: "", description: "Review agenda", assignee: "JK", ...overrides
});
test("demo data is a valid workspace with useful task distribution", () => {
  const demo = validateWorkspace(demoWorkspace());
  assert.equal(demo.projects.length, 3);
  assert.ok(demo.tasks.length >= 10);
  assert.ok(demo.tasks.some((t) => t.status === "done"));
  assert.ok(demo.tasks.some((t) => t.status === "progress"));
});
test("project and task lifecycle works", () => {
  let s = newWorkspace();
  const originalCount = s.projects.length;
  s = upsertProject(s, { name: "Launch", description: "Product launch", color: "blue" });
  assert.equal(s.projects.length, originalCount + 1);
  const project = s.projects.at(-1);
  s = upsertProject(s, { name: "Launch v2", description: "Better", color: "mint" }, project.id);
  assert.equal(s.projects.at(-1).name, "Launch v2");
  s = upsertTask(s, task(project.id));
  const id = s.tasks[0].id;
  assert.equal(s.tasks[0].title, "Prepare kickoff notes");
  s = upsertTask(s, task(project.id, { title: "Final notes", status: "progress" }), id);
  assert.equal(s.tasks[0].title, "Final notes");
  s = moveTask(s, id, "done");
  assert.equal(s.tasks[0].status, "done");
  assert.equal(projectProgress(s, project.id).rate, 100);
  s = deleteTask(s, id);
  assert.equal(s.tasks.length, 0);
});
test("moving task to the same status does not double-log activity", () => {
  let s = newWorkspace();
  s = upsertTask(s, task(s.projects[0].id));
  const count = s.activity.length;
  s = moveTask(s, s.tasks[0].id, "todo");
  assert.equal(s.activity.length, count);
});
test("archive hides tasks; delete cascades", () => {
  let s = newWorkspace();
  const id = s.projects[0].id;
  s = upsertTask(s, task(id));
  s = archiveProject(s, id);
  assert.equal(getMetrics(s).total, 0);
  assert.throws(() => upsertTask(s, task(id)), /active project/);
  s = archiveProject(s, id);
  assert.equal(getMetrics(s).total, 1);
  s = deleteProject(s, id);
  assert.equal(s.projects.length, 0);
  assert.equal(s.tasks.length, 0);
});
test("search and filters include task details and project name", () => {
  let s = newWorkspace();
  const id = s.projects[0].id;
  s = upsertTask(s, task(id));
  s = upsertTask(s, task(id, { title: "Illustrate landing page", priority: "low" }));
  assert.equal(filterTasks(s, { search: "kickoff" }).length, 1);
  assert.equal(filterTasks(s, { search: "My first project" }).length, 2);
  assert.equal(filterTasks(s, { priority: "low" }).length, 1);
  assert.equal(filterTasks(s, { status: "done" }).length, 0);
});
test("invalid backups are rejected before replacing data", () => {
  assert.throws(() => validateWorkspace({}), /supported/);
  const good = demoWorkspace();
  const duplicate = structuredClone(good);
  duplicate.projects.push({ ...duplicate.projects[0] });
  assert.throws(() => validateWorkspace(duplicate), /duplicate/);
  const missingProject = structuredClone(good);
  missingProject.tasks[0].projectId = "missing";
  assert.throws(() => validateWorkspace(missingProject), /invalid tasks/);
  const invalidStatus = structuredClone(good);
  invalidStatus.tasks[0].status = "exploded";
  assert.throws(() => validateWorkspace(invalidStatus), /invalid tasks/);
});
test("unsafe fields are trimmed and excess text is bounded", () => {
  const source = demoWorkspace();
  source.tasks[0].title = "x".repeat(1000);
  const clean = validateWorkspace(source);
  assert.equal(clean.tasks[0].title.length, 160);
  assert.equal(clean.version, 1);
});
test("task validation protects project, status, and priority references", () => {
  const s = newWorkspace();
  assert.throws(() => upsertTask(s, task("bad")), /active project/);
  assert.throws(() => upsertTask(s, task(s.projects[0].id, { status: "invalid" })), /Invalid status/);
  assert.throws(() => upsertTask(s, task(s.projects[0].id, { priority: "invalid" })), /Invalid priority/);
  assert.throws(() => moveTask(s, "missing", "invalid"), /Invalid status/);
});
