const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error('Unable to reach the task service. Check that the backend is running.');
  }

  if (!response.ok) {
    let message = `Task request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.error?.message ?? message;
    } catch {
      // Keep the status-based message when the server does not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function queryString(filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters ?? {})) {
    if (value) params.set(key, value);
  }
  const result = params.toString();
  return result ? `?${result}` : '';
}

export const taskApi = {
  list(filters) {
    return request(`/tasks${queryString(filters)}`);
  },
  create(task) {
    return request('/tasks', { method: 'POST', body: JSON.stringify(task) });
  },
  update(id, task) {
    return request(`/tasks/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },
  updateStatus(id, status) {
    return request(`/tasks/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  archive(id) {
    return request(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};

export { API_BASE_URL };
