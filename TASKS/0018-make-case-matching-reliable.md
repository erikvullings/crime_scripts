# 0018 Make case matching reliable

Status: done
Priority: high
Subsystem: frontend
Depends on: none
Owner: Erik Vullings
Agent: GitHub Copilot

## Context

The `/casus` and `/case` route currently ranks scripts by summing raw token
hits. Structured selections are converted to words rather than enforced as
filters, taxonomy labels are indexed differently from narrative text, several
relevant script fields are absent from the index, and long scripts can
accumulate disproportionate scores. Mixed-language workspaces are also indexed
with the interface language's stemmer.

The matcher must support investigative hypothesis generation. It should provide
stable, explainable candidates without presenting a score as certainty or
treating a crime script as a diagnosis.

## Acceptance Criteria

- Case matching is implemented as a pure, typed helper with focused tests.
- Free-text evidence is normalized consistently with indexed content, including
  taxonomy labels and synonyms.
- Matching covers script, scene, variant, activity, condition, indicator,
  opportunity, product, geographic location, crime location, role, attribute,
  and transport content.
- Script text is normalized using the script's content language rather than only
  the interface language.
- Structured taxonomy selections are hard constraints and exact selected-ID
  matches remain distinguishable from narrative matches.
- Ranking rewards distinct evidence coverage, caps duplicate contributions, and
  does not systematically favor longer scripts.
- Results retain enough typed evidence to explain matched observations and
  relevant scenes.
- Visible-script mode and family boundaries remain respected.

## Implementation Notes

- Keep the general navigation search unchanged unless sharing a normalization
  helper is safe; this task is specifically about case-to-script matching.
- Use deterministic local matching only. Do not send operational case data to a
  backend or third-party service.
- A result's fit is descriptive, not a probability of involvement.

## Agent Notes

- 2026-09-27 GitHub Copilot: Created from the `/casus` review. Initial
  implementation should replace raw aggregate scores for case matching while
  preserving the existing full-text navigation search.
- 2026-09-27 GitHub Copilot: Added the pure typed matcher in
  `packages/gui/src/models/case-matching.ts`, wired it into the Meiosis case
  service, and retained the general navigation search separately. Matching now
  applies structured selections as required constraints, tokenizes narrative
  and taxonomy content consistently per script language, covers all relevant
  script evidence fields, caps each observation to its strongest contribution,
  normalizes scores by evidence coverage and specificity, and returns
  explainable evidence and scene locations. Added
  `packages/gui/test/case-matching.test.ts`; focused matcher/classification tests
  and GUI typecheck pass.
