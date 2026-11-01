const mongoose = require('mongoose');

async function connectDatabase(uri) {
  if (typeof uri !== 'string' || uri.trim() === '') {
    throw new Error('A MongoDB connection URI is required');
  }

  await mongoose.connect(uri);
  return mongoose.connection;
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };
