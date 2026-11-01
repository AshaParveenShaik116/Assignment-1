import { useState } from 'react';
import Filters from '../components/Filters.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskList from '../components/TaskList.jsx';
import useTasks from '../hooks/useTasks.js';

const VIEWS = [
  { id: 'all', label: 'All tasks', icon: 'grid' },
  { id: 'today', label: 'Today', icon: 'sun' },
  { id: 'upcoming', label: 'Upcoming', icon: 'calendar' },
  { id: 'in_progress', label: 'In progress', icon: 'progress' },
  { id: 'completed', label: 'Completed', icon: 'check' },
];

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function Icon({ name }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    progress: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function App() {
  const [filters, setFilters] = useState({});
  const [activeView, setActiveView] = useState('all');
  const { tasks, loading, error, createTask, updateTask, updateStatus, archiveTask } =
    useTasks(filters);
  const counts = tasks.reduce((result, task) => {
    result[task.status] = (result[task.status] ?? 0) + 1;
    return result;
  }, {});
  const formattedDate = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date());
  const currentView = VIEWS.find((view) => view.id === activeView);

  function selectView(view) {
    const today = localDateString();
    const nextFilters = {
      all: {},
      today: { dueAfter: today, dueBefore: today },
      upcoming: { dueAfter: today },
      in_progress: { status: 'in_progress' },
      completed: { status: 'completed' },
    }[view];
    setActiveView(view);
    setFilters(nextFilters);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#main-content" aria-label="Smart Todo home">
          <span className="brand-mark"><span /></span>
          <span>Smart Todo</span>
        </a>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <div className="workspace-switch">
          <span className="workspace-avatar">P</span>
          <span className="workspace-name"><strong>Personal</strong><small>My workspace</small></span>
          <span className="workspace-caret">⌄</span>
        </div>
        <nav className="side-nav" aria-label="Task views">
          <p className="nav-heading">MENU</p>
          {VIEWS.map((view) => (
            <button
              className={`nav-link ${activeView === view.id ? 'is-active' : ''}`}
              key={view.id}
              type="button"
              aria-current={activeView === view.id ? 'page' : undefined}
              onClick={() => selectView(view.id)}
            >
              <Icon name={view.icon} />
              <span>{view.label}</span>
              {view.id === 'all' && <span className="nav-count">{tasks.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-spark">✳</span>
          <strong>Small steps add up.</strong>
          <p>Keep showing up for the things that matter.</p>
        </div>
        <div className="profile">
          <span className="profile-avatar">Y</span>
          <span><strong>Your account</strong><small>Personal workspace</small></span>
          <span className="profile-more">···</span>
        </div>
      </aside>

      <main className="main-area" id="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-right">
            <span className="date-display"><span className="date-dot" />{formattedDate}</span>
            <span className="topbar-avatar" aria-label="Your profile">Y</span>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome">
            <div>
              <p className="eyebrow">A FRESH PAGE, A CLEAR MIND</p>
              <h1>Smart Todo</h1>
              <p className="welcome-copy">A little progress each day adds up to big results.</p>
            </div>
            <div className="welcome-art" aria-hidden="true">
              <span className="art-sun" />
              <span className="art-hill art-hill-back" />
              <span className="art-hill art-hill-front" />
              <span className="art-star">✦</span>
            </div>
          </section>

          <section className="stats-grid" aria-label="Task summary">
            <article className="stat-card stat-total">
              <span className="stat-icon"><Icon name="grid" /></span>
              <span className="stat-label">Tasks in view</span>
              <strong>{loading ? '—' : tasks.length}</strong>
              <span className="stat-foot">Keep your momentum going</span>
            </article>
            <article className="stat-card stat-progress">
              <span className="stat-icon"><Icon name="progress" /></span>
              <span className="stat-label">In progress</span>
              <strong>{loading ? '—' : counts.in_progress ?? 0}</strong>
              <span className="stat-foot">One thing at a time</span>
            </article>
            <article className="stat-card stat-done">
              <span className="stat-icon"><Icon name="check" /></span>
              <span className="stat-label">Completed</span>
              <strong>{loading ? '—' : counts.completed ?? 0}</strong>
              <span className="stat-foot">Look how far you’ve come</span>
            </article>
          </section>

          <div className="content-grid">
            <section className="tasks-panel" aria-labelledby="task-list-heading">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">YOUR DAY, YOUR PACE</p>
                  <h2 id="task-list-heading">{currentView?.label ?? 'Your tasks'}<span className="heading-count">{loading ? '' : tasks.length}</span></h2>
                </div>
                <span className="list-date">{formattedDate}</span>
              </div>
              <Filters
                value={filters}
                onChange={(nextFilters) => {
                  setActiveView('all');
                  setFilters(nextFilters);
                }}
              />
              <TaskList
                tasks={tasks}
                loading={loading}
                error={error}
                onUpdate={updateTask}
                onStatusChange={updateStatus}
                onArchive={archiveTask}
              />
            </section>

            <aside className="right-rail">
              <section className="quick-add-card" aria-labelledby="create-task-heading">
                <div className="quick-add-heading">
                  <span className="quick-add-icon">+</span>
                  <div>
                    <p className="eyebrow">MAKE IT HAPPEN</p>
                    <h2 id="create-task-heading">Quick add</h2>
                  </div>
                </div>
                <p className="quick-add-copy">Get it out of your head and onto your list.</p>
                <TaskForm onCreate={createTask} />
              </section>
              <section className="focus-card">
                <span className="focus-icon">✦</span>
                <p className="eyebrow">A MOMENT TO FOCUS</p>
                <h3>Progress, not perfection.</h3>
                <p>Choose one task. Give it your attention. That’s enough for now.</p>
                <div className="focus-decoration" aria-hidden="true"><span /><span /><span /></div>
              </section>
            </aside>
          </div>
          <footer className="page-footer">Made for thoughtful days <span>✳</span></footer>
        </div>
      </main>
    </div>
  );
}
