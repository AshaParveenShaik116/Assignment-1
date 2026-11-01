#!/usr/bin/env node

const { createApiClient } = require('./apiClient');
const { runCommand } = require('./taskCommands');

async function main(args = process.argv.slice(2)) {
  try {
    await runCommand(args, createApiClient());
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
