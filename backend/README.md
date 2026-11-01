# Smart Todo Backend

## Setup

Copy `.env.example` to `.env`, set `MONGO_URI`, then run:

```sh
npm install
npm run dev
```

The service validates requests and responses against the canonical OpenAPI document at
`../specs/001-task-cli-api/contracts/openapi.yaml`. The API listens on port 4000 by
default under `/api/tasks`.

## CLI

With the API running, use `npm run task -- <command>`:

```sh
npm run task -- add "Prepare release" --priority high --due-date 2026-11-10
npm run task -- list --status pending
npm run task -- show <task-id>
npm run task -- update <task-id> --title "Final release plan"
npm run task -- complete <task-id>
npm run task -- archive <task-id>
```

Set `TASK_API_URL` to override the default API base URL.
