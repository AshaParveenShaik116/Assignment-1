const { loadEnvironment } = require('../../src/config/environment');

describe('loadEnvironment', () => {
  it('loads required database configuration and defaults', () => {
    expect(
      loadEnvironment({
        MONGO_URI: 'mongodb://localhost/test',
      }),
    ).toEqual({
      port: 4000,
      mongoUri: 'mongodb://localhost/test',
      nodeEnv: 'development',
      corsOrigins: ['http://localhost:5173'],
    });
  });

  it('rejects a missing MongoDB URI', () => {
    expect(() => loadEnvironment({})).toThrow('MONGO_URI is required');
  });

  it('rejects invalid ports', () => {
    expect(() => loadEnvironment({ PORT: '0', MONGO_URI: 'mongodb://localhost/test' }))
      .toThrow('PORT must be an integer between 1 and 65535');
  });
});
