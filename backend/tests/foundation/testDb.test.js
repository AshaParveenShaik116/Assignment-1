const mongoose = require('mongoose');
const { startTestDatabase, stopTestDatabase } = require('../setup/testDb');

describe('isolated test database', () => {
  afterEach(async () => {
    await stopTestDatabase();
  });

  it('connects and disconnects a disposable MongoDB instance', async () => {
    await startTestDatabase();
    expect(mongoose.connection.readyState).toBe(1);

    await stopTestDatabase();
    expect(mongoose.connection.readyState).toBe(0);
  });
});
