# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-07

## Current Build Status

Latest verified PR build is GREEN.

```text
PR: #49 Add route confidence to product families
PR head commit: 69cdb62e14fec7057ac90b13b0ad292d2ae1df9e
PR run: 25528062201
Branch: war-room/product-family-seed
Workflow: Build
Status: GREEN
```

Verified PR steps:

- Checkout
- Setup Node
- Install dependencies
- Build
- Upload demo build
- Complete job

Main merge is complete, but the post-merge main build for the merge commit was not visible at the time this file was updated.

```text
Merge commit: ee8c205a09b08d6f3a1cc973d06f973af769ac48
Main build for merge commit: UNKNOWN / pending verification
```

Do not call main green for `ee8c205a09b08d6f3a1cc973d06f973af769ac48` until a main Action run is found and verified.

## Last Completed Mission

Product-family route confidence install is complete and merged.

What changed:

- PR #49 extended `src/data/productFamilies.ts`.
- Added route-confidence metadata to the existing product-family map.
- Added `routeConfidence`, `sourceType`, `routeNote`, `likelyPlantArea`, and `needsConfirmation` fields.
- Added `findProductFamilyBySeries()` and `getProductFamilyRouteConfidence()` helpers.
- Kept product intelligence in one existing source instead of creating a duplicate map.
- PR build passed.

What did not change:

- Runtime routing did not change.
- `requiredDepartments` did not change.
- Action behavior did not change.
- No department dispatch rules were added.

## Current Decision

```text
Website/catalog/manual data can identify product families.
Plant-confirmed route knowledge is required before dispatch.
Unknown route = review prompt, not command.
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

## Durable Plant Truth Reminders

- Receiving stands alone and feeds other departments.
- Machine Shop is fed by Receiving and makes components.
- Material Handling is production, not support.
- Fab is split into lanes: Special Fab, Large Body, Specialized Welding, 412 Fab, 432 Fab, 452, West Wing.
- Fab is fed by Machine Shop and Material Handling.
- Fab output moves to Coating.
- Coating is complex and must not be modeled as one bucket.
- Assembly is lane/product specific, not one generic department.
- Saddles route is Receiving -> Coating -> Saddles Dept.
- LV4500s are in Saddles Dept, not Machine Shop.
- QA is conditional, not universal.
- Everything eventually funnels to Shipping.
- Maintenance is stand-alone.

## Active Risks / Next Audit Targets

- Verify post-merge main build for `ee8c205a09b08d6f3a1cc973d06f973af769ac48`.
- `docs/LATEST_ACTION_RUN.md` may remain stale until a main workflow records a newer run.
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

First verify the main build for the merge commit when Actions posts it.

Then continue with a display-only pass:

```text
Surface route confidence to operators as review language, without changing runtime routing.
```
