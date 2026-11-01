const Task = require('../../src/models/Task');

describe('Task model', () => {
  it('trims and validates a title', async () => {
    const task = new Task({ title: '  Plan release  ' });

    await task.validate();

    expect(task.title).toBe('Plan release');
  });

  it('rejects a blank title and titles longer than 200 characters', async () => {
    await expect(new Task({ title: '   ' }).validate()).rejects.toMatchObject({
      errors: { title: expect.anything() },
    });
    await expect(new Task({ title: 'a'.repeat(201) }).validate()).rejects.toMatchObject({
      errors: { title: expect.anything() },
    });
  });

  it('enforces description length and enum values', async () => {
    await expect(new Task({ title: 'Task', description: 'a'.repeat(2001) }).validate())
      .rejects.toMatchObject({ errors: { description: expect.anything() } });
    await expect(new Task({ title: 'Task', status: 'started' }).validate())
      .rejects.toMatchObject({ errors: { status: expect.anything() } });
    await expect(new Task({ title: 'Task', priority: 'urgent' }).validate())
      .rejects.toMatchObject({ errors: { priority: expect.anything() } });
  });

  it('accepts defaults and an optional ISO calendar due date', async () => {
    const task = new Task({ title: 'Task', dueDate: '2026-11-10' });

    await task.validate();

    expect(task.status).toBe('pending');
    expect(task.priority).toBe('medium');
    expect(task.dueDate.toISOString()).toBe('2026-11-10T00:00:00.000Z');
    expect(task.userId).toBe('default');
  });

  it('rejects non-calendar date strings', async () => {
    await expect(new Task({ title: 'Task', dueDate: '2026-02-30' }).validate())
      .rejects.toMatchObject({ errors: { dueDate: expect.anything() } });
  });
});
