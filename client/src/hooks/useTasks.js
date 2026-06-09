import { useState, useEffect, useCallback } from "react";
import * as api from "../api/tasks";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, active: 0, completed: 0 });
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks({
        status: filter === "all" ? "" : filter,
        search,
      });
      setTasks(data.tasks);
      setMeta(data.meta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (body) => {
    const task = await api.createTask(body);
    await fetchTasks();
    return task;
  };

  const editTask = async (id, body) => {
    await api.updateTask(id, body);
    await fetchTasks();
  };

  const toggleTask = async (id, completed) => {
    await api.updateTask(id, { completed });
    await fetchTasks();
  };

  const removeTask = async (id) => {
    await api.deleteTask(id);
    await fetchTasks();
  };

  return {
    tasks,
    meta,
    loading,
    error,
    filter,
    setFilter,
    search,
    setSearch,
    addTask,
    editTask,
    toggleTask,
    removeTask,
    refetch: fetchTasks,
  };
}
