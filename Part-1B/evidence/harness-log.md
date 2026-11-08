# Part 1B Harness Log — Student Completion Required

This is a blank record template, not evidence of a live model run. Complete it personally with
actual coding-agent history, actual `eval-results.json` output, and your own final review. Do not
claim a failure, repair, score, model, or acceptance that did not occur.

## Initial generation and approved context

- Coding-agent session/date:
- Specification, plan, task, and evaluation context supplied:
- Initial-generation evidence location:

## Model configuration (no secrets)

- Provider/endpoint type:
- Model identifier:
- Run date:
- Request timeout:
- API keys or credentials are intentionally omitted.

## Evaluation threshold and scoring

- Threshold as written before execution:
- Fixed formula:

## Evaluation runs

| Run | Timestamp | Result | Structural | Invariants | Semantic mean | Aggregate | Provider/evaluation errors |
|-----|-----------|--------|------------|------------|---------------|-----------|----------------------------|
| 1 | 2026-11-08T13:35:03Z | provider_error | — | — | — | — | HTTP 429: no API credits; no evaluation scores |
| 2 | 2026-11-08T13:57:43Z | provider_error | — | — | — | — | HTTP 429: no API credits; no evaluation scores |
| 3 | 2026-11-08T14:17:27Z | FAIL | 0.7500 | 0.4375 | 0.7250 | 0.64625 | — |
| 4 | 2026-11-08T14:31:54Z | FAIL | 0.9375 | 0.6250 | 0.7250 | 0.75875 | — |
| 5 | 2026-11-08T14:35:30Z | FAIL | 1.0000 | 0.9375 | 0.809375 | 0.90500 | — |
| 6 | 2026-11-08T14:37:47Z | FAIL | 0.9375 | 0.9375 | 0.984375 | 0.95625 | — |
| 7 | 2026-11-08T14:42:13Z | FAIL | 0.9375 | 0.9375 | 0.9875 | 0.95750 | — |
| 8 | 2026-11-08T14:44:18Z | PASS | 1.0000 | 1.0000 | 0.984375 | 0.99375 | — |
| 9 | 2026-11-08T14:45:39Z | PASS | 1.0000 | 1.0000 | 0.984375 | 0.99375 | — |

## Failure evidence and repair

- Actual failed case, expected behavior, observed output, and failed layer:
- Evidence supplied to the coding agent:
- Root cause and repair:
- Re-evaluation of the same unchanged dataset and outcome:
- If no failure occurred, state that fact; do not manufacture one:

## Final human decision

- Decision (ACCEPT or REJECT):
- Reviewer and date:
- Known limitations and residual risks:
