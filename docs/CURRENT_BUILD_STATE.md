# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-05

## Current Build Status

Latest confirmed build is GREEN.

```text
Run ID: 25408776708
Commit: efb12cd27b50b960251b01e32892341b21a30a36
Branch: main
Workflow: Build
Status: GREEN
```

Verified steps:

- Checkout
- Setup Node
- Install dependencies
- Build
- Upload demo build
- Record latest action run
- Complete job

## Last Completed Mission

Plant traveler action cleanup is complete.

What changed:

- PR #38 added explicit active plant traveler action projection logic.
- `src/logic/plantTravelerSelectors.ts` now owns active plant traveler action lookup helpers.
- Claude commit `efb12cd27b50b960251b01e32892341b21a30a36` updated `src/pages/departments/DepartmentPageTools.tsx` to import and use `getPlantTravelerMaterialAction(traveler)`.
- `DepartmentPageTools.tsx` no longer uses the old direct `traveler.actions.find((action) => action.type === 'REQUEST_MATERIAL')` lookup for material action routing.

Current decision:

```text
Actions belong to department traveler steps.
PlantTraveler.actions is only an active-step compatibility projection.
New UI code should use selectors from src/logic/plantTravelerSelectors.ts.
```

Selector helpers:

```text
getActivePlantTravelerStep
getActivePlantTravelerActions
getPlantTravelerMaterialAction
```

## Current Mission

Move forward from the green plant traveler cleanup.

Recommended next target:

```text
Sweep remaining dashboard, traveler, operator-lane, receiving, engineering, and maintenance action handlers for text-inferred behavior, accidental runtime mutation, and route/copy mismatch.
```

Use small branches and verify the latest action run after each source change.

## Stable Completed Work

- DEV toolkit is one bottom-right floating DEV button.
- DEV floater includes feature flags, role selector, department selector, and context/status access if present.
- Receiving gate page is active through a shim.
- `src/pages/ReceivingPage.ts` exports `./ReceivingGatePage`.
- `src/pages/ReceivingGatePage.tsx` contains the real gate-driven Receiving page.
- Phase 2 workflow engine behavior is live.
- Work Center Tablet flow is live.
- Operator Next Best Action is the primary station-tablet operating surface.
- Copy Station Link supports station tablet deep-link behavior.
- DynamicTraveler and PlantTraveler carry product classification intelligence.
- Product Intelligence appears in traveler modals and workflow cards.
- Classification review visibility exists in workflow and dashboard surfaces.
- Active plant traveler action projection is explicit and green.
- Department order cards now use the plant traveler material-action selector.

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
- Maintenance is stand-alone and reliability is starting from the request flow.

## Active Risks / Next Audit Targets

- Sweep remaining text-inferred action dispatch.
- Verify `SEND_TO_NEXT_DEPARTMENT` and `COMPLETE_ORDER` semantics in live tablet flow.
- Confirm Production role Engineering access rules.
- Coating is still partly uncertain.
- Couplings route relative to Coating is still uncertain.
- Clamps and Patch Clamps need more detail.
- 412, 432, and 452 rules need confirmation before route hints become dispatch logic.
- Current confirmation capture is local-only and does not yet feed route-rule update workflows.
- Work Center Tablet lane drill-ins are mostly scroll/navigation; improve only if live operators need more precise focus.
- `WorkCenterWorkflowPanelV2.tsx` is still large; extract smaller modules only after the next functional pass is stable.

## Repo-First Operating Rule

- Pull current repo files before editing.
- Use current `main`, not old chat memory.
- Do not reuse stale blob SHAs.
- Check whether the repo already contains the component, selector, data field, or fix before building it.
- When Claude is working too, keep edits small and avoid broad rewrites unless absolutely necessary.
- Verify every repo write by fetching the edited file before stacking dependent changes.
- For large files, avoid blind contents updates from truncated connector output.

## Next Recommended Move

Recommended next move:

```text
Action-handler audit pass: eliminate any remaining behavior inferred from visible labels, stale route assumptions, or copy that implies automatic resolution.
```

Start with:

- Work-station card Engineering escalation.
- Department quick selector Engineering.
- Dashboard Quick Actions.
- Plant Signals.
- Traveler Detail actions.
- Operator Next Best Action empty lane actions.
- Workflow card no-op/visibility actions.
- Dashboard command recommendation buttons.
- Generated workflow signal copy.
- Dashboard blocked/runnable counts after runtime state changes.
- Order readiness labels when `flowStatus` or blockers indicate a block.
