const mongoose = require('mongoose');
const Task = require('../../src/models/Task');
const taskService = require('../../src/services/taskService');
const { startTestDatabase, stopTestDatabase } = require('../setup/testDb');

describe('taskService', () => {
  beforeAll(async () => startTestDatabase());
  afterAll(async () => stopTestDatabase());
  beforeEach(async () => Task.deleteMany({}));

  it('creates and retrieves a task', async () => {
    const created = await taskService.createTask({ title: 'Plan release' });
    const found = await taskService.getTaskById(created.id);

    expect(found.title).toBe('Plan release');
  });

  it('updates details and status without making duplicates', async () => {
    const created = await taskService.createTask({ title: 'Draft plan' });
    const updated = await taskService.updateTask(created.id, {
      title: 'Final plan',
      subject: 'History',
      description: 'Review with the team',
      importantNotes: 'Bring the review sheet',
      status: 'in_progress',
      priority: 'high',
      studyDate: '2026-11-08',
      dueDate: '2026-11-10',
    });

    expect(updated).toMatchObject({
      title: 'Final plan',
      subject: 'History',
      description: 'Review with the team',
      importantNotes: 'Bring the review sheet',
      status: 'in_progress',
      priority: 'high',
      studyDate: '2026-11-08',
      dueDate: '2026-11-10',
    });
    expect(await Task.countDocuments()).toBe(1);
  });

  it('archives tasks while retaining their audit record', async () => {
    const created = await taskService.createTask({ title: 'Archive me' });
    await taskService.archiveTask(created.id);

    const archived = await Task.findById(new mongoose.Types.ObjectId(created.id));
    expect(archived).not.toBeNull();
    expect(archived.archivedAt).toBeInstanceOf(Date);
    expect(await taskService.listTasks()).toEqual([]);
    await expect(taskService.getTaskById(created.id)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('filters tasks and returns a deterministic order', async () => {
    await taskService.createTask({ title: 'Alpha', status: 'pending', priority: 'low' });
    await taskService.createTask({ title: 'Beta', status: 'completed', priority: 'high' });
    await taskService.createTask({ title: 'Gamma', description: 'release notes', priority: 'high' });

    const results = await taskService.listTasks({ priority: 'high', search: 'release' });

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Gamma');
  });

  it('filters by subject and scheduled study date and searches important notes', async () => {
    await taskService.createTask({
      subject: 'Biology',
      title: 'Revise cells',
      studyDate: '2026-11-08',
      importantNotes: 'Review the labeled diagram',
    });
    await taskService.createTask({
      subject: 'History',
      title: 'Review dates',
      studyDate: '2026-11-09',
    });

    const results = await taskService.listTasks({
      subject: 'biology',
      studyAfter: '2026-11-08',
      studyBefore: '2026-11-08',
      search: 'labeled diagram',
    });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      subject: 'Biology',
      studyDate: '2026-11-08',
      importantNotes: 'Review the labeled diagram',
    });
  });
});
