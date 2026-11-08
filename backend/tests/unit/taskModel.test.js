const Task = require('../../src/models/Task');

describe('Task model', () => {
  it('trims and validates a title', async () => {
    const task = new Task({ title: '  Plan release  ' });

    await task.validate();

    expect(task.title).toBe('Plan release');
  });

  it('trims subjects and validates subject and important-note lengths', async () => {
    const task = new Task({ subject: '  Biology  ', title: 'Review cells' });
    await task.validate();
    expect(task.subject).toBe('Biology');

    await expect(new Task({ subject: '  ', title: 'Review cells' }).validate())
      .rejects.toMatchObject({ errors: { subject: expect.anything() } });
    await expect(new Task({ subject: 'a'.repeat(101), title: 'Review cells' }).validate())
      .rejects.toMatchObject({ errors: { subject: expect.anything() } });
    await expect(new Task({
      title: 'Review cells',
      importantNotes: 'a'.repeat(2001),
    }).validate()).rejects.toMatchObject({ errors: { importantNotes: expect.anything() } });
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

  it('accepts defaults and optional ISO calendar study and target dates', async () => {
    const task = new Task({
      title: 'Task',
      dueDate: '2026-11-10',
      studyDate: '2026-11-08',
    });

    await task.validate();

    expect(task.status).toBe('pending');
    expect(task.priority).toBe('medium');
    expect(task.dueDate.toISOString()).toBe('2026-11-10T00:00:00.000Z');
    expect(task.studyDate.toISOString()).toBe('2026-11-08T00:00:00.000Z');
    expect(task.subject).toBe('General');
    expect(task.userId).toBe('default');
  });

  it('rejects non-calendar date strings', async () => {
    await expect(new Task({ title: 'Task', dueDate: '2026-02-30' }).validate())
      .rejects.toMatchObject({ errors: { dueDate: expect.anything() } });
    await expect(new Task({ title: 'Task', studyDate: '2026-02-30' }).validate())
      .rejects.toMatchObject({ errors: { studyDate: expect.anything() } });
  });
});
