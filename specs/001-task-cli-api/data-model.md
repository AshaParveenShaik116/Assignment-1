# Data Model: Student Exam Preparation Planner

## Overview

The feature manages a personal exam-preparation workspace. A student owns subject-based study plans, each with a study date, an optional exam or completion target, and important notes. The API and front-end share the same study-plan semantics.

## Entities

### User

Represents the owner of a study-planning workspace.

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

### Study Plan

Represents an individual preparation goal for a subject.

| Field | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | MongoDB document ID or stable study-plan identifier |
| subject | string | Yes | Subject being studied; trimmed, 1-100 characters |
| title | string | Yes | Study goal or topic; trimmed and non-empty |
| description | string | No | Topics, chapters, or materials to cover |
| importantNotes | string | No | Important reminders; up to 2,000 characters |
| status | enum | Yes | One of `pending`, `in_progress`, `completed` |
| priority | enum | Yes | One of `low`, `medium`, `high` |
| studyDate | date | No | Calendar date the student plans to study |
| dueDate | date | No | Exam date or target completion date |
| createdAt | datetime | Yes | Creation timestamp |
| updatedAt | datetime | Yes | Last update timestamp |
| userId | string | Yes | Owner reference for study-plan access and filtering |

Validation rules:
- `title` must be 1-200 characters after trimming.
- `subject` must be 1-100 characters after trimming. Legacy API clients that omit it receive `General`.
- `description` may be empty or up to 2,000 characters.
- `importantNotes` may be empty or up to 2,000 characters.
- `status` must be one of the allowed lifecycle values.
- `priority` must be one of the allowed planning values.
- `studyDate` and `dueDate` must be valid ISO dates when provided.
- `userId` must identify the owning workspace. In v1, the unauthenticated single-user workspace uses the reserved identifier `default`; authentication and multi-user ownership are out of scope.

### Workspace / Task List

Represents the collection of study plans being reviewed together.

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

- One student owns many study plans.
- One workspace contains many plans for the current single-user flow.
- Each plan belongs to one workspace and one owner.

## State transitions

```text
pending -> in_progress -> completed
     \-> pending
completed -> in_progress -> completed
```

Transition rules:
- Status changes are allowed only to valid enum values.
- Plans may be reopened from completed back to in_progress or pending.
- Study-date and target-date changes do not change the plan lifecycle.

## Update and validation rules

- Subject and study goal are required in the planner UI and cannot be blank after trimming.
- Missing or invalid plan IDs return a 404 or 400 depending on request shape.
- Unknown status and priority values return 400 with a structured validation error.
- Plans are ordered by scheduled study date, target date, creation time, then identifier.
- Server-side validation must run before persistence to prevent corrupt records.
