# Part 1B Evaluation Harness

The single evaluation pipeline is implemented in `../src/evalRunner.js`:

1. Load and validate the fixed dataset.
2. Call the configured model sequentially, without tool definitions.
3. Validate output structure and specification-derived invariants.
4. Score semantic rubric checks without exact response-string matching.
5. Apply the fixed thresholds from the feature specification.
6. Append actual model outputs, per-layer evidence, non-secret configuration, and metrics to
   `../evidence/eval-results.json`.

Run `npm run eval` from `Part-1B/`. Provider/configuration failures are recorded distinctly from
invalid model outputs and evaluation failures. No credentials or response authorization headers
are written to the result artifact.

Run `npm test` for deterministic offline tests. Those tests are not model-evaluation evidence.
