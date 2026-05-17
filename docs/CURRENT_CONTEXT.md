# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

## Current Build State

Main is GREEN and deployed.

```text
Latest merged work: AI worker guardrails and patch relay workflow
Main commit: 41f8ef4bfecbd253514458d21385457113a8ed28
Main run: 26000843221
Workflow: Build
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-17T19:44:40Z
```

## Current Truth

The LV4500 simulator timing loop is now live-smoke-confirmed by the user.

Completed LV4500 state:

- Active simulator is the full LV4500 simulator, not the stripped V2 route.
- Cycle-time estimator is chart-backed, boss-aware, and Z-depth responsive.
- Z-depth override is a simulation input only.
- Results expose second-level timing deltas in the visible UI.
- Single Cycle displays `X.XX min / Y.Y sec`.
- Batch Total displays one decimal minute.
- Batch Hours displays two decimal hours.
- Simulator remains read-only and does not send machine commands or mutate production runtime state.

User smoke result:

```text
Sim is working good.
```

## Recently Completed Work

- PR #69: LV4500 cycle-time display precision live and deployed.
- PR #70: Progress / Not Yet Live drawer checklist refreshed after LV4500 smoke test.
- PR #71: Dashboard quick-action labels clarified to match navigation behavior.
- PR #72: Department order-card navigation labels clarified.
- PR #73: Skill-gap coverage action label clarified.
- PR #74: AI worker guardrails and patch relay workflow added.

## AI Worker Lane

Generic worker rules are now in repo:

```text
AGENTS.md
docs/AI_WORKER_RULES.md
.github/ISSUE_TEMPLATE/agent-task.yml
```

Operating rule:

```text
Do not push directly to main.
Use feature branches.
Open PRs.
Run npm run build when available.
If local build fails for environment or pre-existing reasons, push the branch anyway with notes.
If push/auth/proxy fails, return exact patch output using git show --patch --no-ext-diff HEAD.
GitHub Actions remains the merge judge.
```

## Current Mission

Begin the plant-truth integration pass from the remaining drawer checklist item.

Focus:

```text
Route truth gaps for Coating lanes, couplings, clamps, patch clamps, 412/432/452, QA conditions, and shipping readiness.
```

## Current Decision

```text
Product classification is useful guidance, not dispatch authority.
Unconfirmed routes must stay conservative.
RequiredDepartments still override classifier route hints.
No confidence increase without confirmed plant facts.
Shipping is always last, but readiness to ship is not automatic.
QA is conditional, not universal.
```

## Known Risk Areas

- Coating is complex and must not be modeled as one bucket.
- Fab has lanes, not one generic bucket.
- Assembly is lane/product specific.
- Couplings, clamps, patch clamps, 412, 432, and 452 need route truth confirmation.
- QA conditions need explicit rules.
- Shipping readiness needs explicit completion/inspection/material conditions.
- Large files must not be full-rewritten from truncated connector output.

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

Audit current product classification and route-rule files before changing behavior.

Search targets:

```text
classification
productFamily
requiredDepartments
route confidence
shipping readiness
QA hold
412
432
452
coupling
clamp
patch clamp
coating
```

Success for the next pass:

```text
Identify existing route-rule seams.
Do not modify dispatch behavior until current logic is understood.
If patching, keep it conservative and small.
```