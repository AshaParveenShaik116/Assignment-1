const mongoose = require('mongoose');
const { connectDatabase, disconnectDatabase } = require('../../src/config/database');

describe('database connection', () => {
  afterEach(async () => {
    await disconnectDatabase();
  });

  it('rejects a missing connection URI', async () => {
    await expect(connectDatabase('')).rejects.toThrow('A MongoDB connection URI is required');
  });

  it('surfaces MongoDB connection failures', async () => {
    await expect(
      connectDatabase('mongodb://127.0.0.1:1/smart-todo?serverSelectionTimeoutMS=100'),
    ).rejects.toBeInstanceOf(Error);
    expect(mongoose.connection.readyState).not.toBe(1);
  });
});
