import { checkInvariants, validateOutput } from './contract.js';

export function evaluateCase(testCase, modelOutput) {
  let output = modelOutput;
  const parseErrors = [];
  if (typeof modelOutput === 'string') {
    try {
      output = JSON.parse(modelOutput);
    } catch {
      output = null;
      parseErrors.push('Generated output is not valid JSON.');
    }
  }

  const structuralErrors = parseErrors.length ? parseErrors : validateOutput(output);
  const structural = { passed: structuralErrors.length === 0, errors: structuralErrors };
  const invariantErrors = structural.passed
    ? checkInvariants(output, testCase.input, testCase.expected)
    : ['Invariant checks require schema-valid JSON output.'];
  const invariants = { passed: invariantErrors.length === 0, errors: invariantErrors };
  const semantic = scoreSemantics(testCase.expected, output);

  return {
    caseId: testCase.id,
    requirements: testCase.requirements,
    structural,
    invariants,
    semantic,
    passed: structural.passed && invariants.passed && semantic.score === 1,
  };
}

export function aggregateResults(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return {
      caseCount: 0,
      structuralPassRate: 0,
      invariantPassRate: 0,
      meanSemanticScore: 0,
      aggregateScore: 0,
      decision: 'FAIL',
    };
  }
  const structuralPassRate = results.filter((result) => result.structural.passed).length / results.length;
  const invariantPassRate = results.filter((result) => result.invariants.passed).length / results.length;
  const meanSemanticScore = results.reduce((sum, result) => sum + result.semantic.score, 0) / results.length;
  const aggregateScore = 0.30 * structuralPassRate + 0.30 * invariantPassRate + 0.40 * meanSemanticScore;
  const decision = structuralPassRate === 1
    && invariantPassRate === 1
    && meanSemanticScore >= 0.8
    && aggregateScore >= 0.9
    ? 'PASS'
    : 'FAIL';

  return {
    caseCount: results.length,
    structuralPassRate,
    invariantPassRate,
    meanSemanticScore,
    aggregateScore,
    decision,
  };
}

function scoreSemantics(expected, output) {
  if (!output || typeof output !== 'object' || Array.isArray(output)) {
    return { score: 0, checks: [{ name: 'valid-output', passed: false }] };
  }

  const checks = [];
  addCheck(checks, 'intent', output.intent === expected.intent);

  if (Object.hasOwn(expected, 'reminderTextContains')) {
    const actualTokens = normalize(output.reminderText).split(/\s+/).filter(Boolean);
    const expectedTokens = normalize(expected.reminderTextContains).split(/\s+/).filter(Boolean);
    addCheck(checks, 'reminder-meaning', expectedTokens.length > 0
      && expectedTokens.every((token) => actualTokens.includes(token)));
  }
  if (Object.hasOwn(expected, 'scheduledAt')) {
    addCheck(checks, 'scheduled-instant', sameInstant(output.scheduledAt, expected.scheduledAt));
  }
  if (Object.hasOwn(expected, 'timezone')) {
    addCheck(checks, 'timezone', output.timezone === expected.timezone);
  }
  if (Object.hasOwn(expected, 'targetReminderId')) {
    addCheck(checks, 'target-reminder', output.targetReminderId === expected.targetReminderId);
  }
  if (Object.hasOwn(expected, 'clarificationTopics')) {
    const question = normalize(output.clarificationQuestion);
    const topicsCovered = expected.clarificationTopics.every((topic) => {
      const alternatives = Array.isArray(topic) ? topic : [topic];
      return alternatives.some((alternative) => question.includes(normalize(alternative)));
    });
    addCheck(checks, 'clarification-topics', topicsCovered);
  }
  if (expected.reasonRequired) {
    addCheck(checks, 'refusal-rationale', typeof output.reason === 'string' && output.reason.trim() !== '');
  }

  const score = checks.length ? checks.filter((check) => check.passed).length / checks.length : 0;
  return { score, checks };
}

function addCheck(checks, name, passed) {
  checks.push({ name, passed: Boolean(passed) });
}

function normalize(value) {
  return typeof value === 'string'
    ? value.toLocaleLowerCase('en-US').replace(/[^a-z0-9]+/g, ' ').trim()
    : '';
}

function sameInstant(actual, expected) {
  if (actual === null || expected === null) return actual === expected;
  if (typeof actual !== 'string' || typeof expected !== 'string') return false;
  const actualTime = Date.parse(actual);
  const expectedTime = Date.parse(expected);
  return Number.isFinite(actualTime) && actualTime === expectedTime;
}
