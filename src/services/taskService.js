let nextId = 4;
let tasks = [
  { id: "1", title: "Learn Express", description: "Build REST APIs", status: "pending" },
  { id: "2", title: "Add caching", description: "Cache frequent GET responses", status: "in_progress" },
  { id: "3", title: "Configure CI", description: "Run tests on GitHub Actions", status: "completed" }
];

function listTasks(status) {
  return status ? tasks.filter((task) => task.status === status) : [...tasks];
}

function getTask(id) {
  return tasks.find((task) => task.id === id);
}

function createTask(input) {
  const task = {
    id: String(nextId++),
    title: input.title.trim(),
    description: input.description ? input.description.trim() : "",
    status: input.status || "pending"
  };
  tasks.push(task);
  return task;
}

function updateTask(id, input) {
  const task = getTask(id);
  if (!task) return undefined;
  if (input.title !== undefined) task.title = input.title.trim();
  if (input.description !== undefined) task.description = input.description.trim();
  if (input.status !== undefined) task.status = input.status;
  return task;
}

function deleteTask(id) {
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return false;
  tasks = tasks.filter((task) => task.id !== id);
  return true;
}

function resetTasks() {
  nextId = 4;
  tasks = [
    { id: "1", title: "Learn Express", description: "Build REST APIs", status: "pending" },
    { id: "2", title: "Add caching", description: "Cache frequent GET responses", status: "in_progress" },
    { id: "3", title: "Configure CI", description: "Run tests on GitHub Actions", status: "completed" }
  ];
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask, resetTasks };
