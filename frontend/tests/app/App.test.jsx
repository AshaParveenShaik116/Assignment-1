import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/app/App.jsx';
import { taskApi } from '../../src/services/api.js';

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(taskApi, 'list').mockResolvedValue([]);
  });

  it('renders the exam preparation dashboard and empty state', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Exam Prep Planner' })).toBeInTheDocument();
    expect(await screen.findByText('No study plans found.')).toBeInTheDocument();
  });

  it('shows a loading state while the task list is pending', async () => {
    let resolveList;
    vi.mocked(taskApi.list).mockImplementation(
      () => new Promise((resolve) => { resolveList = resolve; }),
    );
    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading study plans');
    resolveList([]);
    expect(await screen.findByText('No study plans found.')).toBeInTheDocument();
  });

  it('opens the study planner in its own tab instead of beside every list', async () => {
    render(<App />);

    expect(await screen.findByText('No study plans found.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Add study plan' })).not.toBeInTheDocument();
    const navigation = within(screen.getByRole('navigation', { name: 'Study plan views' }));
    expect(navigation.getAllByRole('button').slice(0, 2).map((button) => button.textContent))
      .toEqual(['Study planner', 'All study plans0']);

    fireEvent.click(screen.getByRole('button', { name: 'Study planner' }));

    expect(screen.getByRole('heading', { name: 'Plan your study session' })).toBeInTheDocument();
    expect(screen.getByLabelText(/study subject/i)).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Find study plans' })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Study plan summary' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Exam Prep Planner' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /All study plans/ }));

    expect(screen.getByRole('heading', { name: /All study plans/ })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Plan your study session' })).not.toBeInTheDocument();
  });
});
