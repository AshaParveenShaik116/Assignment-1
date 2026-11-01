<!--
Sync Impact Report
- Version change: 0.0.0 -> 1.0.0
- Modified principles: none (initial constitution)
- Added sections: Core Principles, Additional Constraints, Development Workflow, Governance
- Removed sections: none
- Follow-up TODOs: none
-->

# Assignment-1 Constitution

## Core Principles

### I. Quality-First Delivery
Every requirement must be implemented in a way that is readable, maintainable, and verifiable. Production behavior must be the direct result of explicit requirements, not undocumented assumptions. Code changes must preserve correctness, security, and usability.

### II. Evidence-Driven Changes
All modifications must be traceable to a request, issue, or failing check. Every change must include a clear validation step, and changes without evidence of validation are incomplete. We document decisions that affect behavior or architecture.

### III. Test-First Confidence
New or changed behavior must have automated coverage before or alongside implementation. A fix is not considered complete until the relevant tests pass and the feature is verified in context. Regression tests protect existing behavior.

### IV. Secure and Maintainable Code
The codebase must avoid unsafe input handling, secret exposure, and fragile dependencies. Code must be structured for clarity and review: small functions, explicit names, narrow scope, and minimal hidden state.

### V. Simple, Understandable Design
Prefer the simplest design that satisfies the requirement. Avoid speculative abstractions, unnecessary dependencies, and duplication that obscures intent. Complexity must be justified by demonstrated need.

## Additional Constraints

- Runtime and dependency choices must be explicit, current, and compatible with the project’s Node.js and Express setup.
- Secrets, credentials, and environment-specific values must never be committed to the repository.
- User-facing behavior must fail predictably, with clear error messages and without exposing internal implementation details.
- All new features must be compatible with the project’s existing structure and must be reviewable in small, understandable increments.

## Development Workflow

- Start from the requirement or issue, identify the smallest valid change, and keep commits focused.
- Validate with the repository’s required checks before declaring work complete; if tests are absent, document the validation method and note the gap.
- Review diffs for correctness, clarity, and compliance with this constitution before merging.
- Keep documentation in sync with behavior when interfaces or workflows change.

## Governance

This constitution governs all project work. Any change to this document requires a clear rationale, a version bump, and evidence that the update preserves the project’s ability to deliver maintainable, tested software. Compliance is reviewed during code review and before merge.

Amendments must:
- describe the governance change or principle modification;
- identify impacted workflows, risks, and migration needs;
- update version and date metadata; and
- be approved by the repository owner or designated maintainer before merge.

Versioning policy: MAJOR when the meaning of a governing principle changes or backward-incompatible requirements are introduced; MINOR when a principle, rule, or workflow is added or materially expanded; PATCH for clarifications or non-semantic wording fixes. We record the effective version in this file and apply the latest rule consistently.

**Version**: 1.0.0 | **Ratified**: 2026-11-01 | **Last Amended**: 2026-11-01
