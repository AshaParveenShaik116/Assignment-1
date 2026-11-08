import assert from 'node:assert/strict';
import test from 'node:test';
import { checkInvariants, validateInput, validateOutput } from '../src/contract.js';

const validCreate = {
  intent: 'create',
  reminderText: 'Review cell biology',
  scheduledAt: '2026-11-08T09:00:00+05:30',
  timezone: 'Asia/Kolkata',
  targetReminderId: null,
  clarificationQuestion: null,
  confidence: 0.91,
  reason: null,
};

test('accepts a complete schema-conforming create result', () => {
  assert.deepEqual(validateOutput(validCreate), []);
});

test('rejects missing and additional response properties', () => {
  assert.match(validateOutput({ ...validCreate, reason: undefined })[0], /reason/);
  assert.match(validateOutput({ ...validCreate, unexpected: true }).join(' '), /unexpected/);
});

test('rejects invalid calendar timestamps and unknown IANA zones', () => {
  assert.match(
    validateOutput({ ...validCreate, scheduledAt: '2026-02-30T09:00:00Z' }).join(' '),
    /RFC 3339/,
  );
  assert.match(validateOutput({ ...validCreate, timezone: 'Mars/Olympus' }).join(' '), /time zone/i);
});

test('requires clarification output to remain non-actionable', () => {
  const result = {
    ...validCreate,
    intent: 'clarify',
    reminderText: null,
    scheduledAt: null,
    timezone: null,
    targetReminderId: null,
    clarificationQuestion: 'Which date should I use?',
    reason: null,
  };
  assert.deepEqual(validateOutput(result), []);
  assert.deepEqual(checkInvariants(result, {}, { intent: 'clarify' }), []);
  assert.match(checkInvariants({ ...result, scheduledAt: validCreate.scheduledAt }, {}, { intent: 'clarify' }).join(' '), /non-actionable/i);
});

test('rejects actionable results with low confidence', () => {
  assert.match(
    checkInvariants({ ...validCreate, confidence: 0.4 }, {}, { intent: 'create' }).join(' '),
    /low confidence/i,
  );
});

test('requires reschedule and snooze targets to exist in the supplied reminders', () => {
  const reschedule = {
    ...validCreate,
    intent: 'reschedule',
    targetReminderId: 'missing-id',
  };
  assert.match(
    checkInvariants(reschedule, { existingReminders: [] }, { intent: 'reschedule' }).join(' '),
    /supplied reminder/i,
  );
});

test('accepts empty input for clarification and rejects oversized input before model use', () => {
  assert.equal(validateInput({
    request: '',
    referenceNow: '2026-11-07T12:00:00+05:30',
    timezone: 'Asia/Kolkata',
    existingReminders: [],
  }).request, '');

  assert.throws(
    () => validateInput({
      request: 'x'.repeat(2001),
      referenceNow: '2026-11-07T12:00:00+05:30',
      timezone: 'Asia/Kolkata',
      existingReminders: [],
    }),
    /2,000/,
  );
});
