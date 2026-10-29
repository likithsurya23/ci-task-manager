const service = require("../services/taskService");
const { cache, invalidateTaskCaches } = require("../utils/cache");

const validStatuses = ["pending", "in_progress", "completed"];

function listTasks(req, res) {
  const status = req.query.status;
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status filter" });
  }

  const key = `tasks:list:${status || "all"}`;
  const cached = cache.get(key);
  if (cached) return res.json({ source: "cache", data: cached });

  const data = service.listTasks(status);
  cache.set(key, data);
  return res.json({ source: "fresh", data });
}

function getTask(req, res) {
  const key = `tasks:item:${req.params.id}`;
  const cached = cache.get(key);
  if (cached) return res.json({ source: "cache", data: cached });

  const task = service.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  cache.set(key, task);
  return res.json({ source: "fresh", data: task });
}

function createTask(req, res) {
  const { title, description, status } = req.body || {};
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "A non-empty title is required" });
  }
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid task status" });
  }

  const task = service.createTask({ title, description: description || "", status });
  invalidateTaskCaches();
  return res.status(201).json({ data: task });
}

function updateTask(req, res) {
  const { title, description, status } = req.body || {};
  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    return res.status(400).json({ error: "Title must be a non-empty string" });
  }
  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid task status" });
  }
  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({ error: "Description must be a string" });
  }

  const task = service.updateTask(req.params.id, req.body || {});
  if (!task) return res.status(404).json({ error: "Task not found" });
  invalidateTaskCaches();
  return res.json({ data: task });
}

function deleteTask(req, res) {
  if (!service.deleteTask(req.params.id)) {
    return res.status(404).json({ error: "Task not found" });
  }
  invalidateTaskCaches();
  return res.json({ message: "Task deleted" });
}

function cacheStats(_req, res) {
  const stats = cache.getStats();
  return res.json({
    keyCount: cache.keys().length,
    keys: cache.keys(),
    hits: stats.hits,
    misses: stats.misses
  });
}

function clearCache(_req, res) {
  cache.flushAll();
  return res.json({ message: "Cache cleared" });
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask, cacheStats, clearCache };
