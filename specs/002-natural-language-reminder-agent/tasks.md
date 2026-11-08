# Tasks: Natural-Language Reminder Agent

## Phase 1: Specification and evaluation design

- [X] T001 Write the user-facing specification, schema, invariants, scoring formula, and threshold in `specs/002-natural-language-reminder-agent/spec.md`.
- [X] T002 Review requirement quality and traceability in `specs/002-natural-language-reminder-agent/checklists/requirements.md`.
- [X] T003 Plan the model boundary and single evaluation pipeline in `specs/002-natural-language-reminder-agent/plan.md`.
- [X] T004 Define a diverse 15-case evaluation dataset with expected outcomes and rubric in `Part-1B/evals/dataset.json`.

## Phase 2: Contract and model adapter

- [X] T005 Implement output-schema validation, RFC 3339 and IANA time-zone checks, and specification-derived invariants in `Part-1B/src/contract.js`.
- [X] T006 Implement an OpenAI-compatible model client with environment configuration, bounded timeouts, JSON-only response handling, and safe error classification in `Part-1B/src/modelClient.js`.
- [X] T007 Implement reminder parsing with a fixed system contract and no tool execution in `Part-1B/src/agent.js`.

## Phase 3: Single evaluation harness

- [X] T008 Implement per-case structural, invariant, and rubric scoring plus the fixed aggregate decision in `Part-1B/src/evaluator.js`.
- [X] T009 Implement sequential live evaluation and non-secret result persistence in `Part-1B/src/evalRunner.js`.
- [X] T010 Add unit coverage for schema, invariants, score thresholds, dataset breadth, and provider error handling in `Part-1B/tests/`.

## Phase 4: Validate and document

- [X] T011 Document setup, model configuration, tests, and live evaluation in `Part-1B/README.md` and `Part-1B/.harness/README.md`.
- [X] T012 Run automated tests; run the live evaluation only when a configured model is available and preserve its actual output. Offline tests passed; the live runner recorded `configuration_error` because no AI_MODEL is configured.
- [ ] T013 Complete `Part-1B/evidence/harness-log.md` and human acceptance decision personally; do not synthesize history or findings.

## Dependencies

- T005-T009 depend on T001-T004.
- T010 depends on T005-T009.
- T011 can proceed alongside implementation.
- T012 depends on T010-T011 and a working configured model endpoint.
- T013 depends on actual coding-agent history and the results from T012.
