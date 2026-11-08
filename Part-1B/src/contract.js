const OUTPUT_KEYS = [
  'intent',
  'reminderText',
  'scheduledAt',
  'timezone',
  'targetReminderId',
  'clarificationQuestion',
  'confidence',
  'reason',
];

const INTENTS = new Set(['create', 'reschedule', 'snooze', 'clarify', 'refuse']);
const TIMESTAMP_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

export class InputValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputValidationError';
    this.category = 'input_error';
  }
}

export function isValidRfc3339(value) {
  if (typeof value !== 'string') return false;
  const match = TIMESTAMP_PATTERN.exec(value);
  if (!match) return false;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, offset] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const daysInMonth = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
  ];

  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) return false;
  if (hour > 23 || minute > 59 || second > 59) return false;
  if (offset !== 'Z') {
    const offsetHour = Number(offset.slice(1, 3));
    const offsetMinute = Number(offset.slice(4, 6));
    if (offsetHour > 23 || offsetMinute > 59) return false;
  }
  return Number.isFinite(Date.parse(value));
}

export function isValidIanaTimezone(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function offsetFromTimestamp(value) {
  const match = TIMESTAMP_PATTERN.exec(value);
  if (!match) return null;
  const offset = match[7];
  if (offset === 'Z') return 0;
  const sign = offset[0] === '+' ? 1 : -1;
  return sign * (Number(offset.slice(1, 3)) * 60 + Number(offset.slice(4, 6)));
}

function offsetForTimezone(value, timezone) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const fields = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]));
  const localAsUtc = Date.UTC(
    Number(fields.year),
    Number(fields.month) - 1,
    Number(fields.day),
    Number(fields.hour),
    Number(fields.minute),
    Number(fields.second),
  );
  const instantAtSecond = Math.floor(date.getTime() / 1000) * 1000;
  return Math.round((localAsUtc - instantAtSecond) / 60000);
}

function timestampMatchesTimezone(value, timezone) {
  const offset = offsetFromTimestamp(value);
  return offset !== null && offset === offsetForTimezone(value, timezone);
}

export function validateInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new InputValidationError('Input must be an object.');
  }
  if (typeof input.request !== 'string') {
    throw new InputValidationError('request must be a string.');
  }
  if (input.request.length > 2000) {
    throw new InputValidationError('request must not exceed 2,000 characters.');
  }
  if (!isValidRfc3339(input.referenceNow)) {
    throw new InputValidationError('referenceNow must be a valid RFC 3339 timestamp.');
  }
  if (!isValidIanaTimezone(input.timezone)) {
    throw new InputValidationError('timezone must be a valid IANA time zone identifier.');
  }

  const existingReminders = input.existingReminders ?? [];
  if (!Array.isArray(existingReminders)) {
    throw new InputValidationError('existingReminders must be an array.');
  }
  for (const reminder of existingReminders) {
    if (!reminder || typeof reminder !== 'object'
      || typeof reminder.id !== 'string' || reminder.id.trim() === ''
      || typeof reminder.text !== 'string' || reminder.text.trim() === ''
      || !isValidRfc3339(reminder.scheduledAt)) {
      throw new InputValidationError('Each existing reminder must have a non-empty id, text, and valid scheduledAt timestamp.');
    }
  }

  return { ...input, existingReminders };
}

