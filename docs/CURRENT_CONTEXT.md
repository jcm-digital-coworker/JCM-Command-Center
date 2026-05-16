# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

## Current Build State

Main is GREEN and deployed.

```text
Latest merged work: LV4500 Z-depth deterministic cycle delta
Main commit: 6c104d7c36323f81b26b22495cd4ec4b3fdca98a
Main run: 25942778604
Workflow: Build
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-15T21:42:15Z
```

## Last Completed Mission

LV4500 simulator timing was refreshed from selected-cycle baseline work into a chart-backed, deterministic time-study estimator.

Completed work:

- Loaded LV4500 time-study chart baselines for small and large boss tap-code ranges.
- Added deterministic LV4500 time-study engine under `src/logic/timeStudy/`.
- Wired `estimateLv4500CycleTime()` to the deterministic engine while preserving the existing simulator UI contract.
- Passed selected casting `bossType` into the estimator so small and large boss timing can use the correct baseline.
- Restored displayed cycle time to use the LV4500 chart baseline as the visible total.
- Added Z-depth delta logic that compares default-depth deterministic timing against override-depth deterministic timing.
- Added visible notes including chart baseline and `Z-depth time delta: X.X sec`.
- Preserved measured LV4500R constants:
  - Rapid rate: 945 IPM
  - G28 travel: X23.400 / Z10.431
  - Indexing time: 0.2 seconds per step
- The simulator remains read-only and does not send machine commands or mutate production runtime state.

## Current Mission

Smoke test the live LV4500 timing estimator and clean up visibility gaps.

Expected live behavior:

```text
Simulation -> LV4500R opens the full LV4500 simulator.
Setup has casting/body, tap/outlet, batch target, and Thread Z-depth override.
RUN SELECTED CYCLE runs only the currently selected setup.
Results show geometry and cycle time for that selected setup only.
Single-cycle and batch estimates use chart-backed baseline timing.
Small/large boss selection affects timing.
Z-depth override changes the cycle-time notes with a visible second-level delta.
```

## Current Decision

```text
The LV4500 simulator is a selected-cycle estimator, not an automated tap demo.
Cycle-time total is anchored to the time-study chart.
Deterministic engine supplies depth delta, pass estimates, warnings, and machine-constant breakdown.
Z-depth override is a simulation input only.
Cycle-time estimates are guidance, not machine command authority.
```

## Known Build Gaps / Follow-Up Targets

### LV4500 display precision

The backend now calculates Z-depth delta in seconds, but the Single Cycle tile still rounds to one decimal minute. Small Z changes may look unchanged in the main tile while the note shows the actual delta.

Recommended UI polish:

```text
Show Single Cycle as minutes and seconds, for example:
~2.28 min / 136.6 sec
```

### Duplicate simulator component

Both files still exist:

```text
src/components/Lv4500JcmSimulator.tsx
src/components/Lv4500JcmSimulatorV2.tsx
```

`App.tsx` imports the full simulator. V2 should be deleted if unused or clearly marked deprecated to avoid future confusion.

### Live smoke validation still required

Manual browser validation is still needed because CI proves compile/deploy, not visible behavior.

Smoke target:

```text
Open Simulation -> LV4500R.
Choose large boss casting.
Choose 2-1/2 IP / code 16.
Run with macro default.
Record single-cycle time and Z-depth delta note.
Set deeper Z override.
Run again.
Confirm single-cycle time, batch total, and Z-depth delta note update.
```

## Stable Completed Work

- PR #48 landed Machine Shop department page, English/Spanish MVP, shell i18n, theme cohesion, and LV4500 simulation Level 2.
- PR #49 landed route confidence metadata for product families.
- PR #50 landed route confidence display in Full Plant Traveler.
- PR #55 added LV4500R depth/travel simulator constants.
- PR #57 restored the full LV4500 simulator and added visible Z-depth override to the original surface.
- PR #58 converted LV4500 behavior away from tap auto-demo and toward selected-cycle estimation.
- PR #61 loaded LV4500 time-study cycle baselines.
- PR #62 added deterministic LV4500 time-study engine.
- PR #63 wired LV4500 estimator backend to the deterministic engine.
- PR #65 made visible LV4500 cycle time use chart baseline.
- PR #66 made Z-depth override affect displayed cycle time via deterministic depth delta.
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

Manual smoke test the live LV4500 timing estimator:

```text
Open Simulation.
Open LV4500R simulator.
Set Batch Target = 50.
Choose a large-boss 2-1/2 IP / code 16 setup.
Run macro default.
Set a Z-depth override.
Click RUN SELECTED CYCLE again.
Confirm single-cycle time, batch total, batch hours, geometry, and Z-depth time delta update.
```

If smoke test passes, polish display precision and retire/deprecate `Lv4500JcmSimulatorV2`. If smoke test fails, fix the specific visible behavior before adding new features.
