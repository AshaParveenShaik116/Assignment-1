import assert from 'node:assert/strict';
import test from 'node:test';
import { createModelClient, ModelError } from '../src/modelClient.js';

test('sends a structured request to the configured OpenAI-compatible endpoint', async () => {
  let captured;
  const client = createModelClient({
    baseUrl: 'https://example.test/v1/',
    model: 'test-model',
    apiKey: 'test-key',
    fetchImpl: async (url, options) => {
      captured = { url: String(url), options };
      return {
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: '{"intent":"clarify"}' } }] }),
      };
    },
  });

  assert.equal(await client.generate({ request: 'Help me remember' }), '{"intent":"clarify"}');
  assert.equal(captured.url, 'https://example.test/v1/chat/completions');
  assert.equal(captured.options.headers.Authorization, 'Bearer test-key');
  const body = JSON.parse(captured.options.body);
  assert.equal(body.model, 'test-model');
  assert.equal(body.response_format.type, 'json_object');
  assert.equal('tools' in body, false);
});

test('classifies provider errors without exposing response bodies', async () => {
  const client = createModelClient({
    baseUrl: 'https://example.test/v1',
    model: 'test-model',
    fetchImpl: async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'sensitive provider detail' } }),
    }),
  });

  await assert.rejects(client.generate({ request: 'test' }), (error) => {
    assert.ok(error instanceof ModelError);
    assert.equal(error.category, 'provider_error');
    assert.doesNotMatch(error.message, /sensitive provider detail/);
    return true;
  });
});

test('requires a configured model and validates the endpoint before sending requests', () => {
  assert.throws(() => createModelClient({ baseUrl: 'https://example.test/v1', model: '' }), /AI_MODEL/);
  assert.throws(() => createModelClient({ baseUrl: 'not-a-url', model: 'test-model' }), /AI_BASE_URL/);
});
