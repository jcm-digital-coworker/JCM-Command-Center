# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-15

## Current Build Status

Main is GREEN and deployed.

```text
Latest merged work: LV4500 Z-depth deterministic cycle delta
Main commit: 6c104d7c36323f81b26b22495cd4ec4b3fdca98a
Main run: 25942778604
Branch: main
Workflow: Build
Status: GREEN
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-15T21:42:15Z
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

## Last Completed Mission

LV4500 timing estimator is chart-backed, boss-aware, and Z-depth responsive.

What changed:

- Loaded LV4500 time-study chart baselines for small and large boss tap-code ranges.
- Added deterministic LV4500 time-study engine under `src/logic/timeStudy/`.
- Wired `estimateLv4500CycleTime()` to the deterministic engine while preserving the existing simulator UI return shape.
- Passed selected casting `bossType` into the estimator.
- Restored displayed cycle time to use the LV4500 time-study chart baseline.
- Added deterministic Z-depth delta logic by comparing default-depth and override-depth engine results.
- Added visible estimator notes including chart baseline and `Z-depth time delta: X.X sec`.
- Preserved measured LV4500R constants:
  - Rapid rate: 945 IPM
  - G28 travel: X23.400 / Z10.431
  - Indexing time: 0.2 seconds per step
- The simulator remains read-only and does not send machine commands or mutate production runtime state.

What should be true in the live demo:

- Simulation -> LV4500R opens the full LV4500 simulator, not the stripped V2.
- Setup has casting/body, tap/outlet, batch target, and Thread Z-depth override.
- RUN SELECTED CYCLE runs only the currently selected setup.
- Results show geometry and cycle time for that selected setup only.
- Single-cycle and batch estimates use chart-backed baseline timing.
- Small and large boss choices use the correct chart baseline where available.
- Z-depth override updates timing notes with a visible second-level delta.

## Current Decision

```text
The LV4500 simulator is a selected-cycle estimator, not an automated tap demo.
Cycle-time total is anchored to the time-study chart.
Deterministic engine supplies depth delta, pass estimates, warnings, and machine-constant breakdown.
Z-depth override is a simulation input only.
Cycle-time estimates are guidance, not machine command authority.
```

## Active Risks / Next Audit Targets

### LV4500 live smoke validation

Manual smoke test is still required because CI proves compile/deploy, not visible UI behavior.

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

### LV4500 display precision

The Single Cycle tile rounds to one decimal minute. The backend now reports second-level Z-depth delta in notes, but small changes may still look unchanged on the tile.

Recommended polish:

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

`App.tsx` imports the full simulator. V2 should be deleted if unused or marked deprecated to prevent future routing confusion.

### Plant-truth gaps remain

Continue preserving uncertainty for Coating sub-flow, couplings, clamps, patch clamps, 412/432/452 rules, assembly lanes, QA conditions, and shipping readiness.

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

## Next Recommended Move

Smoke test the live demo:

```text
Open Simulation.
Open LV4500R simulator.
Set Batch Target = 50.
Choose large-boss 2-1/2 IP / code 16.
Run macro default.
Set a Z-depth override.
Click RUN SELECTED CYCLE again.
Confirm single-cycle time, batch total, batch hours, geometry, and Z-depth time delta update.
```

If smoke test passes, continue with display precision polish and duplicate V2 cleanup. If it fails, fix the specific visible behavior before adding new features.
