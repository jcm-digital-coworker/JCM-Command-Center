# CLAUDE.md Pull Notes

Last updated: 2026-05-03

Purpose: keep a compact note of repo guidance pulled from `CLAUDE.md` so future work starts from the live repository instead of stale chat context.

## Pull Source

Pulled from:

```text
CLAUDE.md
```

Current version marker in file:

```text
v1.4 - Phase 2 live mutations, Saddles page, repeat offender detection, skill gaps, shift handoff, QR deep-links
```

## Important Repo Guidance To Preserve

### Start From Current Main

Every coding session must begin by checking current `main` before writing code.

Required developer flow from `CLAUDE.md`:

```bash
git fetch origin main && git log HEAD..origin/main --oneline
```

If main is ahead, pull and build before changing anything:

```bash
git pull origin main
npm run build
```

Reason:

- Main moves fast.
- A component, selector, data field, or fix may already exist.
- Do not duplicate work.
- Do not build on stale code.

### Important Current Architecture Facts

`CLAUDE.md` says Phase 2 workflow engine behavior is live.

Important live systems listed there:

- `WorkCenterWorkflowPanelV2` is the primary station tablet card.
- Runtime workflow state exists in `workflowRuntimeState.ts`.
- `TravelerDetailModal` action buttons mutate runtime workflow state.
- Sales and Engineering departments are live.
- Saddles department page is live.
- Shift Handoff page is live.
- QR deep-links for station tablets exist through `?wc=<workCenterId>`.
- Maintenance repeat offender detection is live.
- Skill gap alerts are live.

### Important Mismatch With Older Chat Context

Older chat context treated several systems as future or display-only. `CLAUDE.md` shows the repo has moved beyond that in some areas.

Do not assume:

- Station tablets are purely static.
- Workflow actions are all display-only.
- Sales and Engineering are absent.
- Saddles is only a plant-truth note.
- Shift handoff and QR station links are future work.

### Continuing Guardrails

Still preserve these laws:

- Guidance > Control.
- Structured selections > free text.
- Selections drive logic; notes explain exceptions.
- Global command = mission visibility.
- Department views = local action.
- App.tsx routes only.
- Pages compose.
- Modules think.
- Components display.

### Current Build Status Pulled During This Note

Latest green build seen while pulling repo guidance:

```text
Run ID: 25287125205
Commit: 7757dd05d91a24f73de47513ad6987305b59d696
Status: GREEN
```

That commit removed unused style helpers after the Digital Co-worker flyout change:

```text
getNextMoveStyle
getLargeTextStyle
getThreeColumnGridStyle
```

## Operational Note

For SHA/update problems, use repo state first. If the contents endpoint rejects a stale file SHA, use current `main` commit/tree/blob information rather than reusing old chat-state SHAs.
