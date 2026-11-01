const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function loadEnvironment(env = process.env) {
  const port = Number(env.PORT ?? 4000);
  const mongoUri = env.MONGO_URI?.trim();

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  return {
    port,
    mongoUri,
    nodeEnv: env.NODE_ENV ?? 'development',
    corsOrigins: (env.CORS_ORIGINS ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}

module.exports = { loadEnvironment };
