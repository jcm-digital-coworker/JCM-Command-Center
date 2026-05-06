# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-06

## Current Build Status

Latest confirmed build is GREEN.

```text
Run ID: 25410617302
Commit: d2e2058765e63dd3fe4a0022198c1c61a17cc85d
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

Action-handler cleanup around workflow tablet buttons is complete.

What changed:

- PR #39 kept `BLOCKED_HERE` workflow tablet cards review-only at the selector contract.
- `src/logic/workflowPanelSelectors.ts` prevents blocked-at-this-station cards from falling through to `START_WORK` when packet status text is not exactly `BLOCKED`.
- PR #40 removed dead `safeButtonLabel()` display-layer guards from `src/components/WorkCenterWorkflowPanelV2.tsx`.
- Workflow panel button labels render directly from selector contracts.
- PR #40 did not change runtime mutation behavior.

Current decision:

```text
Workflow button behavior belongs to typed selector contracts.
Visible labels render the contract; they do not decide runtime behavior.
Review-only actions must not clear blockers or mutate production state.
```

## Current Mission

Move forward from the green action-handler cleanup.

Recommended next target:

```text
Continue the action-handler audit across dashboard, traveler, operator-lane, receiving, engineering, maintenance, and Plant Signals actions.
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
- Department order cards use the plant traveler material-action selector.
- Work Center workflow buttons use typed action contracts, not visible-label parsing.
- `BLOCKED_HERE` workflow cards are review-only.
- The dead `safeButtonLabel()` text-transform shim is removed from `WorkCenterWorkflowPanelV2.tsx`.

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
