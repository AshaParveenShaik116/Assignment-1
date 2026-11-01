import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Filters from '../../src/components/Filters.jsx';

describe('Filters', () => {
  it('notifies the user of search and filter changes', () => {
    const onChange = vi.fn();
    render(<Filters value={{}} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText(/search tasks/i), {
      target: { value: 'release' },
    });
    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'completed' },
    });

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      search: 'release',
      status: 'completed',
    }));
  });

  it('clears all filter values and notifies the caller', () => {
    const onChange = vi.fn();
    render(
      <Filters
        value={{ search: 'release', status: 'completed', priority: 'high', dueBefore: '2026-11-10' }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(onChange).toHaveBeenCalledWith({});
    expect(screen.getByLabelText(/search tasks/i)).toHaveValue('');
    expect(screen.getByLabelText(/status filter/i)).toHaveValue('');
    expect(screen.getByLabelText(/priority filter/i)).toHaveValue('');
    expect(screen.getByLabelText(/due before/i)).toHaveValue('');
  });
});
