import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { aggregateResults, evaluateCase } from '../src/evaluator.js';

const dataset = JSON.parse(await readFile(fileURLToPath(new URL('../evals/dataset.json', import.meta.url)), 'utf8'));

function createOutput(overrides = {}) {
  return {
    intent: 'create',
    reminderText: 'Review cell biology',
    scheduledAt: '2026-11-08T03:30:00.000Z',
    timezone: 'Asia/Kolkata',
    targetReminderId: null,
    clarificationQuestion: null,
    confidence: 0.92,
    reason: null,
    ...overrides,
  };
}

test('dataset contains at least 15 traceable, varied evaluation cases', () => {
  assert.ok(dataset.cases.length >= 15);
  assert.equal(new Set(dataset.cases.map((testCase) => testCase.id)).size, dataset.cases.length);
  assert.ok(dataset.cases.every((testCase) => testCase.requirements.length > 0));
  assert.ok(dataset.cases.some((testCase) => testCase.expected.intent === 'clarify'));
  assert.ok(dataset.cases.some((testCase) => testCase.expected.intent === 'refuse'));
  assert.ok(dataset.cases.some((testCase) => testCase.expected.intent === 'reschedule'));
  assert.ok(dataset.cases.some((testCase) => testCase.expected.intent === 'snooze'));
});

test('scores equivalent timestamp instants and paraphrased reminder wording', () => {
  const result = evaluateCase(dataset.cases[0], createOutput({
    reminderText: 'Please review cell biology',
    scheduledAt: '2026-11-08T09:00:00+05:30',
  }));
  assert.equal(result.structural.passed, true);
  assert.equal(result.invariants.passed, true);
  assert.equal(result.semantic.score, 1);
});

test('requires a focused clarification when information is missing', () => {
  const missingDate = dataset.cases.find((testCase) => testCase.id === 'missing-date');
  const output = createOutput({
    intent: 'clarify',
    reminderText: null,
    scheduledAt: null,
    timezone: null,
    clarificationQuestion: 'What date should I use?',
  });
  assert.equal(evaluateCase(missingDate, output).passed, true);
});

test('reports invalid generated JSON as structural failure without throwing', () => {
  const result = evaluateCase(dataset.cases[0], 'not json');
  assert.equal(result.structural.passed, false);
  assert.equal(result.invariants.passed, false);
  assert.equal(result.semantic.score, 0);
});

test('uses the fixed aggregate formula and threshold', () => {
  const passing = {
    structural: { passed: true },
    invariants: { passed: true },
    semantic: { score: 0.9 },
  };
  const accepted = aggregateResults([passing]);
  assert.equal(accepted.aggregateScore, 0.96);
  assert.equal(accepted.decision, 'PASS');

  const failed = aggregateResults([{ ...passing, invariants: { passed: false } }]);
  assert.equal(failed.decision, 'FAIL');
});
