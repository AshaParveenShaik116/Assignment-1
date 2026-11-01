import TaskItem from './TaskItem.jsx';

export default function TaskList({
  tasks,
  loading,
  error,
  onUpdate,
  onStatusChange,
  onArchive,
}) {
  if (loading) return <p role="status">Loading tasks…</p>;
  if (error) return <p className="list-message error-message" role="alert">{error}</p>;
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon"><span /></span>
        <h3>Nothing on your plate</h3>
        <p>No tasks found.</p>
        <p>Try adjusting your filters or add a new task.</p>
      </div>
    );
  }

  return (
    <ul className="task-list" aria-label="Tasks">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onStatusChange={onStatusChange}
          onArchive={onArchive}
        />
      ))}
    </ul>
  );
}
