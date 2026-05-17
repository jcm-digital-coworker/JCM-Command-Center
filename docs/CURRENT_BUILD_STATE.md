# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-17

## Current Build Status

Main is GREEN and deployed.

```text
Latest verified deployed work: PR #82 exact held-traveler navigation
Verified commit: 1c6f427e7692c0e944b2f305f134c05d74622efb
Verified run: 26004203662
Branch: main
Workflow: Build
Status: GREEN
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-17T22:13:27Z
```

Verified deployed steps:

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

### PR #82 - Exact held-traveler navigation

Blocked/held Dynamic Travelers can now open the owning department and exact traveler/order.

What changed:

- `TravelerDetailModal` shows `GO TO HOLD DEPARTMENT - <department>` for blocked/held travelers when a matching work center exists.
- The action stores an exact target payload with order number, department, traveler id, source, and timestamp.
- The action opens the owning work center through the existing station route.
- `WorkCenterWorkflowPanelV2` consumes the target and opens the matching traveler modal by traveler id, falling back to order number.
- Existing classification-review target behavior is preserved; review capture still opens when the targeted traveler needs review.

Guardrails preserved:

```text
No blocker clearing.
No route changes.
No department advancement.
No classifier confidence changes.
No workflow runtime mutation.
No dispatch behavior change.
```

Verified:

```text
PR source run: 26004187535
PR source commit: 809ebf6a87e8f0dc10ea1e3039151487e9e9874a
Post-merge main run: 26004203662
Main commit: 1c6f427e7692c0e944b2f305f134c05d74622efb
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #80 - Context docs refresh

Current context/build-state docs were refreshed after demo polish and runbook work.

Verified:

```text
Run: 26003641341
Main commit: 01688692ad0f10f661f31b54767d469864a80152
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #78 - Guided demo runbook

`docs/DEMO_RUNBOOK.md` is merged and deployed.

What changed:

- Added pre-demo reset steps.
- Added recommended Pilot Tools feature flags.
- Added guided demo path.
- Added dashboard, maintenance, orders, LV4500 simulator, and Saddles Dept talk tracks.
- Added caution list for areas not to present as finalized routing.
- Added success criteria for the guided demo.

Verified:

```text
PR source run: 26003061324
PR source commit: 1b7027b65a713e38e81d7651cd05adfe2dd80ed1
Post-merge main run: 26003076380
Main commit: e01e975738ba7d4c85568cc6261b86e9e47fce7c
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #77 - Plant Route Review accordion

Dashboard route-review noise was reduced for demo.

What changed:

- Dashboard classification queue was renamed to Plant Route Review.
- Review details now collapse by default.
- Review / unsaved / captured badges remain visible.
- Existing checklist, traveler review cards, and Open Review Capture behavior are preserved when expanded.

Verified:

```text
PR source run: 26002747344
Main run: 26002765269
Typecheck and build: success
GitHub Pages deploy: success
```

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
Post-merge main run: 26002472352
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

Use `docs/DEMO_RUNBOOK.md` as the demo playbook.

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
Find or create a blocked/held Dynamic Traveler.
Open traveler detail.
Click GO TO HOLD DEPARTMENT.
Confirm the owning work center opens and the exact traveler/order opens automatically.
Keep Plant Route Review collapsed unless explaining route validation.
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
Repo truth beats chat memory.
GitHub Actions beats status vibes.
PR patch beats verbal summaries.
Small branches beat giant rewrites.
Risk track decides inspection depth.
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

### PR #82 smoke-test risk

CI proves compile/deploy, not full click-flow behavior. Live browser validation still needs to confirm that `GO TO HOLD DEPARTMENT` lands in the owning work center and opens the exact traveler/order.

### Large-file edit risk

`update_file` is full-file replacement, not a true line patch. For large files, follow `docs/GITHUB_OPERATIONS_PLAYBOOK.md`: search target, fetch nearby lines, fetch complete blob if needed, re-fetch edited range, review PR patch, and stop if only truncated content is available.

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
- Use the GitHub Operations Playbook risk track before every repo task.

## Next Recommended Move

Run the live demo reset and dry run.

After demo prep, resume plant-truth route audit before changing behavior.
