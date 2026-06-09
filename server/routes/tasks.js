const express = require("express");
const { v4: uuidv4 } = require("uuid");
const store = require("../store/tasks");

const router = express.Router();

// Validation helper
function validateTask(body, requireTitle = true) {
  const errors = [];
  if (requireTitle && (!body.title || !body.title.trim())) {
    errors.push("title is required");
  }
  if (body.title && body.title.trim().length > 200) {
    errors.push("title must be 200 characters or fewer");
  }
  if (body.dueDate) {
    const d = new Date(body.dueDate);
    if (isNaN(d.getTime())) errors.push("dueDate must be a valid ISO date");
  }
  return errors;
}

// GET /api/tasks — list all tasks (optional ?status=active|completed&search=)
router.get("/", (req, res) => {
  let tasks = store.getAll();

  const { status, search } = req.query;

  if (status === "active") {
    tasks = tasks.filter((t) => !t.completed);
  } else if (status === "completed") {
    tasks = tasks.filter((t) => t.completed);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }

  const total = store.getAll().length;
  const active = store.getAll().filter((t) => !t.completed).length;
  const completed = total - active;

  res.json({ tasks, meta: { total, active, completed } });
});

// GET /api/tasks/:id — get a single task
router.get("/:id", (req, res) => {
  const task = store.getById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

// POST /api/tasks — create a task
router.post("/", (req, res) => {
  const errors = validateTask(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const task = {
    id: uuidv4(),
    title: req.body.title.trim(),
    description: req.body.description ? req.body.description.trim() : "",
    dueDate: req.body.dueDate || null,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const created = store.create(task);
  res.status(201).json(created);
});

// PATCH /api/tasks/:id — update a task (partial)
router.patch("/:id", (req, res) => {
  const task = store.getById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const errors = validateTask(req.body, false);
  if (errors.length) return res.status(400).json({ errors });

  const allowed = ["title", "description", "dueDate", "completed"];
  const updates = {};
  for (const key of allowed) {
    if (key in req.body) {
      updates[key] =
        typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
    }
  }
  updates.updatedAt = new Date().toISOString();

  const updated = store.update(req.params.id, updates);
  res.json(updated);
});

// DELETE /api/tasks/:id — delete a task
router.delete("/:id", (req, res) => {
  const task = store.getById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  store.remove(req.params.id);
  res.status(204).send();
});

module.exports = router;
