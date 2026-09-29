# 0022 Clarify case match completeness

Status: done
Priority: high
Subsystem: frontend
Depends on: 0021
Owner: Erik Vullings
Agent: GitHub Copilot

## Context

The case page now supports noun-anchored partial observations, but the Dutch
starter library does not contain the exact example phrases
"haventoegangspas" and "beschadigd containerzegel". Result cards also need an
explicit full/partial label and should not render an empty "unmatched evidence"
section when every observation is fully matched.

## Acceptance Criteria

- The Dutch cocaine-import starter script recognizes "haventoegangspas" in its
  access indicator and "beschadigd containerzegel" in its seal indicator.
- Existing source-grounded indicators are refined rather than duplicated.
- Every matched observation is explicitly labelled as a full or partial match.
- Partial matches show matched and missing terms.
- The unmatched-evidence section is absent when no complete observation is
  unmatched.
- Dutch and English copy, starter-content tests, matcher tests, browser
  behavior, typecheck, full tests, and production build are verified.

## Implementation Notes

- Preserve the existing caution that an indicator is not proof by itself.
- Keep the canonical starter bundle and deployed copy synchronized through the
  production build.

## Agent Notes

- 2026-09-29 GitHub Copilot: Started after 0021. Existing harbor indicators
  already cover access-pass misuse and broken seals, so the requested wording
  will refine those labels without adding unsupported process claims.
- 2026-09-29 GitHub Copilot: Refined the existing Dutch and English indicator
  wording, added an integration regression for the requested Dutch phrases,
  labelled full and partial matches explicitly, and removed the empty
  unmatched-evidence section. Verified focused and full GUI tests, typecheck,
  production build, and Dutch desktop/mobile browser behavior.
