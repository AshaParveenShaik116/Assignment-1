import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TaskForm from '../../src/components/TaskForm.jsx';

describe('TaskForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('submits task details and clears the form after success', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onCreate={onCreate} />);

    const title = screen.getByLabelText(/title/i);
    expect(title).toBeRequired();
    fireEvent.change(title, { target: { value: 'Plan release' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Write notes' } });
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Plan release', description: 'Write notes' }),
    ));
  });

  it('renders a server error', async () => {
    const onCreate = vi.fn().mockRejectedValue(new Error('Could not save task'));
    render(<TaskForm onCreate={onCreate} />);

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Plan release' } });
    fireEvent.click(screen.getByRole('button', { name: /add task/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save task');
  });
});
