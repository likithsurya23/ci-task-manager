const express = require("express");
const taskRoutes = require("./routes/taskRoutes");
const { cache } = require("./utils/cache");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", application: "ci-task-manager" });
});

app.use("/api/tasks", taskRoutes);

app.get("/api/cache/stats", (_req, res) => {
  const stats = cache.getStats();
  res.json({
    keyCount: cache.keys().length,
    keys: cache.keys(),
    hits: stats.hits,
    misses: stats.misses
  });
});

app.delete("/api/cache", (_req, res) => {
  cache.flushAll();
  res.json({ message: "Cache cleared" });
});

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));
app.use(errorHandler);

module.exports = app;
