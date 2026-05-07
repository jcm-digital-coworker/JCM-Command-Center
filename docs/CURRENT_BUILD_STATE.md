# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-07

## Current Build Status

Main is GREEN and deployed.

```text
Latest merged PR: #50 Wire route confidence display into plant traveler
Main commit: 19b0f2e60265bee5d0ae3db23839a2e6efbf70f7
Main run: 25528506152
Branch: main
Workflow: Build
Status: GREEN
GitHub Pages deploy: success
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

Route-confidence display is complete and merged.

What changed:

- PR #49 extended `src/data/productFamilies.ts`.
- Added route-confidence metadata to the existing product-family map.
- Added `routeConfidence`, `sourceType`, `routeNote`, `likelyPlantArea`, and `needsConfirmation` fields.
- Added `findProductFamilyBySeries()` and `getProductFamilyRouteConfidence()` helpers.
- PR #50 added `routeConfidenceDisplay` and `getProductFamilyRouteConfidenceDisplay()`.
- PR #50 surfaced Route Confidence, Likely Area, route review notice, route note, and confirmation items in the Full Plant Traveler Product Intelligence panel.
- Kept product intelligence in one existing source instead of creating a duplicate map.
- Main build and Pages deploy passed.

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
Shipping is always the final physical department.
Ready for Shipping is still conditional on blockers, QA, paperwork, and order completion state.
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
- Shipping is always the final physical department.
- Maintenance is stand-alone.

## Active Risks / Next Audit Targets

- Smoke test the live demo after PR #50 deploy.
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
Open a traveler.
Open Full Plant Traveler.
Confirm Route Confidence appears in Product Intelligence.
Confirm Likely Area appears.
Confirm review copy says confirm before dispatch or handoff.
Confirm no route/action behavior changed.
```

Then continue with the next display-only pass only if the source file can be patched safely.
