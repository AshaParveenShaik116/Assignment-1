# ADR-0003: REST API as the Shared Task Boundary

- **Status**: Accepted
- **Date**: 2026-11-01

## Context

The feature requires equivalent task operations across user interfaces. A stable,
documented boundary is needed so clients can create, find, update, and remove tasks
without implementing persistence or task rules themselves.

## Decision

Expose task operations through a JSON REST API under `/api/tasks`. The API is the
authoritative boundary for validation, task lifecycle rules, filtering, and persistence.
The browser client and CLI client use this contract. Document request/response shapes,
status codes, and error payloads in the feature's API contract.

Use `400` for invalid input, `404` for a missing task, and `500` for unexpected server
errors. Do not expose stack traces or internal details in client error responses.

## Consequences

- Clients can share a consistent task model and error behavior.
- API contract changes must be reflected in the browser client, CLI client, and tests.
- The service must distinguish invalid identifiers or payloads from valid requests for
  resources that do not exist.
