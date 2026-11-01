# ADR-0004: MongoDB Task Persistence

- **Status**: Accepted
- **Date**: 2026-11-01

## Context

Tasks must persist across application sessions and support filtering by status, priority,
due date, and text. MongoDB with Mongoose is explicitly requested for this feature.

## Decision

Store tasks as MongoDB documents described by Mongoose schemas. The Task record includes
a required, trimmed title; optional description and due date; status; priority; and
creation and update timestamps. Validate task fields before persistence and use
deterministic ordering for list results.

For the initial single-user workspace, do not introduce authentication or multi-user
ownership behavior. Avoid a uniqueness constraint on task titles: the specification does
not require title uniqueness, and users may legitimately have similarly named tasks.

## Consequences

- Task data survives service restarts and can be queried by task attributes.
- MongoDB connection configuration must be supplied through environment configuration,
  not committed credentials.
- The initial data model remains smaller by omitting unused user and workspace entities.
- If shared workspaces or authentication are introduced, ownership and access-control
  fields require a new decision and a migration plan.
