# Feature Specification: Natural-Language Reminder Agent

**Feature Branch**: `002-natural-language-reminder-agent`

**Created**: 2026-11-07

**Status**: Draft

**Input**: Assignment requirement for a natural-language reminder agent that parses reminder requests, interprets dates and times, supports reschedule/snooze intent, and asks for clarification when required information is missing.

## User Scenarios & Testing

### User Story 1 - Create reminders from natural language (Priority: P1)

A user describes a reminder in ordinary language and receives a structured reminder with the intended task, date, time, and time zone.

**Why this priority**: Creating a correctly understood reminder is the core user outcome.

**Independent Test**: Submit a request with an explicit reminder and unambiguous date/time and verify the normalized output against the request.

**Acceptance Scenarios**:

1. **Given** a complete reminder request, **When** the user submits it with a reference time and time zone, **Then** the agent returns a `create` result with faithful reminder text and a valid timestamp.
2. **Given** a relative date such as “tomorrow”, **When** the user supplies the reference time and time zone, **Then** the timestamp resolves to the intended local date and time.

### User Story 2 - Clarify incomplete or ambiguous requests (Priority: P1)

A user can leave out a required date, time, or reminder target and receive a focused question instead of an invented or unsafe action.

**Why this priority**: Missing details must not be silently guessed.

**Independent Test**: Submit requests with missing or ambiguous required details and verify the agent asks for the missing information without producing an actionable schedule.

**Acceptance Scenarios**:

1. **Given** a reminder request without a date or time, **When** it is parsed, **Then** the result is `clarify` and identifies the missing detail.
2. **Given** an empty or malformed request, **When** it is parsed, **Then** the result is non-actionable and asks for usable details.

### User Story 3 - Reschedule, snooze, or refuse unsupported actions (Priority: P2)

A user can request a change to an identified reminder; unsupported actions or instructions to bypass the agent’s boundaries do not result in a fabricated action.

**Why this priority**: Existing reminders need natural updates, while side effects must remain bounded.

**Independent Test**: Submit reschedule/snooze requests with and without a matching reminder, plus an unsupported or adversarial request, and verify the intended safe outcome.

**Acceptance Scenarios**:

1. **Given** an existing reminder and a complete reschedule or snooze request, **When** the request is parsed, **Then** the result identifies the existing reminder and the new timestamp.
2. **Given** no matching reminder or an unsupported action, **When** the request is parsed, **Then** the result asks for clarification or refuses without scheduling anything.
3. **Given** instructions embedded in the request to reveal system content or call tools, **When** parsed, **Then** the agent does not follow those instructions.

## Edge Cases

- Missing date, time, time zone, or target reminder.
- Invalid calendar dates, past times, and ambiguous relative-date phrases.
- Empty, excessively long, malformed, or adversarial input.
- Model timeout, unavailable provider, malformed JSON, and valid JSON with invalid fields.
- Model wording varies while the required intent and extracted meaning remain stable.

## Requirements

### Output Schema Contract

Every model result MUST be a JSON object with exactly these properties:

| Property | Type | Allowed values / rule |
|----------|------|-----------------------|
| `intent` | string | `create`, `reschedule`, `snooze`, `clarify`, or `refuse` |
| `reminderText` | string or null | Non-empty for actionable `create`; null when not actionable |
| `scheduledAt` | string or null | RFC 3339 timestamp with offset for actionable requests; null when not actionable |
| `timezone` | string or null | Valid IANA time-zone identifier when actionable |
| `targetReminderId` | string or null | Must match a supplied reminder for `reschedule`/`snooze` |
| `clarificationQuestion` | string or null | Non-empty for `clarify`; null otherwise |
| `confidence` | number | Inclusive range 0 through 1 |
| `reason` | string or null | Brief explanation for `refuse`; null otherwise |

### Functional Requirements

