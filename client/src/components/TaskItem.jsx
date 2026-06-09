import { useState } from "react";
import TaskForm from "./TaskForm";

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overdue = isOverdue(task);

  const handleEdit = async (body) => {
    await onEdit(task.id, body);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await onDelete(task.id);
  };

  if (editing) {
    return (
      <li className="task-item task-item--editing">
        <TaskForm
          initial={task}
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className={`task-item${task.completed ? " task-item--done" : ""}${overdue ? " task-item--overdue" : ""}`}>
      <button
        className={`task-check ${task.completed ? "task-check--checked" : ""}`}
        onClick={() => onToggle(task.id, !task.completed)}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed && (
          <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <div className="task-body">
        <p className="task-title">{task.title}</p>
        {task.description && (
          <p className="task-desc">{task.description}</p>
        )}
        <div className="task-meta">
          {task.dueDate && (
            <span className={`task-due ${overdue ? "task-due--overdue" : ""}`}>
              {overdue ? "⚠ Overdue · " : "Due "}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button
          className="btn-icon"
          onClick={() => { setEditing(true); setConfirmDelete(false); }}
          aria-label="Edit task"
          title="Edit"
        >
          <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 1.5L14.5 4.5L5.5 13.5H2.5V10.5L11.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {confirmDelete ? (
          <div className="confirm-delete">
            <span>Delete?</span>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Yes</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>No</button>
          </div>
        ) : (
          <button
            className="btn-icon btn-icon--danger"
            onClick={handleDelete}
            aria-label="Delete task"
            title="Delete"
          >
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4H14M5 4V2H11V4M6 7V12M10 7V12M3 4L4 14H12L13 4H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </li>
  );
}
