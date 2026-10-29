const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");
const { cache } = require("../src/utils/cache");
const service = require("../src/services/taskService");

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.beforeEach(() => {
  cache.flushAll();
  service.resetTasks();
});

test.after(async () => {
  await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
});

test("health endpoint returns ok", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
});

test("lists tasks and filters by status", async () => {
  const all = await fetch(`${baseUrl}/api/tasks`).then((r) => r.json());
  assert.equal(all.data.length, 3);
  const filtered = await fetch(`${baseUrl}/api/tasks?status=pending`).then((r) => r.json());
  assert.equal(filtered.data.length, 1);
  assert.equal(filtered.data[0].status, "pending");
});

test("returns a task or 404", async () => {
  assert.equal((await fetch(`${baseUrl}/api/tasks/1`)).status, 200);
  assert.equal((await fetch(`${baseUrl}/api/tasks/999`)).status, 404);
});

test("creates tasks and validates title", async () => {
  const invalid = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: " " })
  });
  assert.equal(invalid.status, 400);
  const response = await fetch(`${baseUrl}/api/tasks`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Write tests" })
  });
  assert.equal(response.status, 201);
});

test("updates and deletes tasks", async () => {
  const updated = await fetch(`${baseUrl}/api/tasks/1`, {
    method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "Updated task" })
  });
  assert.equal(updated.status, 200);
  const deleted = await fetch(`${baseUrl}/api/tasks/1`, { method: "DELETE" });
  assert.equal(deleted.status, 200);
  assert.equal((await fetch(`${baseUrl}/api/tasks/1`)).status, 404);
});

test("returns cache on repeated GET and invalidates after mutation", async () => {
  const first = await fetch(`${baseUrl}/api/tasks`).then((r) => r.json());
  const second = await fetch(`${baseUrl}/api/tasks`).then((r) => r.json());
  assert.equal(first.source, "fresh");
  assert.equal(second.source, "cache");

  await fetch(`${baseUrl}/api/tasks`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ title: "New task" })
  });
  const afterCreate = await fetch(`${baseUrl}/api/tasks`).then((r) => r.json());
  assert.equal(afterCreate.source, "fresh");
  assert.equal(afterCreate.data.length, 4);
});

test("cache stats and clear endpoint work", async () => {
  await fetch(`${baseUrl}/api/tasks`);
  const stats = await fetch(`${baseUrl}/api/cache/stats`).then((r) => r.json());
  assert.ok(stats.keyCount >= 1);
  const clear = await fetch(`${baseUrl}/api/cache`, { method: "DELETE" });
  assert.equal(clear.status, 200);
  const empty = await fetch(`${baseUrl}/api/cache/stats`).then((r) => r.json());
  assert.equal(empty.keyCount, 0);
});