export function validateOutput(output) {
  const errors = [];
  if (!output || typeof output !== 'object' || Array.isArray(output)) {
    return ['Output must be a JSON object.'];
  }

  for (const key of OUTPUT_KEYS) {
    if (!Object.hasOwn(output, key)) errors.push(`Missing required property: ${key}.`);
  }
  for (const key of Object.keys(output)) {
    if (!OUTPUT_KEYS.includes(key)) errors.push(`Unexpected property: ${key}.`);
  }

  if (typeof output.intent !== 'string' || !INTENTS.has(output.intent)) {
    errors.push('intent must be one of create, reschedule, snooze, clarify, or refuse.');
  }
  for (const key of ['reminderText', 'scheduledAt', 'timezone', 'targetReminderId', 'clarificationQuestion', 'reason']) {
    if (output[key] !== null && typeof output[key] !== 'string') {
      errors.push(`${key} must be a string or null.`);
    }
  }
  for (const key of ['reminderText', 'targetReminderId', 'clarificationQuestion', 'reason']) {
    if (typeof output[key] === 'string' && output[key].trim() === '') {
      errors.push(`${key} must not be empty when provided.`);
    }
  }
  if (output.scheduledAt !== null && !isValidRfc3339(output.scheduledAt)) {
    errors.push('scheduledAt must be a valid RFC 3339 timestamp with an explicit offset.');
  }
  if (output.timezone !== null && !isValidIanaTimezone(output.timezone)) {
    errors.push('timezone must be a valid IANA time zone identifier.');
  }
  if (typeof output.confidence !== 'number' || !Number.isFinite(output.confidence)
    || output.confidence < 0 || output.confidence > 1) {
    errors.push('confidence must be a number from 0 through 1.');
  }

  if (INTENTS.has(output.intent)) {
    if (output.intent === 'create') {
      if (!nonEmptyString(output.reminderText)) errors.push('create requires reminderText.');
      if (!nonEmptyString(output.scheduledAt)) errors.push('create requires scheduledAt.');
      if (!nonEmptyString(output.timezone)) errors.push('create requires timezone.');
      if (output.targetReminderId !== null) errors.push('create must have a null targetReminderId.');
      if (output.clarificationQuestion !== null) errors.push('create must have a null clarificationQuestion.');
      if (output.reason !== null) errors.push('create must have a null reason.');
    } else if (output.intent === 'reschedule' || output.intent === 'snooze') {
      if (!nonEmptyString(output.reminderText)) errors.push(`${output.intent} requires reminderText.`);
      if (!nonEmptyString(output.scheduledAt)) errors.push(`${output.intent} requires scheduledAt.`);
      if (!nonEmptyString(output.timezone)) errors.push(`${output.intent} requires timezone.`);
      if (!nonEmptyString(output.targetReminderId)) errors.push(`${output.intent} requires targetReminderId.`);
      if (output.clarificationQuestion !== null) errors.push(`${output.intent} must have a null clarificationQuestion.`);
      if (output.reason !== null) errors.push(`${output.intent} must have a null reason.`);
    } else if (output.intent === 'clarify') {
      if (!nonEmptyString(output.clarificationQuestion)) errors.push('clarify requires clarificationQuestion.');
      for (const key of ['reminderText', 'scheduledAt', 'timezone', 'targetReminderId', 'reason']) {
        if (output[key] !== null) errors.push(`clarify must have a null ${key}.`);
      }
    } else if (output.intent === 'refuse') {
      if (!nonEmptyString(output.reason)) errors.push('refuse requires reason.');
      for (const key of ['reminderText', 'scheduledAt', 'timezone', 'targetReminderId', 'clarificationQuestion']) {
        if (output[key] !== null) errors.push(`refuse must have a null ${key}.`);
      }
    }
  }
  return errors;
}

export function checkInvariants(output, input = {}, expected = null) {
  const errors = [];
  if (!output || typeof output !== 'object' || Array.isArray(output)) {
    return ['Invariants cannot pass without a structured output object.'];
  }

  if (typeof output.confidence === 'number' && output.confidence < 0.55
    && output.intent !== 'clarify' && output.intent !== 'refuse') {
    errors.push('Low confidence output must clarify or refuse.');
  }

  if (output.intent === 'reschedule' || output.intent === 'snooze') {
    const reminders = Array.isArray(input.existingReminders) ? input.existingReminders : [];
    if (!reminders.some((reminder) => reminder.id === output.targetReminderId)) {
      errors.push('Reschedule and snooze targets must match a supplied reminder.');
    }
  }

  if (expected && (expected.intent === 'clarify' || expected.intent === 'refuse')) {
    const hasAction = ['create', 'reschedule', 'snooze'].includes(output.intent)
      || output.reminderText !== null || output.scheduledAt !== null || output.targetReminderId !== null;
    if (hasAction) errors.push('An incomplete or unsupported case must remain non-actionable.');
  }

  if (typeof output.scheduledAt === 'string' && typeof output.timezone === 'string'
    && isValidRfc3339(output.scheduledAt) && isValidIanaTimezone(output.timezone)
    && !timestampMatchesTimezone(output.scheduledAt, output.timezone)) {
    errors.push('scheduledAt offset must match the supplied time zone at that instant.');
  }

  return errors;
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}
