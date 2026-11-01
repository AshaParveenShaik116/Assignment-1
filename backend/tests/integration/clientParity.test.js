const app = require('../../src/app');
const request = require('supertest');
const { startTestDatabase, stopTestDatabase } = require('../setup/testDb');
const { createApiClient } = require('../../src/cli/apiClient');
const { runCommand } = require('../../src/cli/taskCommands');

describe('CLI and API parity', () => {
  let server;
  let api;

  beforeAll(async () => {
    await startTestDatabase();
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    api = createApiClient(`http://127.0.0.1:${address.port}/api`);
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
    await stopTestDatabase();
  });

  it('shares task create, read, and status updates through the REST contract', async () => {
    const output = vi.fn();
    await runCommand(['add', 'Parity task'], api, output);
    const created = JSON.parse(output.mock.calls[0][0]);

    const readOutput = vi.fn();
    await runCommand(['show', created.id], api, readOutput);
    expect(JSON.parse(readOutput.mock.calls[0][0]).title).toBe('Parity task');

    await runCommand(['complete', created.id], api, vi.fn());
    expect((await api.get(created.id)).status).toBe('completed');
  });

  it('returns the API validation error through the CLI as well', async () => {
    const apiResponse = await request(app).post('/api/tasks').send({ title: '   ' });
    const cliError = await runCommand(['add', '   '], api, vi.fn()).catch((error) => error);

    expect(apiResponse.status).toBe(400);
    expect(cliError.message).toBe(apiResponse.body.error.message);
  });
});
