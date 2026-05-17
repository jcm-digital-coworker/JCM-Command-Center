# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

## Current Build State

Main is GREEN and deployed.

```text
Latest merged work: PR #76 demo polish pass
Main commit: b6a1bfa39ccd8e6808d355fcc7922620b5ffc2d5
Main run: 26002472352
Workflow: Build
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-17T20:55:47Z
```

## Current Truth

The app is in a guided demo-ready polish state.

Completed demo polish state:

- Seeded sales-wave demo order ship dates were refreshed so the Orders board reads as intentional demo pressure instead of stale overdue data.
- Progress drawer language now frames open route work as plant-truth validation, not unfinished wiring.
- Floating DEV controls are renamed to Pilot Tools with demo/validation wording.
- Saddles page handoff wording no longer implies all ready handoffs go to Coating.
- Progress checklist drawer now uses the `plant-truth-review` status and builds cleanly.

PR #76 source build result:

```text
Run: 26002451177
Commit: 0442c5b44c2be2a4eb4bce8d9808db5a73082710
Typecheck and build: success
```

Post-merge main result:

```text
Run: 26002472352
Commit: b6a1bfa39ccd8e6808d355fcc7922620b5ffc2d5
Typecheck and build: success
GitHub Pages deploy: success
```

## Recently Completed Work

- PR #69: LV4500 cycle-time display precision live and deployed.
- PR #70: Progress / Not Yet Live drawer checklist refreshed after LV4500 smoke test.
- PR #71: Dashboard quick-action labels clarified to match navigation behavior.
- PR #72: Department order-card navigation labels clarified.
- PR #73: Skill-gap coverage action label clarified.
- PR #74: AI worker guardrails and patch relay workflow added.
- PR #75: Current context/build-state docs refreshed after LV4500 and worker lane updates.
- PR #76: Demo polish pass merged and deployed.

## Best Demo Path

Use a guided demo instead of free-roam clicking.

Recommended path:

```text
Dashboard / Command Center
Maintenance Requests
Orders
LV4500 Simulator
Saddles Dept
Progress / Validation only if explaining roadmap
```

Strong demo surfaces:

- Maintenance request visibility and status flow.
- Orders/traveler visibility.
- Department views.
- LV4500 read-only simulator.
- Pilot Tools for controlled role/feature/simulation setup.

Demo language:

```text
The app gives guidance and visibility.
It does not replace supervisors.
It preserves uncertainty where plant truth is still being validated.
```

## Current Mission

Prepare for polished guided demo, then continue plant-truth integration only after demo-safe state is verified.

Focus after demo polish:

```text
Route validation for Coating lanes, couplings, clamps, patch clamps, 412/432/452, QA conditions, and shipping readiness.
```

## Current Decision

```text
Product classification is useful guidance, not dispatch authority.
Unconfirmed routes must stay conservative.
RequiredDepartments still override classifier route hints.
No confidence increase without confirmed plant facts.
Shipping is always last, but readiness to ship is not automatic.
QA is conditional, not universal.
Demo polish must not imply dispatch automation is complete.
```

## Known Risk Areas

- Coating is complex and must not be modeled as one bucket.
- Fab has lanes, not one generic bucket.
- Assembly is lane/product specific.
- Couplings, clamps, patch clamps, 412, 432, and 452 need route truth confirmation.
- QA conditions need explicit rules.
- Shipping readiness needs explicit completion/inspection/material conditions.
- Large files must not be full-rewritten from truncated connector output.
- Demo still needs a clean browser/localStorage reset before showing live.

## Guardrails

- Guidance > Control.
- Structured selections > free text.
- Selections drive logic; notes explain exceptions.
- Global command = mission visibility.
- Department views = local action.
- App.tsx routes only.
- Pages compose.
- Modules think.
- Components display.
- Button behavior comes from typed action contracts or selectors, not display text.
- Review copy must not imply automatic resolution.
- View/no-op actions must not mutate runtime state.
- LV4500 simulator is read-only and must not create real machine command behavior.

## Durable Plant Truth

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

## Next Recommended Move

Prepare the live demo reset and script.

Checklist:

```text
Open the deployed app in the demo browser.
Reset Maintenance Requests.
Reset plant simulation from Pilot Tools.
Set role to Management or Department Lead.
Enable desired Pilot Tools feature flags.
Smoke path: Maintenance Requests -> Orders -> LV4500 Simulator -> Saddles Dept.
Do not deep-demo Coating/clamps/412/432/452 as finalized routing.
```

After demo prep, resume plant-truth route audit before changing behavior.
