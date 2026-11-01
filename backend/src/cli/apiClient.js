function createApiClient(baseUrl = process.env.TASK_API_URL ?? 'http://localhost:4000/api') {
  const base = baseUrl.replace(/\/+$/, '');

  async function request(path, options = {}) {
    let response;
    try {
      response = await fetch(`${base}${path}`, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.body ? { 'Content-Type': 'application/json' } : {}),
          ...options.headers,
        },
      });
    } catch {
      throw new Error('Unable to reach the task API. Check that the backend is running.');
    }

    if (!response.ok) {
      let message = `Task API request failed (${response.status})`;
      try {
        const body = await response.json();
        message = body.error?.message ?? message;
      } catch {
        // Keep the status-based message for non-JSON responses.
      }
      throw new Error(message);
    }

    if (response.status === 204) return null;
    return response.json();
  }

  return {
    list(filters = {}) {
      const params = new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value),
      );
      const query = params.toString();
      return request(`/tasks${query ? `?${query}` : ''}`);
    },
    create(task) {
      return request('/tasks', { method: 'POST', body: JSON.stringify(task) });
    },
    get(id) {
      return request(`/tasks/${encodeURIComponent(id)}`);
    },
    async update(id, changes) {
      const current = await request(`/tasks/${encodeURIComponent(id)}`);
      const replacement = {
        title: current.title,
        description: current.description,
        status: current.status,
        priority: current.priority,
        dueDate: current.dueDate,
        ...changes,
      };
      return request(`/tasks/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(replacement),
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
}

module.exports = { createApiClient };