- **FR-001**: The agent MUST accept a request of zero through 2,000 characters, a reference timestamp, a time zone, and optional existing reminders. Empty requests require clarification; requests longer than 2,000 characters are rejected before contacting a model.
- **FR-002**: The agent MUST return the output schema above; provider output MUST be validated before acceptance.
- **FR-003**: The agent MUST preserve the semantic content of a requested reminder and interpret dates relative to the supplied reference timestamp and time zone.
- **FR-004**: The agent MUST return `clarify` when required information or a reschedule/snooze target is missing or ambiguous.
- **FR-005**: The agent MUST NOT create an actionable timestamp for `clarify` or `refuse` results.
- **FR-006**: The agent MUST only return `reschedule` or `snooze` for an identifier present in the supplied existing reminders.
- **FR-007**: The agent MUST refuse requests to reveal hidden instructions, invoke tools, or perform unsupported side effects.
- **FR-008**: The agent MUST distinguish provider/network failures from invalid model output and from evaluation failures.
- **FR-009**: The evaluation harness MUST use one pipeline for structural validation, invariant/property checks, semantic scoring, and aggregate pass/fail.
- **FR-010**: The evaluation dataset MUST contain at least 15 diverse, specification-traceable cases.
- **FR-011**: The harness MUST preserve generated outputs, per-layer results, metrics, and execution errors without recording credentials.
- **FR-012**: The model and endpoint MUST be configurable without committing secrets; no reminder is persisted or externally acted upon by this application.

### Structural Invariants

- The response MUST be a JSON object with no missing or extra properties and correct types/enums.
- Any non-null timestamp MUST be a valid RFC 3339 date-time with an explicit UTC offset.
- Any non-null time zone MUST be accepted as an IANA time-zone identifier.
- `create` requires non-empty `reminderText`, `scheduledAt`, and `timezone`; it cannot ask a clarification question, provide a refusal reason, or name a target reminder.
- `reschedule` and `snooze` require non-empty `reminderText`, a supplied matching `targetReminderId`, `scheduledAt`, and `timezone`; they cannot ask a clarification question or provide a refusal reason.
- `clarify` requires a non-empty question and MUST have null `reminderText`, `scheduledAt`, `timezone`, `targetReminderId`, and `reason`.
- `refuse` requires a non-empty reason and MUST have null `reminderText`, `scheduledAt`, `timezone`, `targetReminderId`, and `clarificationQuestion`.
- A low-confidence interpretation (below 0.55) MUST be `clarify` or `refuse`, never actionable.
- The model receives no tool definitions, and the application MUST never execute model-proposed tools.

### Evaluation Threshold and Scoring

The fixed dataset contains 15 or more cases. For each case, structural and invariant checks are binary. Semantic quality is the arithmetic mean of applicable rubric checks: expected intent; reminder meaning (all expected key terms present, when specified); timestamp equality by instant (when specified); target identifier equality (when specified); required clarification-topic coverage (when specified); and a non-empty refusal rationale (when specified). Aggregate score is `0.30 × structural pass rate + 0.30 × invariant pass rate + 0.40 × mean semantic score`. The harness passes only when every structural and invariant check passes, mean semantic score is at least 0.80, and aggregate score is at least 0.90. These thresholds MUST NOT be changed to obtain a pass.

## Success Criteria

- **SC-001**: All evaluation cases produce schema-valid outputs.
- **SC-002**: All cases obey the specified clarification, target, timestamp, and refusal invariants.
- **SC-003**: The average semantic score is at least 0.80 and the aggregate evaluation score is at least 0.90.
- **SC-004**: A reviewer can identify the failing case, expected property, observed output, and layer responsible from the generated result file.
- **SC-005**: No model/API credentials appear in source, committed configuration, or evaluation results.

## Assumptions

- The application parses requests only; it does not persist reminders, send notifications, or execute calendar operations.
- Reference time and time zone are provided for each evaluation so relative dates are reproducible.
- The user configures an OpenAI-compatible chat-completions endpoint and model locally.
- Model output wording may vary; evaluation uses schema, invariant, and semantic criteria rather than exact response-string equality.
- Human review and assignment reflection/log entries are completed by the student, not generated by the application.
