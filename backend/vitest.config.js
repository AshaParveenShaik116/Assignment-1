const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    globals: true,
    testTimeout: 15000,
    hookTimeout: 30000,
    clearMocks: true,
    restoreMocks: true,
  },
});
