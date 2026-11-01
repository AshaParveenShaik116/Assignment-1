const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let server;

async function startTestDatabase() {
  if (server) {
    throw new Error('The in-memory test database is already running');
  }

  server = await MongoMemoryServer.create();
  await mongoose.connect(server.getUri());
  return mongoose.connection;
}

async function stopTestDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (server) {
    await server.stop();
    server = undefined;
  }
}

module.exports = { startTestDatabase, stopTestDatabase };
