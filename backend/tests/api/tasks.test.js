const request = require('supertest');
const Task = require('../../src/models/Task');
const app = require('../../src/app');
const { startTestDatabase, stopTestDatabase } = require('../setup/testDb');

describe('Task API', () => {
  beforeAll(async () => startTestDatabase());
  afterAll(async () => stopTestDatabase());
  beforeEach(async () => Task.deleteMany({}));

  it('creates and reads a task using the OpenAPI contract shape', async () => {
    const create = await request(app)
      .post('/api/tasks')
      .send({
        subject: 'AI SDLC',
        title: 'Tokenize the dataset',
        description: 'Read class 3 and 4',
        importantNotes: 'Review the assignment',
        studyDate: '2026-11-08',
        dueDate: '2026-11-10',
      });

    expect(create.status).toBe(201);
    expect(create.body).toMatchObject({
      subject: 'AI SDLC',
      title: 'Tokenize the dataset',
      studyDate: '2026-11-08',
      dueDate: '2026-11-10',
      importantNotes: 'Review the assignment',
      status: 'pending',
      priority: 'medium',
    });
    expect(create.body.id).toMatch(/^[a-f\d]{24}$/i);
    expect(create.body.createdAt).toBeTruthy();

    const read = await request(app).get(`/api/tasks/${create.body.id}`);
    expect(read.status).toBe(200);
    expect(read.body.id).toBe(create.body.id);
  });

  it('rejects invalid input and malformed identifiers with structured errors', async () => {
    const invalid = await request(app).post('/api/tasks').send({ title: '   ' });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe('VALIDATION_ERROR');

    const malformedId = await request(app).get('/api/tasks/not-an-id');
    expect(malformedId.status).toBe(400);
    expect(malformedId.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('updates task fields and status', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Draft plan' });
    const update = await request(app).put(`/api/tasks/${created.body.id}`).send({
      subject: 'Physics',
      title: 'Final plan',
      description: 'Reviewed',
      importantNotes: 'Use the formula sheet',
      status: 'pending',
      priority: 'high',
      dueDate: null,
      studyDate: '2026-11-12',
    });
    expect(update.status).toBe(200);
    expect(update.body.title).toBe('Final plan');
    expect(update.body).toMatchObject({
      subject: 'Physics',
      importantNotes: 'Use the formula sheet',
      studyDate: '2026-11-12',
    });

    const status = await request(app)
      .patch(`/api/tasks/${created.body.id}/status`)
      .send({ status: 'completed' });
    expect(status.status).toBe(200);
    expect(status.body.status).toBe('completed');
  });

  it('lists filtered active tasks and archives instead of deleting', async () => {
    await request(app).post('/api/tasks').send({ title: 'Release notes', priority: 'high' });
    await request(app).post('/api/tasks').send({ title: 'Groceries', priority: 'low' });

    const list = await request(app).get('/api/tasks?priority=high&search=release');
    expect(list.status).toBe(200);
    expect(list.body.map((task) => task.title)).toEqual(['Release notes']);

    const id = list.body[0].id;
    const archived = await request(app).delete(`/api/tasks/${id}`);
    expect(archived.status).toBe(204);
    expect(await Task.countDocuments()).toBe(2);
    expect((await request(app).get('/api/tasks')).body).toHaveLength(1);
  });

  it('filters by inclusive due-date range and rejects invalid query values', async () => {
    await request(app).post('/api/tasks').send({ title: 'Early', dueDate: '2026-11-05' });
    await request(app).post('/api/tasks').send({ title: 'Late', dueDate: '2026-11-15' });

    const filtered = await request(app).get('/api/tasks?dueAfter=2026-11-06&dueBefore=2026-11-20');
    expect(filtered.status).toBe(200);
    expect(filtered.body.map((task) => task.title)).toEqual(['Late']);

    const invalid = await request(app).get('/api/tasks?status=unknown');
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('filters by status and searches titles or descriptions case-insensitively', async () => {
    await request(app).post('/api/tasks').send({
      title: 'Release checklist',
      description: 'Coordinate with design',
      status: 'completed',
    });
    await request(app).post('/api/tasks').send({
      title: 'Grocery list',
      description: 'Coordinate with the DESIGN team',
      status: 'pending',
    });

    const completed = await request(app).get('/api/tasks?status=completed');
    expect(completed.body.map((task) => task.title)).toEqual(['Release checklist']);

    const search = await request(app).get('/api/tasks?search=design');
    expect(search.body.map((task) => task.title)).toEqual(['Grocery list', 'Release checklist']);
  });

  it('filters by subject and study date and searches important notes', async () => {
    await request(app).post('/api/tasks').send({
      subject: 'Biology',
      title: 'Revise cells',
      studyDate: '2026-11-08',
      importantNotes: 'Bring the revision sheet',
    });
    await request(app).post('/api/tasks').send({
      subject: 'History',
      title: 'Review dates',
      studyDate: '2026-11-09',
    });

    const response = await request(app)
      .get('/api/tasks?subject=biology&studyAfter=2026-11-08&studyBefore=2026-11-08&search=revision');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({
      subject: 'Biology',
      studyDate: '2026-11-08',
      importantNotes: 'Bring the revision sheet',
    });
  });

  it('orders undated tasks first, then due date, creation time, and identifier', async () => {
    const sameCreatedAt = new Date('2026-01-02T00:00:00.000Z');
    await Task.create([
      {
        _id: '507f1f77bcf86cd799439006',
        title: 'Undated task',
        createdAt: sameCreatedAt,
      },
      {
        _id: '507f1f77bcf86cd799439005',
        title: 'Later due date',
        dueDate: '2026-11-10',
        createdAt: sameCreatedAt,
      },
      {
        _id: '507f1f77bcf86cd799439004',
        title: 'Same date, older',
        dueDate: '2026-11-05',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
      {
        _id: '507f1f77bcf86cd799439003',
        title: 'Same date, later identifier',
        dueDate: '2026-11-05',
        createdAt: sameCreatedAt,
      },
      {
        _id: '507f1f77bcf86cd799439002',
        title: 'Same date, first identifier',
        dueDate: '2026-11-05',
        createdAt: sameCreatedAt,
      },
    ]);

    const response = await request(app).get('/api/tasks');

    expect(response.body.map((task) => task.title)).toEqual([
      'Undated task',
      'Same date, first identifier',
      'Same date, later identifier',
      'Same date, older',
      'Later due date',
    ]);
  });

  it('returns 404 for tasks that do not exist', async () => {
    const response = await request(app).get('/api/tasks/507f1f77bcf86cd799439011');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
