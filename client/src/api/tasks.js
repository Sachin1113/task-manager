const BASE = process.env.REACT_APP_API_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    const message =
      data.errors?.join(", ") || data.error || "Something went wrong";
    throw new Error(message);
  }

  return data;
}

export const getTasks = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  return request(`/tasks${qs ? `?${qs}` : ""}`);
};

export const createTask = (body) =>
  request("/tasks", { method: "POST", body: JSON.stringify(body) });

export const updateTask = (id, body) =>
  request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) });

export const deleteTask = (id) =>
  request(`/tasks/${id}`, { method: "DELETE" });
