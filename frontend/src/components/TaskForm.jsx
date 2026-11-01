import { useEffect, useState } from 'react';

const EMPTY_TASK = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  dueDate: '',
};

export default function TaskForm({ onCreate, onSave, initialTask, onCancel }) {
  const [values, setValues] = useState(EMPTY_TASK);
  const [error, setError] = useState('');
  const editing = Boolean(initialTask);

  useEffect(() => {
    if (initialTask) {
      setValues({
        title: initialTask.title,
        description: initialTask.description ?? '',
        priority: initialTask.priority,
        status: initialTask.status,
        dueDate: initialTask.dueDate ?? '',
      });
    }
  }, [initialTask]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    const payload = {
      title: values.title.trim(),
      description: values.description,
      priority: values.priority,
      status: values.status,
    };
    if (editing) payload.dueDate = values.dueDate || null;
    else if (values.dueDate) payload.dueDate = values.dueDate;

    try {
      if (editing) await onSave(initialTask.id, payload);
      else await onCreate(payload);
      if (!editing) setValues(EMPTY_TASK);
      if (editing) onCancel?.();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  return (
    <form className={`task-form ${editing ? 'task-form-editing' : ''}`} onSubmit={submit}>
      <label className="form-field form-title-field">
        Title
        <input
          required
          maxLength={200}
          placeholder="What needs to get done?"
          value={values.title}
          onChange={(event) => update('title', event.target.value)}
        />
      </label>
      <label className="form-field">
        Description
        <textarea
          maxLength={2000}
          placeholder="Add a few details..."
          value={values.description}
          onChange={(event) => update('description', event.target.value)}
        />
      </label>
      <label className="form-field">
        Priority
        <select value={values.priority} onChange={(event) => update('priority', event.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label className="form-field">
        Status
        <select value={values.status} onChange={(event) => update('status', event.target.value)}>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <label className="form-field">
        Due date
        <input
          type="date"
          value={values.dueDate}
          onChange={(event) => update('dueDate', event.target.value)}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <div className="form-actions">
        <button className="primary-button" type="submit">{editing ? 'Save task' : 'Add task'}<span aria-hidden="true">↗</span></button>
        {editing && <button className="text-button" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
