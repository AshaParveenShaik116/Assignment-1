# Task API Contract

The canonical machine-readable API contract is [openapi.yaml](./openapi.yaml)
(OpenAPI 3.1.0). Endpoint implementation and contract tests must conform to that
document; update it whenever request or response behavior changes.

## Base URL

`/api`

## Common conventions

- JSON request and response bodies
- HTTP 200 for successful reads and updates
- HTTP 201 for newly created resources
- HTTP 400 for validation errors
- HTTP 404 for missing task resources
- HTTP 500 for unexpected internal failures
- Error payload format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Task title is required",
    "details": ["title"]
  }
}
```

## Endpoints

### GET /api/tasks

Returns all active tasks in deterministic order, optionally filtered by status,
priority, due date, or keyword.

Query parameters:
- `status` (`pending`, `in_progress`, `completed`)
- `priority` (`low`, `medium`, `high`)
- `search` (case-insensitive substring match against title or description)
- `dueBefore` (ISO date, inclusive upper bound)
- `dueAfter` (ISO date, inclusive lower bound)

Results are ordered by due date ascending, creation time descending, then task identifier
ascending. Tasks without a due date are ordered before dated tasks.

Example response:

```json
[
  {
    "id": "64f4d1c7f98a2e0c2b3a9c2a",
    "title": "Prepare sprint review",
    "description": "Review blockers and share open risks",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2026-11-10",
    "createdAt": "2026-11-01T09:00:00.000Z",
    "updatedAt": "2026-11-01T10:15:00.000Z"
  }
]
```

### POST /api/tasks

Creates a new task.

Request body:

```json
{
  "title": "Prepare sprint review",
  "description": "Review blockers and share open risks",
  "status": "pending",
  "priority": "high",
  "dueDate": "2026-11-10"
}
```

Success response: HTTP 201 with created task object.

### GET /api/tasks/:id

Returns a single task by identifier.

### PUT /api/tasks/:id

Replaces the editable task fields. The request must include `title`, `description`,
`status`, `priority`, and `dueDate` (use `null` to clear the due date); the task ID and
creation timestamp are immutable.

### PATCH /api/tasks/:id/status

Updates only the task status.

Example request:

```json
{
  "status": "completed"
}
```

### DELETE /api/tasks/:id

Archives the task for audit purposes and returns HTTP 204. Archived tasks are excluded
from active task reads and lists.

## Frontend contract expectations

The React frontend must:
- use the task API for all list, create, update, and delete flows;
- render validation and server errors clearly in the task form and task list;
- keep the task model consistent with the API response shape; and
- support filtering by status and priority without duplicating the task records or changing the data model.
