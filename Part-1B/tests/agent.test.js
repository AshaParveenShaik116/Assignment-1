import assert from 'node:assert/strict';
import test from 'node:test';
import { createReminderAgent } from '../src/agent.js';

test('returns validated structured output from the model adapter', async () => {
  const agent = createReminderAgent({
    generate: async () => JSON.stringify({
      intent: 'create',
      reminderText: 'Review notes',
      scheduledAt: '2026-11-08T09:00:00+05:30',
      timezone: 'Asia/Kolkata',
      targetReminderId: null,
      clarificationQuestion: null,
      confidence: 0.9,
      reason: null,
    }),
  });

  const result = await agent.parse({
    request: 'Remind me tomorrow at 9 to review notes',
    referenceNow: '2026-11-07T12:00:00+05:30',
    timezone: 'Asia/Kolkata',
    existingReminders: [],
  });
  assert.equal(result.intent, 'create');
});

test('does not contact the model for invalid input', async () => {
  let called = false;
  const agent = createReminderAgent({ generate: async () => { called = true; return '{}'; } });
  await assert.rejects(agent.parse({ request: 'x'.repeat(2001) }), /2,000/);
  assert.equal(called, false);
});

test('rejects invalid model output instead of returning a success-shaped fallback', async () => {
  const agent = createReminderAgent({ generate: async () => '{"intent":"create"}' });
  await assert.rejects(agent.parse({
    request: 'Remind me tomorrow at 9 to review notes',
    referenceNow: '2026-11-07T12:00:00+05:30',
    timezone: 'Asia/Kolkata',
    existingReminders: [],
  }), /invalid/i);
});
