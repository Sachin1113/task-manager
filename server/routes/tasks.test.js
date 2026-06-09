const request = require("supertest");
const app = require("../index");

// Use a fresh in-memory state by monkey-patching the store before tests run
jest.mock("../store/tasks", () => {
  let tasks = [];
  const getAll = () =>
    [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const getById = (id) => tasks.find((t) => t.id === id) || null;
  const create = (task) => { tasks.push(task); return task; };
  const update = (id, updates) => {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...updates };
    return tasks[idx];
  };
  const remove = (id) => {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    tasks.splice(idx, 1);
    return true;
  };
  const _reset = () => { tasks = []; };
  return { getAll, getById, create, update, remove, _reset };
});

const store = require("../store/tasks");

beforeEach(() => store._reset());

describe("GET /api/health", () => {
  it("returns 200 ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("POST /api/tasks", () => {
  it("creates a task with a title", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "Buy groceries", description: "Milk and eggs" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Buy groceries");
    expect(res.body.completed).toBe(false);
    expect(res.body.id).toBeDefined();
  });

  it("rejects a task without a title", async () => {
    const res = await request(app).post("/api/tasks").send({ description: "No title" });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain("title is required");
  });
});

describe("GET /api/tasks", () => {
  it("returns empty list initially", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
  });

  it("filters by status=active", async () => {
    await request(app).post("/api/tasks").send({ title: "Active task" });
    const create2 = await request(app).post("/api/tasks").send({ title: "Done task" });
    await request(app).patch(`/api/tasks/${create2.body.id}`).send({ completed: true });

    const res = await request(app).get("/api/tasks?status=active");
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe("Active task");
  });

  it("searches by title", async () => {
    await request(app).post("/api/tasks").send({ title: "Buy groceries" });
    await request(app).post("/api/tasks").send({ title: "Call doctor" });

    const res = await request(app).get("/api/tasks?search=grocer");
    expect(res.body.tasks).toHaveLength(1);
    expect(res.body.tasks[0].title).toBe("Buy groceries");
  });
});

describe("PATCH /api/tasks/:id", () => {
  it("toggles completed", async () => {
    const create = await request(app).post("/api/tasks").send({ title: "Test" });
    const id = create.body.id;

    const res = await request(app).patch(`/api/tasks/${id}`).send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).patch("/api/tasks/nonexistent").send({ completed: true });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("deletes a task", async () => {
    const create = await request(app).post("/api/tasks").send({ title: "Delete me" });
    const id = create.body.id;

    const del = await request(app).delete(`/api/tasks/${id}`);
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/tasks/${id}`);
    expect(get.status).toBe(404);
  });
});
