# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

## Current Build State

Main is GREEN and deployed.

```text
Latest merged work: LV4500 selected-cycle estimator
Main commit: ba7b9b21ecebfa8fbcccdedcf6c5bc03af763a79
Main run: 25584980666
Workflow: Build
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-08T23:43:25Z
```

## Last Completed Mission

LV4500 selected-cycle estimator is complete, merged, built, and deployed.

Completed work:

- Restored and preserved the full original LV4500 simulator surface after the simplified V2 proved insufficient.
- Added visible Thread Z-depth override support to the LV4500 simulator.
- Added measured LV4500R timing constants:
  - Rapid rate: 945 IPM
  - G28 travel: X23.400 / Z10.431
  - Indexing time: 0.2 seconds per step
- Changed the simulator from auto-demo behavior to selected-cycle estimator behavior.
- Removed operator-facing auto-sweep / step-through tap behavior from the selected-cycle flow.
- Primary action is selected-cycle focused: choose body/casting, outlet/tap, batch target, optional Z-depth override, then run that selected cycle.
- Cycle-time results include single-cycle and batch-time visibility.
- The simulator remains read-only and does not send machine commands or mutate production runtime state.

## Current Mission

Smoke test the live LV4500 selected-cycle estimator.

Expected live behavior:

```text
Simulation -> LV4500R opens the full LV4500 simulator.
Setup has casting/body, tap/outlet, batch target, and Thread Z-depth override.
No AUTO-SWEEP TAPS button appears in selected-cycle flow.
No Step -> Next Tap button appears in selected-cycle flow.
RUN SELECTED CYCLE runs only the currently selected setup.
Results show geometry and cycle time for that selected setup only.
Batch estimate is visible from the selected batch target.
```

## Current Decision

```text
The LV4500 simulator is a selected-cycle estimator, not an automated tap demo.
It is used to answer: can this selected outlet/tap run in this selected body, and what is the expected single-part and batch cycle time?
Z-depth override is a simulation input only.
Cycle-time estimates are guidance, not machine command authority.
```

## Stable Completed Work

- PR #48 landed Machine Shop department page, English/Spanish MVP, shell i18n, theme cohesion, and LV4500 simulation Level 2.
- PR #49 landed route confidence metadata for product families.
- PR #50 landed route confidence display in Full Plant Traveler.
- PR #55 added LV4500R depth/travel simulator constants.
- PR #57 restored the full LV4500 simulator and added visible Z-depth override to the original surface.
- Latest selected-cycle work on main converted LV4500 behavior away from tap auto-demo and toward selected-cycle estimation.
- DEV toolkit is one bottom-right floating DEV button and is available on work-center detail pages.
- Work Center workflow buttons use typed action contracts, not visible-label parsing.
- `BLOCKED_HERE` workflow cards are review-only.
- Product Intelligence appears in traveler modals and workflow cards.
- Classification review visibility exists in workflow and dashboard surfaces.
- Department order cards use the plant traveler material-action selector.

## Product Route Confidence Rules

Product-family data may support:

- product category display;
- model-family grouping;
- likely area hints;
- review prompts;
- route-confidence badges.

Product-family data must not:

- override `requiredDepartments`;
- silently change current or next department;
- mark QA universal;
- mark Coating required without confirmation;
- dispatch work from public catalog category alone;
- mark an order ready for Shipping just because Shipping is the final department.

## Known Route / Plant Truth Areas

Confirmed / stronger:

- Receiving stands alone and feeds other departments.
- Machine Shop is fed by Receiving and makes components.
- Material Handling is production, not support.
- Saddles route differs by product/coating path:
  - Plastic-coated saddles go to Coating before LV4500 tapping.
  - Other saddles go to Saddles for tapping first, then to Coating for shop-coat or enamel.
- Stainless parts do not get coated; they go to passivation or bead blast as applicable.
- LV4500s are in Saddles Dept, not Machine Shop.
- Shipping is always the final physical department.
- Maintenance is facilities and equipment repair only.

Needs review before dispatch:

- Coating sub-flow.
- Couplings route relative to Coating.
- Clamps ownership and variants.
- Patch Clamps ownership and variants.
- 412 Fab ownership and exceptions.
- 432 Fab ownership and exceptions.
- What 452 means internally.
- Assembly lane ownership.
- QA conditions.
- Shipping readiness rules.

## Protected Shared Files

- `src/App.tsx`
- `src/components/shell/AppDrawer.tsx`
- `src/components/shell/AppHeader.tsx`
- `src/components/shell/DevToolkitFlyout.tsx`
- `src/components/Lv4500JcmSimulator.tsx` is large; avoid blind contents updates from truncated connector output.

## Core Rules

- Guidance > Control.
- Structured selections > free text.
- Selections drive logic; notes explain exceptions.
- Global command = mission visibility.
- Department views = local action.
- App.tsx routes only.
- Pages compose.
- Modules think.
- Components display.
- Runtime behavior must come from typed contracts or selectors, not display text.
- Review-only actions must not clear blockers or mutate production state.
- Product classification is a mapmaker, not dispatch authority.
- RequiredDepartments override classifier route hints.
- No route-confidence increase without confirmed plant facts.
- Shipping is always last; readiness to ship is not automatic.
- LV4500 simulator is read-only and must not create real machine command behavior.

## Next Recommended Move

Manual smoke test the live demo:

```text
Open Simulation.
Open LV4500R simulator.
Confirm the simulator is selected-cycle only.
Confirm AUTO-SWEEP TAPS and Step -> Next Tap are gone from the selected-cycle flow.
Set Batch Target = 50.
Set a Z-depth override.
Click RUN SELECTED CYCLE.
Confirm single-cycle time, batch total, batch hours, geometry, and G76 values update for the selected setup only.
```

If smoke test passes, continue with the next small plant-truth or operator-copy pass. If it fails, fix the specific visible behavior before adding new features.
