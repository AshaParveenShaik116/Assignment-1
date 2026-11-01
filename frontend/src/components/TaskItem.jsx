import { useState } from 'react';
import TaskForm from './TaskForm.jsx';

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
};

function formatDueDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default function TaskItem({ task, onUpdate, onStatusChange, onArchive }) {
  const [editing, setEditing] = useState(false);

  return (
    <li>
      <article className={`task-card ${task.status === 'completed' ? 'task-completed' : ''}`}>
        <span className={`task-check task-check-${task.status}`} aria-hidden="true">
          {task.status === 'completed' ? '✓' : task.status === 'in_progress' ? '◷' : ''}
        </span>
        <div className="task-main">
          <div className="task-title-row">
            <h3>{task.title}</h3>
            <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
          </div>
          {task.description && <p className="task-description">{task.description}</p>}
          <div className="task-meta">
            <label className="status-control">
              <span className="visually-hidden">Status for {task.title}</span>
              <select
                className={`status-select status-${task.status}`}
                value={task.status}
                onChange={(event) => onStatusChange(task.id, event.target.value)}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            {task.dueDate && <span className="due-date"><span aria-hidden="true">◷</span>{formatDueDate(task.dueDate)}</span>}
          </div>
        </div>
        <div className="task-actions">
          <button className="icon-button" type="button" aria-label={editing ? `Cancel edit ${task.title}` : `Edit ${task.title}`} onClick={() => setEditing((current) => !current)}>
            {editing ? '×' : '✎'}
          </button>
          <button className="icon-button archive-button" type="button" aria-label={`Archive ${task.title}`} onClick={() => onArchive(task.id)}>⌑</button>
        </div>
        {editing && (
          <TaskForm
            initialTask={task}
            onSave={onUpdate}
            onCancel={() => setEditing(false)}
          />
        )}
      </article>
    </li>
  );
}
