import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/app/App.jsx';
import { taskApi } from '../../src/services/api.js';

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(taskApi, 'list').mockResolvedValue([]);
  });

  it('renders the task dashboard and empty state', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Smart Todo' })).toBeInTheDocument();
    expect(await screen.findByText('No tasks found.')).toBeInTheDocument();
  });

  it('shows a loading state while the task list is pending', async () => {
    let resolveList;
    vi.mocked(taskApi.list).mockImplementation(
      () => new Promise((resolve) => { resolveList = resolve; }),
    );
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading tasks');
    resolveList([]);
    expect(await screen.findByText('No tasks found.')).toBeInTheDocument();
  });
});
