---

description: "Task list for Smart Todo & Task CLI/API"
---

# Tasks: Smart Todo & Task CLI/API

**Input**: Design documents from `/specs/001-task-cli-api/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test tasks are included because the constitution requires automated coverage for changed behavior and test-first confidence.

**Organization**: Tasks are grouped by user story and ordered for independent implementation and validation.

## Phase 1: Setup

**Purpose**: Establish frontend and backend package foundations.

- [X] T001 Create the backend package manifest with Express, Mongoose, dotenv, CORS, Vitest, and Supertest dependencies and `dev`, `start`, and `test` scripts in `backend/package.json`
- [X] T002 [P] Create the React + Vite frontend package, entry point, and Vitest/React Testing Library configuration in `frontend/package.json`, `frontend/index.html`, and `frontend/vite.config.js`
- [X] T003 [P] Add Node.js build, dependency, log, and environment-file exclusions to the repository `.gitignore`

## Phase 2: Foundational

**Purpose**: Provide backend configuration and test infrastructure required by all stories.

- [X] T004 Create environment loading, MongoDB connection configuration, and a safe example environment file in `backend/src/config/database.js`, `backend/src/config/environment.js`, and `backend/.env.example`; read secrets only from environment variables
- [X] T005 Create the Express application and server entry points in `backend/src/app.js` and `backend/src/server.js`, including JSON parsing and CORS configuration without task routes
- [X] T006 [P] Configure backend Vitest and isolated database setup/teardown in `backend/vitest.config.js` and `backend/tests/setup/testDb.js`
- [X] T007 [P] Define shared error response helpers and the Express error-handling middleware in `backend/src/utils/errors.js` and `backend/src/middleware/errorHandler.js`

**Checkpoint**: Backend starts with environment-based configuration, and tests can use an isolated database. No task API behavior is implemented yet.

## Phase 3: User Story 1 - Create and manage personal tasks (Priority: P1) 🎯 MVP

**Goal**: Persist tasks with validated details and support the core create, read, update, completion, and archive lifecycle.

**Independent Test**: Create a task with valid fields, read it back, update its details and status, then archive it and verify it remains persisted but is excluded from active task results.

### Tests for User Story 1

- [X] T008 [P] [US1] Write Mongoose Task model tests for required/trimmed titles, title length 1-200, description length up to 2,000, status and priority enums, optional ISO due dates, and required owner reference in `backend/tests/unit/taskModel.test.js`
- [X] T009 [P] [US1] Write task service tests for create, read, update, status changes, and archive/audit timestamp behavior in `backend/tests/unit/taskService.test.js`
- [X] T010 [P] [US1] Write REST contract integration tests for task create, list, detail, update, status update, archive, and validation/not-found errors in `backend/tests/api/tasks.test.js`; verify request/response behavior against `specs/001-task-cli-api/contracts/openapi.yaml`
- [X] T011 [P] [US1] Write React Testing Library tests for task creation, status updates, loading, and validation/server error display in `frontend/tests/components/TaskForm.test.jsx`, `frontend/tests/components/TaskItem.test.jsx`, and `frontend/tests/app/App.test.jsx`

### Implementation for User Story 1

- [X] T012 [US1] Implement the Mongoose Task model in `backend/src/models/Task.js` after T008; enforce “title must be 1-200 characters after trimming”, “description may be empty or up to 2,000 characters”, status in `pending`, `in_progress`, `completed`, priority in `low`, `medium`, `high`, a valid ISO `dueDate` when supplied, and a required `userId` owner reference
- [X] T013 [US1] Implement task persistence operations in `backend/src/services/taskService.js` after T009 and T012, validating inputs before writes and retaining archived tasks with an `archivedAt` timestamp for the removal audit trail
- [X] T014 [US1] Implement task controllers and REST routes in `backend/src/controllers/taskController.js` and `backend/src/routes/taskRoutes.js` after T010 and T013; conform to `specs/001-task-cli-api/contracts/openapi.yaml`, return structured 400/404/500 errors, and exclude archived tasks from active lists
- [X] T015 [US1] Implement task creation and status-update UI flows, API client, and task-list rendering in `frontend/src/components/TaskForm.jsx`, `frontend/src/components/TaskList.jsx`, `frontend/src/components/TaskItem.jsx`, `frontend/src/hooks/useTasks.js`, and `frontend/src/services/api.js` after T011 and T014

**Checkpoint**: User Story 1 works independently through the API and browser UI, with tests covering the primary lifecycle.

## Phase 4: User Story 2 - Track task progress across different views (Priority: P2)

**Goal**: Help users find and review tasks by status, priority, due date, and text.

**Independent Test**: Seed tasks with different statuses, priorities, and due dates; verify each supported filter and keyword search returns only matching active tasks in deterministic order.

### Tests for User Story 2

- [X] T016 [P] [US2] Write API tests for status, priority, due-date, case-insensitive title/description search filters, and deterministic ordering in `backend/tests/api/tasks.test.js`
- [X] T017 [P] [US2] Write UI tests for filter selection, keyword search, empty results, and filter reset in `frontend/tests/components/Filters.test.jsx`

### Implementation for User Story 2

- [X] T018 [US2] Implement status, priority, due-date, and text filters plus deterministic task ordering in `backend/src/services/taskService.js` and `backend/src/controllers/taskController.js` after T016 and US1 API implementation
- [X] T019 [US2] Implement status/priority filters, due-date review, and keyword search in `frontend/src/components/Filters.jsx`, `frontend/src/hooks/useTasks.js`, and `frontend/src/app/App.jsx` after T017 and US1 UI implementation
- [X] T020 [P] [US2] Update `specs/001-task-cli-api/contracts/openapi.yaml` and `specs/001-task-cli-api/contracts/task-api.md` with supported list query parameters and deterministic ordering; keep the OpenAPI contract canonical

**Checkpoint**: Users can locate active tasks using the documented filters and search behavior.

## Phase 5: User Story 3 - Use the feature through both command and application interfaces (Priority: P3)

**Goal**: Provide a CLI that uses the same REST operations and task semantics as the browser and API.

**Independent Test**: Create or update a task from the CLI, verify it through the API and browser, then make an API change and verify the CLI reads the updated task.

### Tests for User Story 3

- [X] T021 [P] [US3] Write CLI command tests for add, list, show, update, complete, and archive, including clear invalid-input and server-error output, in `backend/tests/cli/taskCommands.test.js`
- [X] T022 [P] [US3] Write cross-interface tests verifying CLI and API operations return equivalent task data and errors in `backend/tests/integration/clientParity.test.js`

### Implementation for User Story 3

- [X] T023 [US3] Implement the CLI entry point, task commands, and REST client in `backend/src/cli/index.js`, `backend/src/cli/taskCommands.js`, and `backend/src/cli/apiClient.js` after T021 and US1 API implementation; use the same API contract and provide concise terminal errors
- [X] T024 [US3] Add the CLI executable and usage scripts to `backend/package.json` and document command examples in `backend/README.md` after T023

**Checkpoint**: CLI, browser, and API operations share the same persisted task behavior.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm end-to-end readiness and maintain documentation.

- [X] T025 [P] Update `specs/001-task-cli-api/quickstart.md` with backend, frontend, CLI setup and run instructions, environment requirements, and validation scenarios
- [X] T026 [P] Add regression coverage for malformed IDs, invalid dates/status/priority, empty titles, archived-task visibility, and database connection failures in `backend/tests/api/tasks.test.js` and `backend/tests/unit/taskModel.test.js`
- [X] T027 Run backend and frontend test suites and all quickstart scenarios; record any known gaps in `specs/001-task-cli-api/quickstart.md`

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T002 and T003 can run in parallel with T001.
- **Foundational (Phase 2)**: Depends on backend setup T001; T006 and T007 can run once T001 exists. User-story work begins after T004-T007.
- **User Story 1 (Phase 3)**: Depends on the foundational phase. Its model, service, API, and UI tests precede their corresponding implementations.
- **User Story 2 (Phase 4)**: Depends on User Story 1 task persistence and list behavior.
- **User Story 3 (Phase 5)**: Depends on the task REST contract from User Story 1.
- **Polish (Phase 6)**: Depends on all user stories selected for delivery.

### User Story Dependencies

- **US1 (P1)**: Starts after the foundational phase; no dependency on later stories.
- **US2 (P2)**: Extends US1 task listing and is sequenced after US1.
- **US3 (P3)**: Uses the US1 REST API; can proceed independently of US2 after the core API is available.

### Within Each User Story

- Tests are written before their corresponding implementation.
- Task model precedes task persistence operations; persistence precedes REST handlers.
- API contract tests precede route/controller implementation.
- UI tests precede UI implementation.
- CLI tests precede CLI implementation.

## Parallel Opportunities

- **Setup**: T002 and T003 are independent of T001 and each other.
- **Foundational**: T006 can be prepared in parallel with T004/T005 after T001; T007 can proceed in parallel with database configuration.
- **US1 tests**: T008 and T011 can be developed independently; T009 and T010 target separate backend test files and can be authored in parallel after foundational setup.
- **US2 tests**: T016 and T017 target separate backend and frontend test files and can run in parallel.
- **US3 tests**: T021 and T022 target separate files and can run in parallel after the API is available.
- **Polish**: T025 and T026 can run in parallel; T027 validates after both are complete.

## Parallel Example: User Story 1

```text
After T001-T007:
1. Write T008 (model tests) and T011 (frontend tests) in parallel.
2. Write T009 (service tests) and T010 (API contract tests) before their implementations.
3. Implement T012 (model), then T013 (service) and T014 (API routes) in dependency order.
4. Implement T015 after the frontend tests and task API contract are ready.
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete setup and foundational tasks T001-T007.
2. Complete the backend setup and task-model scope: T001-T008 and T012.
3. Validate backend setup/model separately before proceeding with service or REST behavior.
4. Continue with the remaining User Story 1 tasks only when API and UI behavior are in scope.

### Incremental Delivery

1. Complete the task-model checkpoint, then finish US1 for core task management.
2. Add US2 filtering and search.
3. Add US3 CLI access through the same REST contract.
4. Complete cross-cutting validation and documentation.

## Notes

- Every task uses the required checkbox, sequential ID, optional parallel marker, story label where applicable, and concrete file path.
- Tests are included to meet the project constitution's test-first and validation requirements.
- The feature specification requires a CLI, although the current plan's source tree omits one; US3 adds the CLI under `backend/src/cli/` and shares the REST API.
- The plan lists JavaScript/TypeScript as alternatives; tasks use JavaScript to match the existing CommonJS Node.js project and avoid a mixed-language setup.
- The data model requires a `userId` owner reference while the plan defers authentication; the initial implementation must treat this as a single-user workspace and must not imply multi-user authorization.
