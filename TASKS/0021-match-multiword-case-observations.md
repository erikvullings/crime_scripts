# 0021 Match multiword case observations

Status: done
Priority: high
Subsystem: frontend
Depends on: 0018, 0019
Owner: Erik Vullings
Agent: GitHub Copilot

## Context

Case search currently treats every word as an independent observation. A query
such as "beschadigd containerzegel" can therefore receive credit for
"beschadigd" without matching the object, while matching only the noun is not
explained as a partial match. Multiword observations need an anchor-aware score
and transparent feedback.

## Acceptance Criteria

- Commas, semicolons, and line breaks delimit separate free-text observations.
- The final meaningful token in a multiword observation acts as its noun anchor.
- Matching the noun anchor produces a partial match when modifiers are absent.
- Matching modifiers without the noun anchor does not produce a candidate.
- Full, cohesive phrase matches rank above noun-only and disconnected matches.
- Result cards show which parts matched and which parts were not found.
- English and Dutch copy, focused tests, typecheck, full tests, and production
  build are verified.

## Implementation Notes

- Preserve single-word search and structured hard-constraint behavior.
- Do not treat missing modifiers as contradictory evidence; lower fit instead.

## Agent Notes

- 2026-09-29 GitHub Copilot: Started from user examples "beschadigd
  containerzegel" and "gehuurde bestelbus". The implementation will retain the
  noun-only candidate while lowering phrase coverage and specificity.
- 2026-09-29 GitHub Copilot: Updated
  `packages/gui/src/models/case-matching.ts` to split observations on commas,
  semicolons, and line breaks, use the final meaningful token as the anchor,
  require that anchor for retrieval, and score matched-term coverage plus
  same-context cohesion. Added matched and missing term feedback to
  `packages/gui/src/components/case-page.ts`, localized copy, and focused
  regression tests. Live checks confirmed both reported Dutch examples return
  noun-only partial matches with the modifier shown as missing, no mobile
  overflow, and no console errors. Full GUI tests, typecheck, and production
  build pass.
