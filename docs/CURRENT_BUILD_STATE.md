# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-08

## Current Build Status

Main is GREEN and deployed.

```text
Latest merged work: LV4500 selected-cycle estimator
Main commit: ba7b9b21ecebfa8fbcccdedcf6c5bc03af763a79
Main run: 25584980666
Branch: main
Workflow: Build
Status: GREEN
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-08T23:43:25Z
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

LV4500 selected-cycle estimator is complete, merged, built, and deployed.

What changed:

- Restored and preserved the full original LV4500 simulator surface after the simplified V2 proved insufficient.
- Added visible Thread Z-depth override support to the LV4500 simulator.
- Added measured LV4500R timing constants:
  - Rapid rate: 945 IPM
  - G28 travel: X23.400 / Z10.431
  - Indexing time: 0.2 seconds per step
- Changed the simulator from auto-demo behavior to selected-cycle estimator behavior.
- Removed operator-facing auto-sweep / step-through tap behavior from the primary flow.
- Primary action is now selected-cycle focused: choose body/casting, outlet/tap, batch target, optional Z-depth override, then run that selected cycle.
- Cycle-time results include single-cycle and batch-time visibility.
- The simulator remains read-only and does not send machine commands or mutate production runtime state.

What should be true in the live demo:

- Simulation -> LV4500R opens the full LV4500 simulator, not the stripped V2.
- Setup has casting/body, tap/outlet, batch target, and Thread Z-depth override.
- No AUTO-SWEEP TAPS button should appear in the selected-cycle flow.
- No Step -> Next Tap button should appear in the selected-cycle flow.
- RUN SELECTED CYCLE runs only the currently selected setup.
- Results show geometry and cycle time for that selected setup only.
- Batch estimate is visible from the selected batch target.

## Current Decision

```text
The LV4500 simulator is a selected-cycle estimator, not an automated tap demo.
It is used to answer: can this selected outlet/tap run in this selected body, and what is the expected single-part and batch cycle time?
Z-depth override is a simulation input only.
Cycle-time estimates are guidance, not machine command authority.
```

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

## Active Risks / Next Audit Targets

- Manually smoke test the live LV4500 selected-cycle flow:
  - choose casting/body;
  - choose outlet/tap;
  - set batch target;
  - optionally set Z-depth override;
  - click RUN SELECTED CYCLE;
  - confirm geometry, cycle time, and batch estimate update for only that selected setup.
- Coating sub-flow is still partly uncertain.
- Couplings route relative to Coating is still uncertain.
- Clamps and Patch Clamps need more detail.
- 412, 432, and 452 rules need confirmation before route hints become dispatch logic.
- Assembly lanes, QA conditions, and Shipping readiness rules need confirmation.
- Continue to prevent text-inferred action dispatch and copy that implies automatic resolution.

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
Confirm the simulator is selected-cycle only.
Confirm AUTO-SWEEP TAPS and Step -> Next Tap are gone from the selected-cycle flow.
Set Batch Target = 50.
Set a Z-depth override.
Click RUN SELECTED CYCLE.
Confirm single-cycle time, batch total, batch hours, geometry, and G76 values update for the selected setup only.
```

If smoke test passes, continue with the next small plant-truth or operator-copy pass. If it fails, fix the specific visible behavior before adding new features.
