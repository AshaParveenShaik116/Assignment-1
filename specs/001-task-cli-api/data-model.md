# Data Model: Smart Todo & Task CLI/API

## Overview

The feature manages a personal task workspace. A user owns a set of tasks, and each task carries a lifecycle from pending to in progress to complete. The API and front-end both operate on the same core entity semantics so behavior remains consistent across interfaces.

## Entities

### User

Represents the owner of a task workspace.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | Stable user identifier for the current workspace |
| name | string | No | Display name for the user or workspace owner |
| email | string | No | Optional contact descriptor for future extension |
| createdAt | datetime | Yes | Time the workspace was created |
| updatedAt | datetime | Yes | Last modification time |

Validation rules:
- `id` must be a non-empty string.
- `name` and `email` are optional for v1, but any provided values must be trimmed and valid.

### Task

Represents an individual unit of work.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | MongoDB document ID or stable task identifier |
| title | string | Yes | Short task name; trimmed and non-empty |
| description | string | No | Additional task context or notes |
| status | enum | Yes | One of `pending`, `in_progress`, `completed` |
| priority | enum | Yes | One of `low`, `medium`, `high` |
| dueDate | date | No | Optional due date for planning or urgency tracking |
| createdAt | datetime | Yes | Creation timestamp |
| updatedAt | datetime | Yes | Last update timestamp |
| userId | string | Yes | Owner reference for task access and filtering |

Validation rules:
- `title` must be 1-200 characters after trimming.
- `description` may be empty or up to 2,000 characters.
- `status` must be one of the allowed lifecycle values.
- `priority` must be one of the allowed planning values.
- `dueDate` must be a valid ISO date when provided.
- `userId` must identify the owning workspace. In v1, the unauthenticated single-user workspace uses the reserved identifier `default`; authentication and multi-user ownership are out of scope.

### Workspace / Task List

Represents the collection of tasks being reviewed together.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | Unique workspace identifier |
| userId | string | Yes | Reference to the owning user |
| name | string | No | Optional name for the workspace |
| createdAt | datetime | Yes | Workspace creation date |
| updatedAt | datetime | Yes | Last workspace change |

Validation rules:
- `userId` must be present for any stored item; v1 uses the reserved `default` workspace owner.
- `name` is optional in v1 but may be used for future multi-task grouping.

## Relationships

- One user owns many tasks.
- One workspace contains many tasks for the current single-user flow.
- Each task may belong to one workspace and one owner.

## State transitions

```text
pending -> in_progress -> completed
     \-> pending
completed -> in_progress -> completed
```

Transition rules:
- Status changes are allowed only to valid enum values.
- Tasks may be reopened from completed back to in_progress or pending.
- Due-date changes do not change the task lifecycle unless the user chooses to update the status.

## Update and validation rules

- Titles are required and cannot be blank after trimming.
- Duplicate task creation is prevented by a unique title + owner scope rule in the API layer if the design requires it.
- Missing or invalid task IDs return a 404 or 400 depending on request shape.
- Unknown status and priority values return 400 with a structured validation error.
- Server-side validation must run before persistence to prevent corrupt records.
