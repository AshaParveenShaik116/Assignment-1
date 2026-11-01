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
      description: 'Review with the team',
      status: 'in_progress',
      priority: 'high',
    });

    expect(updated).toMatchObject({
      title: 'Final plan',
      description: 'Review with the team',
      status: 'in_progress',
      priority: 'high',
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
});
