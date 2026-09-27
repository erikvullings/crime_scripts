# 0020 Compare case hypotheses

Status: done
Priority: medium
Subsystem: frontend
Depends on: 0019
Owner: Erik Vullings
Agent: GitHub Copilot

## Context

A ranked list alone encourages anchoring on the first result. Analysts need to
compare plausible alternatives and identify observations that would distinguish
them. Follow-up prompts should come from the scripts' indicators and conditions,
but must be framed as questions to investigate rather than inferred facts.

## Acceptance Criteria

- Users can select two or three suggested scripts for side-by-side comparison.
- Comparison shows shared matches, distinguishing matches, unexplained evidence,
  and relevant scenes without exposing raw internal score arithmetic.
- The UI proposes a bounded set of discriminating follow-up questions derived
  from candidate indicators and conditions.
- Prompts are explicitly labelled as things to verify, not known facts or
  investigative instructions.
- Users can keep transient notes explaining why a hypothesis was retained or
  rejected; notes are not written into the crime-script model or persisted.
- Comparison remains usable with one result, tied results, missing descriptions,
  and long labels.
- Dutch and English copy, keyboard use, mobile layout, tests, typecheck, and
  production build are verified.

## Implementation Notes

- Prefer high-information differences between candidates and deduplicate
  normalized labels.
- Keep the first version deterministic and local; no generative model is needed.
- Limit the default comparison to the top three candidates to reduce cognitive
  load.

## Agent Notes

- 2026-09-27 GitHub Copilot: Created as the final stage so comparison and
  follow-up prompts consume the trusted results and explanations from 0018 and
  0019.
- 2026-09-27 GitHub Copilot: Started after 0019 completed. Comparison will use
  the existing typed evidence matches directly rather than recomputing or
  interpreting rendered UI labels.
- 2026-09-27 GitHub Copilot: Added the pure `compareCaseHypotheses` helper in
  `packages/gui/src/models/case-matching.ts` with focused tests in
  `packages/gui/test/case-comparison.test.ts`. The case route now lets users
  select up to three hypotheses, compares shared, distinguishing, unexplained,
  and scene evidence without scores, and generates at most five deterministic,
  deduplicated, candidate-balanced verification questions from indicators and
  conditions. Analyst notes are held only in the component and are cleared with
  the case. Added complete English/Dutch copy and responsive comparison styles.
  Verified one-result handling, two- and three-hypothesis layouts, focus,
  transient notes, long prompts, desktop and 390px mobile width, no console
  errors, no horizontal overflow, the final Impeccable detector, full GUI
  tests, typecheck, and production build.
