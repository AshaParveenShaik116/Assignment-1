import { useEffect, useState } from 'react';

export default function Filters({ value = {}, onChange }) {
  const [filters, setFilters] = useState(value);

  useEffect(() => setFilters(value), [value]);

  function change(field, nextValue) {
    const next = { ...filters, [field]: nextValue };
    setFilters(next);
    onChange(next);
  }

  function reset() {
    setFilters({});
    onChange({});
  }

  return (
    <fieldset className="filters">
      <legend className="visually-hidden">Find tasks</legend>
      <label className="search-field">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
        <span className="visually-hidden">Search tasks</span>
        <input
          placeholder="Search your tasks..."
          value={filters.search ?? ''}
          onChange={(event) => change('search', event.target.value)}
        />
      </label>
      <label className="filter-field">
        Status filter
        <select
          value={filters.status ?? ''}
          onChange={(event) => change('status', event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <label className="filter-field">
        Priority filter
        <select
          value={filters.priority ?? ''}
          onChange={(event) => change('priority', event.target.value)}
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label className="filter-field filter-date">
        Due before
        <input
          type="date"
          value={filters.dueBefore ?? ''}
          onChange={(event) => change('dueBefore', event.target.value)}
        />
      </label>
      <label className="filter-field filter-date">
        Due after
        <input
          type="date"
          value={filters.dueAfter ?? ''}
          onChange={(event) => change('dueAfter', event.target.value)}
        />
      </label>
      <button className="clear-filters" type="button" onClick={reset}>Clear filters</button>
    </fieldset>
  );
}
