import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TaskForm from '../../src/components/TaskForm.jsx';

describe('TaskForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('submits a study plan and clears the form after success', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onCreate={onCreate} />);

    const title = screen.getByLabelText(/study goal/i);
    expect(title).toBeRequired();
    fireEvent.change(screen.getByLabelText(/study subject/i), { target: { value: 'Biology' } });
    fireEvent.change(screen.getByLabelText(/study goal/i), { target: { value: 'Revise cells' } });
    fireEvent.change(screen.getByLabelText(/topics or materials/i), { target: { value: 'Read chapter 3' } });
    fireEvent.change(screen.getByLabelText(/important notes/i), { target: { value: 'Bring flashcards' } });
    fireEvent.change(screen.getByLabelText(/^study date$/i), { target: { value: '2026-11-08' } });
    fireEvent.change(screen.getByLabelText(/exam \/ finish by/i), { target: { value: '2026-11-10' } });
    fireEvent.click(screen.getByRole('button', { name: /add study plan/i }));

    await waitFor(() => expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'Biology',
        title: 'Revise cells',
        description: 'Read chapter 3',
        importantNotes: 'Bring flashcards',
        studyDate: '2026-11-08',
        dueDate: '2026-11-10',
      }),
    ));
  });

  it('renders a server error', async () => {
    const onCreate = vi.fn().mockRejectedValue(new Error('Could not save task'));
    render(<TaskForm onCreate={onCreate} />);

    fireEvent.change(screen.getByLabelText(/study subject/i), { target: { value: 'Biology' } });
    fireEvent.change(screen.getByLabelText(/study goal/i), { target: { value: 'Revise cells' } });
    fireEvent.click(screen.getByRole('button', { name: /add study plan/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save task');
  });
});
