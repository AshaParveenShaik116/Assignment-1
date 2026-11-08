import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TaskItem from '../../src/components/TaskItem.jsx';

describe('TaskItem', () => {
  it('sends status changes for the selected task', () => {
    const onStatusChange = vi.fn();
    const task = {
      id: 'task-1',
      subject: 'Biology',
      title: 'Prepare release',
      description: 'Study chapters 3 and 4',
      importantNotes: 'Bring the revision sheet',
      status: 'pending',
      priority: 'medium',
      studyDate: '2026-11-08',
      dueDate: '2026-11-10',
    };

    const { container } = render(
      <TaskItem
        task={task}
        onUpdate={vi.fn()}
        onStatusChange={onStatusChange}
        onArchive={vi.fn()}
      />,
    );

    expect(screen.getByText('Biology')).toBeInTheDocument();
    expect(screen.getByText(/Bring the revision sheet/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Prepare release' })).toHaveTextContent('Edit');
    expect(screen.getByRole('button', { name: 'Archive Prepare release' })).toHaveTextContent('Delete');
    const scheduleDates = [...container.querySelectorAll('.due-date')].map((element) => element.textContent);
    expect(scheduleDates[0]).toContain('Study');
    expect(scheduleDates[1]).toContain('Exam/target');

    fireEvent.change(screen.getByLabelText('Status for Prepare release'), {
      target: { value: 'in_progress' },
    });

    expect(onStatusChange).toHaveBeenCalledWith('task-1', 'in_progress');
  });
});
