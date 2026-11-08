# Quickstart: Student Exam Preparation Planner

## Prerequisites

- Node.js 20 LTS or newer
- MongoDB running locally or in a managed environment
- Access to a terminal for the frontend and backend commands

## Environment setup

1. Copy `backend/.env.example` to `backend/.env` and set the MongoDB connection string.
2. Copy `frontend/.env.example` to `frontend/.env` if the API is not at its default URL.

Example backend environment variables:

```bash
PORT=4000
MONGO_URI=mongodb://localhost:27017/exam-prep-planner
NODE_ENV=development
```

## Start the backend

```bash
cd backend
npm install
npm run dev
```

Expected outcome:
- The REST API is running on `http://localhost:4000`.
- Study-plan CRUD routes are available under `/api/tasks`, validated against
  `specs/001-task-cli-api/contracts/openapi.yaml`.

## Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Expected outcome:
- The React app is running on the Vite local dev server.
- The study dashboard loads and shows study plans from the backend.

## Use the CLI

With the backend running:

```bash
cd backend
npm run task -- add "Revise cell structure" --subject Biology --study-date 2026-11-08 --due-date 2026-11-10 --notes "Bring flashcards"
npm run task -- list --status pending
```

Expected outcome:
- CLI output is readable JSON for study plans.
- CLI actions use the same REST API and persisted plans as the frontend.

## Validation scenarios

### Scenario 1: Create a study plan

1. Open the frontend application.
2. Enter a subject, study goal, study date, target date, and optional important notes.
3. Confirm the new plan appears in the study list immediately.
4. Confirm the API returns HTTP 201.

### Scenario 2: Update study-plan status

1. Select a study plan and mark it in progress or complete.
2. Verify the plan status updates to the chosen state.
3. Confirm the backend persists the new status through a subsequent read.

### Scenario 3: Filter and search study plans

1. Create plans for distinct subjects, statuses, study dates, and target dates.
2. Filter by subject, status, priority, or date.
3. Search by subject, topic, or important notes.
4. Confirm the plan list reflects only matching study plans.

### Scenario 4: Invalid input handling

1. Submit a blank subject or goal, invalid date, or invalid status value.
2. Confirm a clear validation error is displayed.
3. Confirm the API returns HTTP 400 with a structured error payload.

## Run tests

```bash
cd backend
npm run test

cd ../frontend
npm run test -- --run
```

Expected outcome:
- Backend tests pass for study-plan CRUD flow and validation error handling.
- Frontend tests pass for task form behavior and main dashboard rendering.
- API requests and responses pass OpenAPI request/response validation.
- The CLI/API parity integration test exercises create, read, and status updates against a
  running HTTP server backed by an isolated MongoDB test instance.

Validation boundary: frontend tests run in jsdom, and backend integration tests use an
isolated MongoDB test instance. The suites do not exercise a real browser or a deployed
MongoDB service; use the scenarios above for an environment-specific smoke test.
