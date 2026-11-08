# AI SDLC Assignment 1

Two applications built using a spec-driven development workflow:

1. **Part 1A — Student Exam Preparation Planner:** a web dashboard, REST API, and CLI for managing study plans.
2. **Part 1B — Natural-Language Reminder Agent:** an AI-backed parser that turns a reminder request into validated structured data.

The project includes feature specifications, contracts, tests, and harness evidence. See the [specifications](./specs/) for requirements and design details.

## Repository layout

```text
backend/                 Part 1A Express API, CLI, and tests
frontend/                Part 1A React/Vite dashboard
Part-1B/                 Part 1B reminder agent, evaluator, and tests
specs/                   Feature specifications, plans, contracts, and tasks
.harness/                Part 1A repository-level validation harness
evidence/
  part-1a/               Part 1A harness results and student log
Part-1B/evidence/         Part 1B model evaluation results and student log
```

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB for running Part 1A locally
- An OpenAI-compatible chat-completions provider and API key for Part 1B live evaluation

Install dependencies separately in the backend and frontend directories:

```powershell
cd backend
npm install

cd ../frontend
npm install
```

## Part 1A — Exam Preparation Planner

The planner lets students create, edit, filter, search, complete, and archive study plans. The same core operations are available through the web app, REST API, and command-line interface.

### Configure and run

1. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` if needed.
2. Optionally copy `frontend/.env.example` to `frontend/.env` to change the API URL.
3. Start MongoDB.
4. In separate terminals, start the backend and frontend:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

The API listens on `http://localhost:4000` by default, and Vite prints the local frontend URL. See the [Part 1A quickstart](./specs/001-task-cli-api/quickstart.md) for detailed setup and manual test scenarios.

### CLI example

With the backend running:

```powershell
cd backend
npm run task -- add "Revise cell structure" --subject Biology --study-date 2026-11-08 --due-date 2026-11-10 --notes "Bring flashcards"
npm run task -- list --status pending
```

### Tests and harness

```powershell
cd backend
npm test

cd ../frontend
npm test

cd ..
node .harness/run.js
```

The repository harness records syntax, lint, static security, test, and production-build results in [`evidence/part-1a/harness-results.json`](./evidence/part-1a/harness-results.json). Its companion [`harness-log.md`](./evidence/part-1a/harness-log.md) is a student-authored record and final review.

## Part 1B — Natural-Language Reminder Agent

The agent parses a request into an intent and reminder fields, then validates the model response against a strict schema and safety invariants. It does **not** save reminders, send notifications, or call calendar tools.

### Run offline tests

```powershell
cd Part-1B
npm test
```

### Configure and run a live evaluation

Create `Part-1B/.env` locally (do not commit it) with your provider settings:

```dotenv
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=your-model-name
AI_API_KEY=your-local-key
```

Then run the evaluation from `Part-1B`:

```powershell
node --env-file=.env src/evalRunner.js
```

The evaluator runs the fixed dataset and appends generated outputs, per-case results, and aggregate metrics to [`Part-1B/evidence/eval-results.json`](./Part-1B/evidence/eval-results.json). The recorded latest run passed 16 cases with structural and invariant pass rates of 1.0, semantic mean 0.984375, and aggregate score 0.99375. Model results can vary between runs.

See the [Part 1B README](./Part-1B/README.md) and [evaluation contract](./specs/002-natural-language-reminder-agent/contracts/evaluation.md) for configuration, scoring, and known limitations. The [`harness-log.md`](./Part-1B/evidence/harness-log.md) contains run history; the student is responsible for the final human decision.

## Specifications and evidence

- [Part 1A specification](./specs/001-task-cli-api/spec.md)
- [Part 1A API contract](./specs/001-task-cli-api/contracts/openapi.yaml)
- [Part 1B specification](./specs/002-natural-language-reminder-agent/spec.md)
- [Part 1B evaluation dataset](./Part-1B/evals/dataset.json)

Do not commit API keys, credentials, or local `.env` files. Automated tests and model evaluation are evidence for review, not a substitute for human acceptance and assignment-specific submission requirements.
