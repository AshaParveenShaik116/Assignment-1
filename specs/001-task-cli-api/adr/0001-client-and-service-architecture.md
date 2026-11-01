# ADR-0001: Client and Service Architecture

- **Status**: Proposed
- **Date**: 2026-11-01

## Context

The feature specification requires task management through both a command-line interface
and an API. The requested implementation plan also specifies a React browser frontend and
a Node.js backend. The plan currently describes the browser frontend and API but does not
include a CLI client, leaving one specified access path unaccounted for.

## Decision

Use one Node.js + Express backend as the owner of task rules and persistence. Provide a
React + Vite browser client and a CLI client that use the same task operations and error
semantics. The CLI must not maintain a separate task store or duplicate business rules.

Before implementation tasks are finalized, update the plan's project structure and test
approach to include the CLI client. Keep the CLI's command names and output conventions
open for planning rather than inventing them in this ADR.

## Consequences

- API, browser, and CLI operations can share one task model and produce consistent results.
- The CLI adds a client surface and requires its own interaction tests.
- The current plan is incomplete until it accounts for the CLI client and tests.
- The CLI's exact command syntax remains a planning decision.
