# 0017 Add generic learning mode

Status: done
Priority: high
Subsystem: frontend
Depends on: 0003, 0013
Owner: Erik Vullings
Agent: GitHub Copilot

## Context

PAX should reuse any available crime script as a dynamic, coached learning
exercise. Learners reconstruct hidden or shuffled script content, compare their
answer with the source script, and reflect on differences without treating the
source as infallible ground truth.

The first version has no trainer workflow. Exercises are generated locally from
the selected script. If no script is selected, learning mode should use the
starter library. Users may optionally restrict source selection to reviewed
scripts.

## Acceptance Criteria

- A localized learning route is available from the landing page and normal
  navigation.
- Learning mode can generate a reproducible exercise from any visible script,
  or only reviewed scripts when that filter is enabled.
- When the workspace contains no usable selected script, learning mode loads
  and uses the starter library.
- Exercises cover scene ordering, missing activities, activity roles,
  indicators, and barriers, with same-kind alternatives drawn from other
  scripts.
- Learners receive immediate coached feedback that distinguishes only
  reference matches and differences. Different answers are not labelled
  incorrect or automatically judged plausible.
- Feedback invites learners to explain differences and reveals the source
  reference and supporting context.
- Exercise generation never mutates the source model and respects script mode,
  language, and classification boundaries.
- Focused tests cover deterministic generation, candidate-pool boundaries,
  reference comparison, and starter fallback; GUI typecheck, full tests, and
  production build pass.

## Implementation Notes

- Keep generation and comparison in pure typed model helpers so they can be
  tested without rendering the UI.
- Add a dedicated route and component using the existing Mithril, Meiosis,
  Materialized, and i18n patterns.
- Treat candidates from other scripts as alternatives to consider, never as
  deliberately wrong distractors.
- Store exercise state in the route component; do not alter or persist changes
  to the crime-script workspace.

## Agent Notes

- 2026-09-26 GitHub Copilot: Task created from the agreed coached-practice
  direction. Automated feedback will report matches and differences only;
  plausibility remains a learner reflection rather than a machine judgment.
- 2026-09-26 GitHub Copilot: Implemented the localized learning route,
  landing/navigation entry points, transient starter fallback, reviewed-only
  filtering, and six dynamic exercise types in
  `packages/gui/src/components/learning-page.ts` and
  `packages/gui/src/models/learning-mode.ts`. Candidate pools stay within the
  source language and classification, source models are not mutated, and
  feedback reports reference overlap and ordering differences with a reflection
  prompt instead of correctness judgments.
- 2026-09-26 GitHub Copilot: Code review fixes invalidate an exercise as soon as
  its classified source is hidden, find role-bearing activities across the
  complete script, and restore keyboard focus after each rendered transition.
  Verified with 105 passing GUI tests (one pre-existing skip), typecheck,
  production build, desktop/mobile/dark browser checks, keyboard-focus checks,
  and the Impeccable detector.
