import { useCallback, useEffect, useState } from 'react';
import { taskApi } from '../services/api.js';

export default function useTasks(filters) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await taskApi.list(filters);
      setTasks(result);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTask = useCallback(async (task) => {
    const created = await taskApi.create(task);
    await refresh();
    return created;
  }, [refresh]);

  const updateTask = useCallback(async (id, task) => {
    const updated = await taskApi.update(id, task);
    await refresh();
    return updated;
  }, [refresh]);

  const updateStatus = useCallback(async (id, status) => {
    const updated = await taskApi.updateStatus(id, status);
    await refresh();
    return updated;
  }, [refresh]);

  const archiveTask = useCallback(async (id) => {
    await taskApi.archive(id);
    await refresh();
  }, [refresh]);

  return { tasks, loading, error, refresh, createTask, updateTask, updateStatus, archiveTask };
}
