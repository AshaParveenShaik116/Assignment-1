import { useEffect, useState } from 'react';

const EMPTY_TASK = {
  subject: '',
  title: '',
  description: '',
  importantNotes: '',
  priority: 'medium',
  status: 'pending',
  studyDate: '',
  dueDate: '',
};

export default function TaskForm({ onCreate, onSave, initialTask, onCancel }) {
  const [values, setValues] = useState(EMPTY_TASK);
  const [error, setError] = useState('');
  const editing = Boolean(initialTask);

  useEffect(() => {
    if (initialTask) {
      setValues({
        subject: initialTask.subject ?? 'General',
        title: initialTask.title,
        description: initialTask.description ?? '',
        importantNotes: initialTask.importantNotes ?? '',
        priority: initialTask.priority,
        status: initialTask.status,
        studyDate: initialTask.studyDate ?? '',
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
      subject: values.subject.trim(),
      title: values.title.trim(),
      description: values.description,
      importantNotes: values.importantNotes,
      priority: values.priority,
      status: values.status,
    };
    if (editing || values.studyDate) payload.studyDate = values.studyDate || null;
    if (editing || values.dueDate) payload.dueDate = values.dueDate || null;

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
        Study subject
        <input
          required
          maxLength={100}
          placeholder="e.g. SDLC"
          value={values.subject}
          onChange={(event) => update('subject', event.target.value)}
        />
      </label>
      <label className="form-field form-title-field">
        Study goal
        <input
          required
          maxLength={200}
          placeholder="e.g. Revise class 07"
          value={values.title}
          onChange={(event) => update('title', event.target.value)}
        />
      </label>
      <label className="form-field">
        Topics or materials
        <textarea
          maxLength={2000}
          placeholder="Chapters, topics, or resources to cover"
          value={values.description}
          onChange={(event) => update('description', event.target.value)}
        />
      </label>
      <label className="form-field">
        Important notes
        <textarea
          maxLength={2000}
          placeholder="Exam reminders, key details, or anything to remember"
          value={values.importantNotes}
          onChange={(event) => update('importantNotes', event.target.value)}
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
        Study date
        <input
          type="date"
          value={values.studyDate}
          onChange={(event) => update('studyDate', event.target.value)}
        />
      </label>
      <label className="form-field">
        Exam / finish by
        <input
          type="date"
          value={values.dueDate}
          onChange={(event) => update('dueDate', event.target.value)}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <div className="form-actions">
        <button className="primary-button" type="submit">{editing ? 'Save plan' : 'Add study plan'}<span aria-hidden="true">↗</span></button>
        {editing && <button className="text-button" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
