const { runCommand } = require('../../src/cli/taskCommands');

describe('task CLI commands', () => {
  const createApi = () => ({
    create: vi.fn().mockResolvedValue({ id: 'task-1', title: 'Release notes' }),
    list: vi.fn().mockResolvedValue([{ id: 'task-1', title: 'Release notes' }]),
    get: vi.fn().mockResolvedValue({ id: 'task-1', title: 'Release notes' }),
    update: vi.fn().mockResolvedValue({ id: 'task-1', title: 'Updated' }),
    updateStatus: vi.fn().mockResolvedValue({ id: 'task-1', status: 'completed' }),
    archive: vi.fn().mockResolvedValue(null),
  });

  it('creates a task and prints the response as JSON', async () => {
    const api = createApi();
    const output = vi.fn();

    await runCommand(['add', 'Release notes', '--priority', 'high'], api, output);

    expect(api.create).toHaveBeenCalledWith({ title: 'Release notes', priority: 'high' });
    expect(output).toHaveBeenCalledWith(expect.stringContaining('"id": "task-1"'));
  });

  it('accepts subject, study date, target date, and important notes', async () => {
    const api = createApi();

    await runCommand([
      'add',
      'Revise cells',
      '--subject',
      'Biology',
      '--study-date',
      '2026-11-08',
      '--due-date',
      '2026-11-10',
      '--notes',
      'Bring flashcards',
    ], api, vi.fn());

    expect(api.create).toHaveBeenCalledWith({
      title: 'Revise cells',
      subject: 'Biology',
      studyDate: '2026-11-08',
      dueDate: '2026-11-10',
      importantNotes: 'Bring flashcards',
    });
  });

  it('lists tasks with filters', async () => {
    const api = createApi();
    await runCommand([
      'list',
      '--status',
      'pending',
      '--subject',
      'Biology',
      '--study-after',
      '2026-11-08',
    ], api, vi.fn());
    expect(api.list).toHaveBeenCalledWith({
      status: 'pending',
      subject: 'Biology',
      studyAfter: '2026-11-08',
    });
  });

  it('updates, completes, and archives tasks', async () => {
    const api = createApi();
    const output = vi.fn();

    await runCommand(['update', 'task-1', '--title', 'Updated'], api, output);
    await runCommand(['complete', 'task-1'], api, output);
    await runCommand(['archive', 'task-1'], api, output);

    expect(api.update).toHaveBeenCalledWith('task-1', { title: 'Updated' });
    expect(api.updateStatus).toHaveBeenCalledWith('task-1', 'completed');
    expect(api.archive).toHaveBeenCalledWith('task-1');
  });

  it('rejects invalid commands and missing arguments clearly', async () => {
    const api = createApi();
    await expect(runCommand(['add'], api, vi.fn())).rejects.toThrow('Usage: task add <title>');
    await expect(runCommand(['unknown'], api, vi.fn())).rejects.toThrow('Unknown command');
  });

  it('surfaces server errors without hiding their message', async () => {
    const api = createApi();
    api.create.mockRejectedValue(new Error('Task service unavailable'));

    await expect(runCommand(['add', 'Release notes'], api, vi.fn()))
      .rejects.toThrow('Task service unavailable');
  });
});
