import { useState } from 'react';
import TaskForm from './TaskForm.jsx';

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
};

function formatDate(value) {
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
          <p className="subject-label">{task.subject ?? 'General'}</p>
          {task.description && <p className="task-description">{task.description}</p>}
          {task.importantNotes && (
            <p className="important-notes"><strong>Important:</strong> {task.importantNotes}</p>
          )}
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
            {task.studyDate && (
              <span className="due-date"><span aria-hidden="true">◷</span>Study {formatDate(task.studyDate)}</span>
            )}
            {task.dueDate && (
              <span className="due-date"><span aria-hidden="true">⌁</span>Exam/target {formatDate(task.dueDate)}</span>
            )}
          </div>
        </div>
        <div className="task-actions">
          <button className="icon-button edit-button" type="button" aria-label={editing ? `Cancel edit ${task.title}` : `Edit ${task.title}`} onClick={() => setEditing((current) => !current)}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {editing ? <path d="m6 6 12 12M18 6 6 18" /> : <><path d="m14 5 5 5" /><path d="M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" /></>}
            </svg>
            <span>{editing ? 'Cancel' : 'Edit'}</span>
          </button>
          <button className="icon-button archive-button" type="button" aria-label={`Archive ${task.title}`} title="Delete study plan" onClick={() => onArchive(task.id)}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </svg>
            <span>Delete</span>
          </button>
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
