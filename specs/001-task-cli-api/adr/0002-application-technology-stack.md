# ADR-0002: Application Technology Stack

- **Status**: Accepted
- **Date**: 2026-11-01

## Context

The feature needs a browser UI and a maintainable REST service. The repository already
uses Node.js and Express, and the requested plan explicitly selects React with Vite,
Node.js with Express, and MongoDB with Mongoose.

## Decision

- Use React and Vite for the browser frontend.
- Use Node.js and Express for the backend service.
- Use MongoDB with Mongoose for persistence and schema validation.
- Use JavaScript consistently for the initial implementation unless a later decision
  explicitly adopts TypeScript.

## Consequences

- The frontend and backend can be developed and tested independently.
- Mongoose schemas provide a central persistence-level validation boundary.
- The team must maintain frontend/backend configuration and local startup instructions.
- The earlier plan's “TypeScript preferred” note is not a firm decision; this ADR
  standardizes the initial implementation on JavaScript to avoid a mixed-language scope.
