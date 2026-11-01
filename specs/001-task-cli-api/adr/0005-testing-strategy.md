# ADR-0005: Frontend and Backend Testing Strategy

- **Status**: Accepted
- **Date**: 2026-11-01

## Context

The feature must provide reliable task workflows in both its browser UI and backend
service. Frontend testing is specified with Vitest and React Testing Library. Backend
testing requires an appropriate Node.js framework and must exercise the HTTP contract.

## Decision

- Use Vitest with React Testing Library for frontend component and user-flow tests.
- Use Vitest for backend unit tests and Supertest for Express API integration tests.
- Test successful CRUD flows, filtering, validation failures, missing tasks, and
  consistent responses.
- Use an isolated test database or test database configuration so tests do not alter
  development or production data.
- Treat automated tests as required evidence before a behavior change is complete.

## Consequences

- One test runner reduces configuration overhead across the JavaScript project.
- Supertest exercises the HTTP boundary without requiring a separately deployed service.
- Database-dependent tests require explicit setup and teardown.
- The CLI client introduced by ADR-0001 must also receive command-level tests; its
  framework and exact test cases should be decided with the CLI interface.
