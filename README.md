# Assignment 1: Spec-Driven Development and Harness Engineering

This repository contains two applications for the assignment:

- **Part 1A**: the Student Exam Preparation Planner in `backend/`, `frontend/`, and
  `specs/001-task-cli-api/`.
- **Part 1B**: the Natural-Language Reminder Agent in `Part-1B/`, specified in
  `specs/002-natural-language-reminder-agent/`.

## Part 1A

The backend and frontend setup, environment variables, and manual scenarios are documented in
[`specs/001-task-cli-api/quickstart.md`](./specs/001-task-cli-api/quickstart.md).

Run the independent local harness from the repository root:

```sh
node .harness/run.js
```

It records the actual command output and pass/fail status in
`evidence/part-1a/harness-results.json`. The harness checks backend JavaScript syntax, a
source-style lint gate, a source-level security rule set, both test suites, and the frontend
production build. The lint gate checks trailing whitespace, `var` declarations, and final newlines;
the security gate applies a documented, bounded set of source-pattern rules. These checks are
automated evidence, not a substitute for the student's final human review.

## Part 1B

Read [`Part-1B/README.md`](./Part-1B/README.md) for the application, model configuration, unit
tests, and live evaluation instructions. The live evaluator requires an OpenAI-compatible endpoint
and model configured locally; credentials must never be committed.

## Student-authored deliverables

The assignment requires the student to write the harness logs and reflection answers personally.
No log entries, evaluation claims, or reflection answers are generated here. Complete the blank
templates under each part only after reviewing the actual results and deciding whether to accept
the application. The demonstration video, public repository access, and LMS upload also remain
the student's responsibility.
