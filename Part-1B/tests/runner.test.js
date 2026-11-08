import assert from 'node:assert/strict';
import { readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { runEvaluation } from '../src/evalRunner.js';

test('records missing model configuration as a configuration failure, not a model score', async () => {
  const directory = await import('node:fs/promises').then(({ mkdtemp }) => mkdtemp(path.join(os.tmpdir(), 'reminder-eval-')));
  const outputPath = path.join(directory, 'results.json');
  try {
    const report = await runEvaluation({
      env: { AI_BASE_URL: 'https://example.test/v1' },
      resultsPathOverride: outputPath,
    });
    assert.equal(report.status, 'configuration_error');
    assert.equal(report.results.length, 0);
    const saved = JSON.parse(await readFile(outputPath, 'utf8'));
    assert.equal(saved.runs[0].status, 'configuration_error');
    assert.equal(JSON.stringify(saved).includes('AI_API_KEY'), false);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('records provider HTTP failure distinctly and does not continue calling the provider', async () => {
  const { mkdtemp } = await import('node:fs/promises');
  const directory = await mkdtemp(path.join(os.tmpdir(), 'reminder-eval-'));
  let calls = 0;
  try {
    const report = await runEvaluation({
      env: { AI_BASE_URL: 'https://example.test/v1', AI_MODEL: 'test-model', AI_API_KEY: 'secret' },
      resultsPathOverride: path.join(directory, 'results.json'),
      fetchImpl: async () => {
        calls += 1;
        return { ok: false, status: 503, json: async () => ({}) };
      },
    });
    assert.equal(report.status, 'provider_error');
    assert.equal(report.error.category, 'provider_error');
    assert.equal(report.results.length, 0);
    assert.equal(calls, 1);
    assert.equal(JSON.stringify(report).includes('secret'), false);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('records malformed generated model output as an evaluation result', async () => {
  const { mkdtemp } = await import('node:fs/promises');
  const directory = await mkdtemp(path.join(os.tmpdir(), 'reminder-eval-'));
  try {
    const report = await runEvaluation({
      env: { AI_BASE_URL: 'https://example.test/v1', AI_MODEL: 'test-model' },
      resultsPathOverride: path.join(directory, 'results.json'),
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: 'not JSON' } }] }),
      }),
    });
    assert.equal(report.status, 'FAIL');
    assert.equal(report.results.length, 16);
    assert.equal(report.results[0].structural.passed, false);
    assert.equal(report.results[0].generatedOutput, 'not JSON');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
