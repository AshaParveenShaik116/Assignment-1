# Research: Smart Todo & Task CLI/API

## Decision: Split the application into a frontend and a backend service

**Rationale**: The specification explicitly requires both a browser-facing interface and an API surface. A split architecture keeps the user experience focused on task management while preserving a clean, testable backend for persistence and validation.

**Alternatives considered**:
- Single monolith app: simpler for a tiny project, but it would blur the responsibilities between UI logic and business rules and make future API parity harder to guarantee.
- Backend-only CLI-first implementation: aligns with the original spec less well because the user explicitly asked for a frontend plus API.

## Decision: Use Node.js + Express with MongoDB + Mongoose

**Rationale**: The project already uses Node.js and Express, and MongoDB is the requested persistence layer. Mongoose provides schema validation, type enforcement, and persistence tooling for task creation, updates, and queries.

**Alternatives considered**:
- PostgreSQL with Prisma: strong relational model, but the requirement explicitly specifies MongoDB with Mongoose.
- In-memory persistence: easy for prototypes, but unacceptable for a persisted task system and API that must survive process restarts.

## Decision: Use React + Vite for the frontend

**Rationale**: Vite provides a fast development cycle and a thin, modern React structure for task forms, filters, and list rendering. It aligns with the requirement to support frontend testing with Vitest and React Testing Library.

**Alternatives considered**:
- Plain HTML/JS frontend: would not meet the stated frontend requirement and would lower testability and maintainability.
- Next.js: more opinionated and heavier than needed for a small task app.

## Decision: Use a shared task domain contract between UI and API

**Rationale**: The specification emphasizes equivalent behavior between CLI and API access points. A documented task model, validation rules, and error semantics keep the UI and API consistent without coupling them tightly.

**Alternatives considered**:
- Separate ad hoc validation in UI and API: creates drift and inconsistent behavior.
- No contract documentation: leaves API semantics ambiguous and makes later implementation risky.

## Decision: Standardize on Vitest for test coverage in both layers

**Rationale**: A single test runner reduces tooling overhead and supports component tests, API integration tests, and validation checks in the same ecosystem. Supertest can be layered on top for HTTP request testing.

**Alternatives considered**:
- Jest for backend and Vitest for frontend: workable but creates extra config complexity.
- Mocha/Chai only: acceptable but less aligned with the Vite ecosystem and the front-end requirement.

## Resolved unknowns

- Task ownership is personal, not multi-user auth v1.
- Task validation is explicit and server-centric, with UI validation as a UX layer.
- Error handling is consistent: 400 for validation, 404 for missing task, 500 for unexpected server failures.
- Search and filter behavior is text-based and status/priority-driven, matching the approved specification.
