# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-17

## Current Build Status

Main is GREEN and deployed.

```text
Latest merged work: PR #76 demo polish pass
Main commit: b6a1bfa39ccd8e6808d355fcc7922620b5ffc2d5
Main run: 26002472352
Branch: main
Workflow: Build
Status: GREEN
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-17T20:55:47Z
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

### PR #76 - Demo polish pass

Demo polish is merged and deployed.

What changed:

- Seeded sales-wave demo order ship dates were refreshed.
- Progress drawer route language now says plant-truth validation instead of unfinished wiring.
- Floating DEV controls were renamed to Pilot Tools with demo/validation wording.
- Saddles handoff wording no longer implies every ready handoff goes to Coating.
- Progress checklist drawer status logic was aligned with `plant-truth-review`.

Verified:

```text
PR source run: 26002451177
PR source commit: 0442c5b44c2be2a4eb4bce8d9808db5a73082710
Post-merge main run: 26002472352
Main commit: b6a1bfa39ccd8e6808d355fcc7922620b5ffc2d5
Typecheck and build: success
GitHub Pages deploy: success
```

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

Progress drawer no longer lists completed LV4500 smoke-test or precision work as unfinished.

Remaining validation item:

```text
Plant route validation: coating lanes, couplings, clamps, patch clamps, 412/432/452, QA conditions, and shipping readiness are being validated before routing guidance is expanded.
```

### PR #71-#73 - Operator action copy cleanup

Dashboard quick actions, department order-card navigation labels, and the skill-gap coverage action now use behavior-truth wording.

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

## Demo Prep State

The app is ready for a guided demo path after local browser reset.

Recommended path:

```text
Dashboard / Command Center
Maintenance Requests
Orders
LV4500 Simulator
Saddles Dept
Progress / Validation only if explaining roadmap
```

Pre-demo local reset:

```text
Open the deployed app in the demo browser.
Reset Maintenance Requests.
Reset plant simulation from Pilot Tools.
Set role to Management or Department Lead.
Enable desired Pilot Tools feature flags.
Smoke path: Maintenance Requests -> Orders -> LV4500 Simulator -> Saddles Dept.
```

Avoid deep-demoing as finalized routing:

- Coating sub-flow.
- Couplings.
- Clamps.
- Patch clamps.
- 412 / 432 / 452 routing rules.
- QA automation.
- Shipping readiness automation.

## Current Decision

```text
GitHub Actions is the source of truth for merge readiness.
Codex/Claude/Cursor-style helpers may generate patches, but main remains protected by PR review and CI.
If a helper cannot push, it must return `git show --patch --no-ext-diff HEAD` for patch relay.
Product classification is a mapmaker, not dispatch authority.
Product route confidence is not dispatch authority.
RequiredDepartments still override classifier route hints.
No confidence increase without confirmed plant facts.
Shipping is always last; readiness to ship is not automatic.
QA is conditional, not universal.
Demo polish must not imply dispatch automation is complete.
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

These should remain visible as validation until confirmed.

### Demo local-state risk

The app uses localStorage for pilot/demo state. Use one clean browser profile or reset Maintenance Requests, plant simulation, and feature flags before presenting.

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

Prepare the live demo reset and script.

After demo prep, resume plant-truth route audit before changing behavior.
