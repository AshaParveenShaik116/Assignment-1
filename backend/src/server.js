const { loadEnvironment } = require('./config/environment');
const { connectDatabase } = require('./config/database');
const app = require('./app');

async function startServer() {
  const config = loadEnvironment();
  await connectDatabase(config.mongoUri);

  return new Promise((resolve, reject) => {
    const server = app.listen(config.port, () => resolve(server));
    server.once('error', reject);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Backend startup failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { startServer };
