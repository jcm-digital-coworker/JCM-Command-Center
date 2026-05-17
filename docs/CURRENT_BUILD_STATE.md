# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-17

## Current Build Status

Main is GREEN and deployed.

```text
Latest merged work: AI worker guardrails and patch relay workflow
Main commit: 41f8ef4bfecbd253514458d21385457113a8ed28
Main run: 26000843221
Branch: main
Workflow: Build
Status: GREEN
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-17T19:44:40Z
```

Verified main steps:

- Checkout
- Setup Node
- Install dependencies
- Build
- Upload demo build
- Upload Pages artifact
- Record latest action run
- Deploy GitHub Pages
- Complete jobs

## Last Completed Missions

### PR #69 - LV4500 cycle-time display precision

LV4500 simulator display now exposes small Z-depth timing changes in the active UI.

What changed:

- Single Cycle now displays `X.XX min / Y.Y sec`.
- Batch Total now displays one decimal minute.
- Batch Hours now displays two decimal hours.
- Estimator math, routing, macros, and machine command behavior were not changed.

Live result:

```text
User smoke test confirmed: Sim is working good.
```

### PR #70 - Progress checklist refresh

Progress / Not Yet Live drawer no longer lists completed LV4500 smoke-test or precision work as unfinished.

Remaining checklist item:

```text
Plant route truth gaps: coating lanes, couplings, clamps, patch clamps, 412/432/452, QA conditions, and shipping readiness still need confirmation.
```

### PR #71-#73 - Operator action copy cleanup

Dashboard quick actions, department order-card navigation labels, and the skill-gap coverage action now use behavior-truth wording.

Examples:

```text
Call Maintenance -> Open Maintenance Requests
Request Queue -> Open Request Queue
→ QA -> Open QA hold
→ ALERTS -> Open equipment alert
→ COVERAGE -> Open coverage gap
→ OPEN COVERAGE -> Open coverage plan
```

Guardrail preserved:

```text
Labels describe navigation/review context only. No runtime reducer/action mutation, route logic, or workflow behavior changed.
```

### PR #74 - AI worker guardrails and patch relay workflow

Generic AI worker lane is live.

Files added:

```text
AGENTS.md
docs/AI_WORKER_RULES.md
.github/ISSUE_TEMPLATE/agent-task.yml
```

Purpose:

```text
AI helpers must use feature branches, avoid direct main pushes, push branches when local container tests fail for environment/pre-existing reasons, and return exact patches when push/auth/proxy blocks them.
```

## Current Decision

```text
GitHub Actions is the source of truth for merge readiness.
Codex/Claude/Cursor-style helpers may generate patches, but main remains protected by PR review and CI.
If a helper cannot push, it must return `git show --patch --no-ext-diff HEAD` for patch relay.
```

## Active Risks / Next Audit Targets

### Plant-truth gaps remain

Continue preserving uncertainty for:

- Coating sub-flow.
- Couplings.
- Clamps.
- Patch clamps.
- 412 / 432 / 452 routing rules.
- Assembly lanes.
- QA conditions.
- Shipping readiness.

These should remain visible in the Progress / Not Yet Live drawer until confirmed.

### Current context drift risk

Memory docs had become stale after several green PRs. Keep repo memory short and current after mission completions.

### Large-file edit risk

`src/pages/departments/DepartmentPageTools.tsx` is large. Avoid blind full-file rewrites from truncated connector output. Use blob/full-file access, narrow seams, or patch relay.

## Guardrails Preserved

- Guidance > Control.
- Structured selections > free text.
- Selections drive logic; notes explain exceptions.
- Global command = mission visibility.
- Department views = local action.
- App.tsx routes only.
- Pages compose.
- Modules think.
- Components display.
- Button behavior must come from typed action contracts or selectors, not display text.
- Review copy must not imply automatic resolution.
- View/no-op actions must not mutate runtime state.
- Product classification is a mapmaker, not dispatch authority.
- Product route confidence is not dispatch authority.
- RequiredDepartments still override classifier route hints.
- No confidence increase without confirmed plant facts.
- Shipping is always last; readiness to ship is not automatic.
- LV4500 simulator is read-only and must not create real machine command behavior.
- AI workers must not push directly to main.

## Durable Plant Truth Reminders

- Receiving stands alone and feeds other departments.
- Machine Shop is fed by Receiving and makes components.
- Material Handling is production, not support.
- Fab is split into lanes: Special Fab, Large Body, Specialized Welding, 412 Fab, 432 Fab, 452, West Wing.
- Fab is fed by Machine Shop and Material Handling.
- Fab output moves to Coating.
- Coating is complex and must not be modeled as one bucket.
- Assembly is lane/product specific, not one generic department.
- Saddles route differs by product/coating path:
  - Plastic-coated saddles go to Coating before LV4500 tapping.
  - Other saddles go to Saddles for tapping first, then to Coating for shop-coat or enamel.
- Stainless parts do not get coated; they go to passivation or bead blast as applicable.
- LV4500s are in Saddles Dept, not Machine Shop.
- QA is conditional, not universal.
- Shipping is always the final physical department.
- Maintenance is facilities and equipment repair only.

## Repo-First Operating Rule

- Pull current repo files before editing.
- Use current `main`, not old chat memory.
- Do not reuse stale blob SHAs.
- Check whether the repo already contains the component, selector, data field, or fix before building it.
- Verify every repo write by fetching the edited file before stacking dependent changes.
- For large files, avoid blind contents updates from truncated connector output.

## Next Recommended Move

Start the plant-truth integration pass from the remaining Progress / Not Yet Live item.

Best first target:

```text
Audit product classification and route rules for couplings, clamps, patch clamps, 412, 432, 452, QA conditions, and shipping readiness.
Keep uncertain routes conservative. Do not convert classifier hints into dispatch authority without confirmed plant truth.
```
