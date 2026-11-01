const request = require('supertest');
const app = require('../../src/app');

describe('Express application foundation', () => {
  it('returns a structured 404 for an unknown route', async () => {
    const response = await request(app).get('/not-configured');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
    });
  });

  it('returns a structured error for malformed JSON', async () => {
    const response = await request(app)
      .post('/not-configured')
      .set('Content-Type', 'application/json')
      .send('{"broken":');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_JSON');
  });
});
