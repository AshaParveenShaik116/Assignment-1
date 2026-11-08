# Part 1B Evaluation Contract

The canonical behavior and thresholds are in [spec.md](../spec.md). The machine-readable cases are
in [`Part-1B/evals/dataset.json`](../../../Part-1B/evals/dataset.json).

Each case is checked in one pipeline:

1. **Structural** — exact object keys, property types, enum values, confidence bounds, valid RFC
   3339 timestamps, and valid IANA time zones.
2. **Invariant/property** — action fields are present only for actionable intents; incomplete or
   unsupported cases remain non-actionable; reschedule/snooze targets must be supplied.
3. **Semantic/quality** — weighted comparison against case-specific expected intent, reminder
   content, timestamp, target, and clarification/refusal rubric.
4. **Aggregate** — `0.30 × structural pass rate + 0.30 × invariant pass rate + 0.40 × mean
   semantic score`. Pass requires 100% structural and invariant checks, semantic mean ≥ 0.80, and
   aggregate ≥ 0.90.

The evaluator records actual model outputs and per-layer results. It does not generate or edit the
student-authored harness log or acceptance decision.
