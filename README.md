# Personal Task Manager

A full-stack personal task manager built with **Node.js + Express** on the backend and **React** on the frontend. Users can create, view, edit, complete, and delete tasks, with filtering by status, live search, overdue highlighting, and persistence to a JSON file so tasks survive server restarts.

---

## Live Demo



---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend runtime | Node.js + Express | Industry standard, minimal boilerplate |
| Unique IDs | `uuid` v9 | Collision-free task IDs without a DB |
| Persistence | JSON file (fs) | Survives restarts; zero setup for reviewers |
| Frontend | React 18 (CRA) | Hooks, functional components as required |
| Fonts | Google Fonts (Playfair Display + DM Sans) | Editorial feel; loads via CSS import |
| Tests | Jest + Supertest | Backend route integration tests |

---

## How to Run Locally

You need **Node.js ≥ 18** installed. No other global tools required.

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager

# 2. Install dependencies for both server and client
npm run install:all

# 3a. Start the API server (port 4000)
npm run dev:server

# 3b. In a second terminal, start the React dev server (port 3000)
npm run dev:client
```

Open **http://localhost:3000** in your browser. The React app proxies `/api` calls to `http://localhost:4000` via the `proxy` field in `client/package.json`.

### Run tests

```bash
npm test
```

---

## API Documentation

Base URL: `http://localhost:4000/api`

### `GET /tasks`

Returns all tasks (newest first), with optional filtering.

**Query params:**
| Param | Values | Description |
|---|---|---|
| `status` | `active` \| `completed` | Filter by status |
| `search` | any string | Case-insensitive search on title + description |

**Response `200`:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Buy groceries",
      "description": "Milk and eggs",
      "dueDate": "2025-07-01T00:00:00.000Z",
      "completed": false,
      "createdAt": "2025-06-20T10:00:00.000Z",
      "updatedAt": "2025-06-20T10:00:00.000Z"
    }
  ],
  "meta": { "total": 5, "active": 3, "completed": 2 }
}
```

---

### `GET /tasks/:id`

Returns a single task or `404`.

---

### `POST /tasks`

Create a new task.

**Body:**
```json
{ "title": "string (required)", "description": "string", "dueDate": "ISO date string" }
```

**Response `201`:** the created task object.
**Response `400`:** `{ "errors": ["title is required"] }`

---

### `PATCH /tasks/:id`

Partially update a task. Any subset of `title`, `description`, `dueDate`, `completed`.

**Body:**
```json
{ "completed": true }
```

**Response `200`:** the updated task object.
**Response `404`:** `{ "error": "Task not found" }`

---

### `DELETE /tasks/:id`

Delete a task. Returns `204 No Content` on success.

---

### `GET /health`

Health check. Returns `{ "status": "ok", "timestamp": "..." }`.

---

## Project Structure

```
task-manager/
├── package.json          # Root scripts (install:all, dev:server, dev:client, test)
├── .gitignore
├── README.md
│
├── server/
│   ├── index.js          # Express app setup, middleware, global error handler
│   ├── package.json
│   ├── routes/
│   │   ├── tasks.js      # CRUD routes + input validation
│   │   └── tasks.test.js # Jest + Supertest integration tests
│   ├── store/
│   │   └── tasks.js      # In-memory array + JSON file persistence
│   └── data/             # Auto-created; stores tasks.json (gitignored)
│
└── client/
    ├── package.json       # proxy → localhost:4000
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js       # React entry point
        ├── App.jsx        # Root component: layout, controls, task list
        ├── App.css        # All styles (CSS variables, responsive)
        ├── api/
        │   └── tasks.js   # fetch wrapper for all API calls
        ├── hooks/
        │   └── useTasks.js # State management: tasks, filter, search, CRUD
        └── components/
            ├── TaskForm.jsx  # Add / edit form with validation
            └── TaskItem.jsx  # Individual task row with inline edit + confirm-delete
```

---

## Features Implemented

**Must Have (all done):**
- ✅ Add task with title (required), optional description and due date
- ✅ View all tasks sorted by creation date (newest first)
- ✅ Toggle complete / incomplete
- ✅ Edit title, description, due date (inline)
- ✅ Delete with confirmation prompt
- ✅ Filter by All / Active / Completed

**Should Have (all done):**
- ✅ Active vs completed count in header
- ✅ Overdue tasks highlighted (red background + warning label)
- ✅ Empty state UI with context-aware messages

**Bonus (done):**
- ✅ Search tasks by title and description
- ✅ Persist tasks across server restarts (JSON file)

---

## Next Steps

Given more time I would:
1. **Drag-and-drop reorder** — `@dnd-kit/core` for accessible DnD; store `order` field per task.
2. **Optimistic updates** — update React state immediately and roll back on API error, removing the round-trip flicker.
3. **SQLite** — swap the JSON file store for `better-sqlite3`; trivially more robust for concurrent writes.
4. **Authentication** — a simple session or JWT flow so multiple users can have separate lists.
5. **More tests** — unit tests for the store, and React Testing Library tests for `TaskItem` and `TaskForm`.
6. **Animations** — task entry/exit animations with `framer-motion` for a more polished feel.

---

## Honesty Note

AI tools (Claude) were used for boilerplate acceleration. Every line was reviewed, understood, and adjusted. The architecture decisions, component split, and API design are my own.
