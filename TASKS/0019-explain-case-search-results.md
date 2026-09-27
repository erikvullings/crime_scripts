# 0019 Explain case search results

Status: done
Priority: high
Subsystem: frontend
Depends on: 0018
Owner: Erik Vullings
Agent: GitHub Copilot

## Context

The case route begins with six dropdowns and a minimally labelled text field,
then exposes ordered lists with unexplained numeric scores. Analysts cannot see
which observations caused a match, which evidence remains unexplained, or
whether a result is a reviewed source. Script-level matches can appear as a
misleading scene named “Text.”

The route should become an explainable evidence-to-hypothesis workflow while
remaining fast for occasional users.

## Acceptance Criteria

- The localized route has a clear heading, concise guidance, and a visible
  local-data/privacy statement.
- Evidence entry distinguishes free-text observations from structured
  constraints and shows selected values as understandable evidence.
- Users can deliberately run and clear a case search; keyboard focus and status
  announcements make state changes clear.
- Results use responsive hypothesis cards with descriptive fit bands rather
  than unexplained raw scores.
- Each card explains matched observations, unmatched observations, and the most
  relevant scenes or activities.
- Script review status, classification, and language are visible.
- Users can open the full script or jump directly to a matched scene.
- Empty, incomplete, and no-match states explain what the user can do next.
- Dutch and English copy, dark mode, mobile layout, typecheck, tests, and the
  production build are verified.

## Implementation Notes

- Preserve PAX's current visual language and Mithril/Materialized patterns, but
  give the case workflow its own information hierarchy.
- Never label a candidate “correct,” “likely offender,” or as a probability.
- Do not persist case observations by default.

## Agent Notes

- 2026-09-27 GitHub Copilot: Depends on the typed explanations produced by
  0018; do not reconstruct reasons from rendered score strings.
- 2026-09-27 GitHub Copilot: Started after 0018 completed. The next step is to
  replace the legacy filter-and-ordered-list layout with a localized,
  non-persistent evidence form and explainable hypothesis cards.
- 2026-09-27 GitHub Copilot: Rebuilt
  `packages/gui/src/components/case-page.ts` as a deliberate local-only evidence
  workflow. It now validates input, treats structured selections as required
  characteristics, announces results, uses descriptive overlap bands, explains
  matched and unmatched observations, exposes relevant scene links, and shows
  script language, classification, and review state. Added complete English and
  Dutch copy plus responsive case styles in `packages/gui/src/css/style.css`.
  Case observations no longer live in shared Meiosis state. Verified input
  errors, clear/reset, focus restoration, desktop and 390px mobile layouts,
  zero horizontal overflow, no browser console errors, GUI typecheck, full GUI
  tests, and the production build.
