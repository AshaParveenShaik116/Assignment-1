# Student Study Plan API Contract

The canonical machine-readable API contract is [openapi.yaml](./openapi.yaml)
(OpenAPI 3.1.0). Endpoint implementation and contract tests must conform to that document; update it
whenever request or response behavior changes. The existing `/tasks` path is kept for API
compatibility; each task resource represents a student study plan.

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

Returns all active study plans in deterministic order, optionally filtered by subject,
status, priority, scheduled study date, target date, or keyword.

Query parameters:
- `status` (`pending`, `in_progress`, `completed`)
- `priority` (`low`, `medium`, `high`)
- `subject` (case-insensitive exact match)
- `search` (case-insensitive substring match against subject, title, topics, or important notes)
- `studyAfter` / `studyBefore` (inclusive scheduled-study date bounds)
- `dueBefore` / `dueAfter` (inclusive exam or target date bounds)

Results are ordered by study date, target date, creation time descending, then identifier
ascending. Plans without a study date or target date are ordered before dated plans.

Example response:

```json
[
  {
    "id": "64f4d1c7f98a2e0c2b3a9c2a",
    "subject": "Biology",
    "title": "Revise cell structure",
    "description": "Read chapters 3 and 4",
    "importantNotes": "Bring flashcards",
    "status": "in_progress",
    "priority": "high",
    "studyDate": "2026-11-08",
    "dueDate": "2026-11-10",
    "createdAt": "2026-11-01T09:00:00.000Z",
    "updatedAt": "2026-11-01T10:15:00.000Z"
  }
]
```

### POST /api/tasks

Creates a new study plan. `subject` defaults to `General` for compatibility with existing
API clients.

Request body:

```json
{
  "subject": "Biology",
  "title": "Revise cell structure",
  "description": "Read chapters 3 and 4",
  "importantNotes": "Bring flashcards",
  "status": "pending",
  "priority": "high",
  "studyDate": "2026-11-08",
  "dueDate": "2026-11-10"
}
```

Success response: HTTP 201 with created task object.

### GET /api/tasks/:id

Returns a single task by identifier.

### PUT /api/tasks/:id

Replaces the editable study-plan fields. The request must include `subject`, `title`,
`description`, `importantNotes`, `status`, `priority`, `studyDate`, and `dueDate` (use
`null` to clear an optional date); the plan ID and creation timestamp are immutable.

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
- render validation and server errors clearly in the study-plan form and list;
- keep the study-plan model consistent with the API response shape; and
- support filtering by subject, status, priority, and date without duplicating plan records.
