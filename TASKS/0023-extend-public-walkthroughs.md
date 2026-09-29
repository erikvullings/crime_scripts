# 0023 Extend public walkthroughs

Status: open
Priority: medium
Subsystem: documentation
Depends on: 0022
Owner: Erik Vullings
Agent: GitHub Copilot

## Context

The Dutch and English public walkthrough videos currently cover the menu,
script viewing/editing, and LLM-assisted creation. They should also introduce
the case-analysis and learning tools using public starter content.

## Acceptance Criteria

- Dutch and English walkthroughs include a case-analysis slide showing
  explainable full/partial evidence matching.
- Dutch and English walkthroughs include a learning-mode slide unless that
  capability is already visibly covered.
- Captions, in-app seekable guide steps, written guides, and media-production
  instructions remain synchronized with the extended timeline.
- Captures contain only public starter content and no personal or restricted
  information.
- Both WebM files are regenerated and validated with `ffprobe`.
- In-app Dutch and English guide routes are browser-verified.

## Implementation Notes

- Reuse the established 1440x900 light-theme capture style.
- Keep the additions concise so the walkthrough remains useful as an overview.

## Agent Notes

- 2026-09-29 GitHub Copilot: Created as a separate sequential task because the
  case-analysis capture depends on the finalized 0022 UI and starter content.
