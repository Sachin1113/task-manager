import { useState, useRef } from "react";
import { useTasks } from "./hooks/useTasks";
import TaskItem from "./components/TaskItem";
import TaskForm from "./components/TaskForm";
import "./App.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

export default function App() {
  const {
    tasks, meta, loading, error,
    filter, setFilter,
    search, setSearch,
    addTask, editTask, toggleTask, removeTask,
  } = useTasks();

  const [addError, setAddError] = useState(null);
  const searchRef = useRef(null);

  const handleAdd = async (body) => {
    setAddError(null);
    try {
      await addTask(body);
    } catch (err) {
      setAddError(err.message);
      throw err;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <span className="header-icon">✦</span>
            <h1 className="header-title">Tasks</h1>
          </div>
          <div className="header-stats">
            <span className="stat">
              <strong>{meta.active}</strong> active
            </span>
            <span className="stat-divider">·</span>
            <span className="stat">
              <strong>{meta.completed}</strong> done
            </span>
          </div>
        </div>
      </header>

      <main className="main">
        {/* Add Task */}
        <section className="card card--add">
          <h2 className="card-heading">New Task</h2>
          {addError && <p className="form-error">{addError}</p>}
          <TaskForm onSubmit={handleAdd} />
        </section>

        {/* Controls */}
        <div className="controls">
          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`filter-tab ${filter === f.key ? "filter-tab--active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                {f.key === "active" && meta.active > 0 && (
                  <span className="badge">{meta.active}</span>
                )}
              </button>
            ))}
          </div>
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              ref={searchRef}
              className="search-input"
              type="text"
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="search-clear"
                onClick={() => { setSearch(""); searchRef.current?.focus(); }}
                aria-label="Clear search"
              >×</button>
            )}
          </div>
        </div>

        {/* Task List */}
        <section className="task-list-wrap">
          {loading && (
            <div className="state-box">
              <div className="spinner" aria-label="Loading" />
              <p>Loading tasks…</p>
            </div>
          )}

          {!loading && error && (
            <div className="state-box state-box--error">
              <p>⚠ {error}</p>
              <button className="btn btn-ghost" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && tasks.length === 0 && (
            <div className="state-box state-box--empty">
              {search ? (
                <>
                  <span className="empty-icon">🔍</span>
                  <p>No tasks match "<strong>{search}</strong>"</p>
                </>
              ) : filter === "completed" ? (
                <>
                  <span className="empty-icon">🎉</span>
                  <p>Nothing completed yet — keep going!</p>
                </>
              ) : filter === "active" ? (
                <>
                  <span className="empty-icon">✅</span>
                  <p>All done! No active tasks.</p>
                </>
              ) : (
                <>
                  <span className="empty-icon">📋</span>
                  <p>No tasks yet. Add one above to get started.</p>
                </>
              )}
            </div>
          )}

          {!loading && !error && tasks.length > 0 && (
            <ul className="task-list">
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onEdit={editTask}
                  onDelete={removeTask}
                />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
