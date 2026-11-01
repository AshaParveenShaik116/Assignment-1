import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TaskItem from '../../src/components/TaskItem.jsx';

describe('TaskItem', () => {
  it('sends status changes for the selected task', () => {
    const onStatusChange = vi.fn();
    const task = {
      id: 'task-1',
      title: 'Prepare release',
      description: '',
      status: 'pending',
      priority: 'medium',
      dueDate: null,
    };

    render(
      <TaskItem
        task={task}
        onUpdate={vi.fn()}
        onStatusChange={onStatusChange}
        onArchive={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Status for Prepare release'), {
      target: { value: 'in_progress' },
    });

    expect(onStatusChange).toHaveBeenCalledWith('task-1', 'in_progress');
  });
});
