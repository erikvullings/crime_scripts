# 0020 Compare case hypotheses

Status: in_progress
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
