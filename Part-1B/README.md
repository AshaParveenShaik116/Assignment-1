# Part 1B: Natural-Language Reminder Agent

This application parses one reminder request into a validated structured response. It does not
save reminders, notify anyone, or call calendar tools. The approved requirements, output schema,
invariants, rubric, and evaluation thresholds are in
[`../specs/002-natural-language-reminder-agent/spec.md`](../specs/002-natural-language-reminder-agent/spec.md).

## Requirements

- Node.js 20 or newer with built-in `fetch`
- An OpenAI-compatible chat-completions endpoint and model for a **live** evaluation
- API credentials must remain local and must not be committed or pasted into chat

## Configure the model locally

Copy `.env.example` to `.env` and set `AI_MODEL`, `AI_BASE_URL`, and `AI_API_KEY` for the
provider. The application does not load dotenv automatically; in PowerShell, set the environment
variables in the current terminal before running the live evaluation:

```powershell
$env:AI_BASE_URL = "https://api.openai.com/v1"
$env:AI_MODEL = "your-model-name"
$env:AI_API_KEY = "your-local-key"
npm run eval
```

For an OpenAI-compatible local server, use its local base URL. A key, if used, is sent only to that
configured server. Non-loopback HTTP endpoints with credentials are rejected. The request timeout
defaults to 30 seconds; `AI_REQUEST_TIMEOUT_MS` accepts values from 1,000 through 120,000 ms.

## Run offline harness tests

```sh
npm test
npm run harness
```

The tests cover contract validation, dates and zones, non-actionable outcomes, target restrictions,
confidence, the fixed scoring formula, dataset breadth, and provider error handling. They do not
call an AI model and must not be represented as live evaluation results.

## Run the live evaluation

After configuring a model, run:

```sh
npm run eval
```

The runner processes all 16 fixed cases sequentially and appends actual outputs, provider errors,
per-layer evidence, and aggregate metrics to `evidence/eval-results.json`. A run can report
`PASS`, `FAIL`, `provider_error`, `configuration_error`, or `runner_error`. The gate requires every
case to pass structural and invariant checks, a semantic mean of at least 0.80, and an aggregate
score of at least 0.90. Do not edit the dataset, thresholds, or results to obtain a pass.

See [.harness/README.md](.harness/README.md) for the pipeline details. Complete
[evidence/harness-log.md](evidence/harness-log.md) using your actual run and agent history and
record your own final human decision. This scaffold intentionally does not write an acceptance
claim for you.

## Known limitations

- Results depend on the configured model/provider and may vary between runs.
- The fixed dataset evaluates common date phrases and safety boundaries, not all locales,
  languages, daylight-saving transitions, or adversarial inputs.
- No reminder is persisted or externally acted upon; a human must inspect results before use.
