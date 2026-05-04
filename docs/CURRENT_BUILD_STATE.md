# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-04

## Current Mission

Build Dynamic Travelers and station-tablet flow from real plant/product logic instead of generic department assumptions.

Current emphasis:

- Fast, stable, clickerboard-style operation.
- Operator Next Best Action is the primary Work Center Tablet operating surface.
- Digital Co-worker is a flyout, not prime page content.
- Copy Station Link supports QR/deep-link station tablet behavior.
- Department descriptions flow through a shared operating profile layer.
- Workflow buttons must not imply resolution unless the app actually resolves something.
- View/no-op workflow buttons must not mutate runtime state.
- Blocker navigation must land on visible blocker context.
- Engineering escalation, Engineering quick selection, and dashboard Quick Actions must land on Engineering when the operator asks for Engineering.
- Dashboard Quick Actions and Plant Signals are review/navigation surfaces, not hidden runtime mutation surfaces.
- Navigation contracts should be audited as route contracts, not patched with timing workarounds.
- Use current repo state before coding. Do not rely on stale chat context or old SHAs.

## Latest Confirmed Green Build

```text
Run ID: 25295784139
Commit: dad526f06dcf4b1d07b08952a138224dd27ebf12
Status: GREEN
```

Passed:

- Checkout
- Setup Node
- Install dependencies
- Build
- Upload demo build
- Record latest action run

## Most Recent Completed App Work

### Line-by-Line Audit Batch: Workflow View/No-Op Action Cleanup

Files:

```text
src/logic/workflowPanelSelectors.ts
```

PR:

```text
#19 Prevent workflow view actions from mutating state
```

Problem fixed:

- Workflow card labels such as `View Packet` flowed into the fallback `act()` handler in `WorkCenterWorkflowPanelV2.tsx`.
- The fallback handler treated unknown labels as `WORK_STARTED` and called `START_WORK`.
- This meant visibility-only actions could accidentally mutate runtime order state.

Current behavior:

- Watch-only and incoming workflow cards emit `No Action` for no-op buttons.
- Default secondary workflow buttons emit `No Action` instead of `View Packet`.
- Maintenance cards say `Open Maintenance`, not `Resolve Blocker`.
- Blocked cards say `Review blocker`.
- Material cards keep the real `Request Material` action and avoid vague secondary routing.

Guardrail:

- Visibility-only actions must remain visibility-only.
- Unknown display labels should not become runtime state mutation.
- Long-term fix should replace text-inferred workflow actions with typed workflow action IDs.

### Line-by-Line Audit Batch: Traveler Runtime and Operator Lane Cleanup

Files:

```text
src/components/travelers/TravelerDetailModal.tsx
src/logic/dynamicTraveler.ts
src/logic/workflowRuntimeState.ts
src/logic/operatorNextBestActions.ts
```

PRs:

```text
#15 Make traveler issue reporting non-destructive
#16 Clarify traveler handoff readiness actions
#17 Normalize workflow runtime status outputs
#18 Clarify empty operator lane actions
```

Current behavior:

- `Report issue on this order` records a workflow notification only.
- Reporting an issue preserves blockers and does not call `RESOLVE_BLOCKER`.
- `Record ready for handoff` records a workflow notification only and preserves order state.
- Blocked traveler instructions say `Review blocker`, not `Resolve blocker`.
- Runtime reducer outputs are normalized to uppercase `READY`, `BLOCKED`, and `RUNNABLE` where it writes new status values.
- Empty Review and Handoff lanes say `Check workflow` and route to workflow instead of sending operators to ghost anchors.

### Line-by-Line Audit Batch: Runtime and Plant Signals Cleanup

Files:

```text
src/logic/workflowActions.ts
src/logic/workflowRuntimeState.ts
src/logic/plantSignals.ts
src/components/dashboard/PlantSignalsPanel.tsx
src/logic/quickActionRuntimeExecutor.ts (deleted)
src/logic/quickActionRuntimeTargets.ts (deleted)
```

PRs:

```text
#13 Remove stale workflow action navigation retry
#14 Remove stale quick action runtime files
```

Current behavior:

- `workflowActions.ts` is an action-log module only.
- Plant Signals are review/navigation only.
- Blocked Plant Signals say `Review blocker` and route to workflow.
- Material Plant Signals say `Open material issue` and route to Receiving.
- Plant Signals no longer call a runtime mutation executor.

### Dashboard Quick Action Navigation Contract Sweep

Files:

```text
src/logic/navigationContracts.ts
src/logic/dashboardQuickActions.ts
src/pages/DashboardPage.tsx
```

PR:

```text
#12 Consolidate dashboard quick action routing
```

Current behavior:

- Dashboard Quick Actions use `NavigationIntent` instead of raw `AppTab` targets.
- Dashboard clicks resolve intents through `getNavigationTab()` in `navigationContracts.ts`.
- Engineering Quick Actions use `OPEN_ENGINEERING`, which resolves to the Engineering page.
- Blocker Quick Actions say `Review Blockers` and resolve to workflow context.
- Material Quick Actions say `Open Material Issues` and resolve to Receiving.

Important intent mappings:

```text
OPEN_ENGINEERING -> engineering
OPEN_WORKFLOW -> workflow
OPEN_RECEIVING -> receiving
OPEN_MAINTENANCE -> maintenance
OPEN_QA_SAFETY -> risk
OPEN_QA_DEPARTMENT -> qa
OPEN_ORDERS -> orders
```

### Engineering Route Fixes

PRs:

```text
#10 Update app navigation
#11 Fix Engineering quick selection route
```

Current behavior:

- Work-station card Engineering escalation opens Engineering.
- Department quick selector Engineering opens Engineering.
- Dashboard Quick Action Engineering review opens Engineering.

### Blocker Focus Card and Workflow Action Routing

PRs:

```text
#8 Fix workflow action routing
#9 Add blocker focus card
```

Current behavior:

- Generic blocker review stays in workflow context.
- Generic blocker review logs local action only.
- Generic blocker review does not open Maintenance.
- Generic blocker review does not clear blockers.
- Needs Help with a blocked/held Dynamic Traveler opens the Blocker Focus context.

## Important Repo Correction From CLAUDE.md

Use repo state over stale chat assumptions.

Known live behavior from repo:

- Phase 2 workflow engine behavior is live.
- `WorkCenterWorkflowPanelV2` is the primary station tablet card.
- Runtime workflow state exists in `workflowRuntimeState.ts`.
- `TravelerDetailModal` action buttons mutate or log runtime/workflow state.
- Sales and Engineering departments are live.
- Saddles department page is live.
- Shift Handoff page is live.
- QR station deep-links exist through `?wc=<workCenterId>`.
- Maintenance repeat offender detection is live.
- Skill gap alerts are live.

## Product Classification / Traveler Intelligence

Key files:

```text
src/types/productClassification.ts
src/data/productClassificationRules.ts
src/logic/classifyProductionOrder.ts
src/types/dynamicTraveler.ts
src/logic/dynamicTraveler.ts
```

Current behavior:

- DynamicTraveler and PlantTraveler carry classification intelligence.
- Product Intelligence appears in traveler modals and workflow cards.
- 401-404 service saddle confidence is HIGH for Receiving -> Coating -> Saddles Dept.
- 405-408 stay MEDIUM pending coating-process confirmation.
- 502 remains LOW and human-review-required.
- 412 carbon tapping sleeve rule is tightened but still MEDIUM pending outlet/coating confirmation.

Guardrail:

- Classification is a mapmaker, not dispatch authority.
- Product classification can influence route only when it does not require human review.
- RequiredDepartments still override classifier route hints.

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

- Continue line-by-line audit with dashboard panels, `orderWorkflow.ts`, `orderBlueprints.ts`, and page-level action handlers.
- Replace text-inferred workflow action dispatch with typed action IDs when feasible.
- Verify if Production role should have direct drawer access to Engineering or only escalation access.
- Review `SEND_TO_NEXT_DEPARTMENT` and `COMPLETE_ORDER` semantics. They still intentionally mutate flow state, but should be live-tested and may need stronger confirmation/copy.
- Coating is still partly uncertain.
- Couplings route relative to Coating is still uncertain.
- Clamps and Patch Clamps need more detail.
- 412/432/452 rules need confirmation before route hints become dispatch logic.
- Classifier should not overrule human review.
- Current confirmation capture is local-only and does not yet feed route-rule update workflows.
- Work Center Tablet lane drill-ins are mostly scroll/navigation; make them smarter only if operators need precise panel/item focus.

## Repo-First Operating Rule

For this chat/API workflow:

- Pull current repo files before editing.
- Use current `main` state, not old chat memory.
- Do not reuse stale blob SHAs.
- If the contents endpoint rejects a stale file SHA, use current commit/tree/blob state instead.
- Check whether the repo already contains the component, selector, data field, or fix before building it.

## Protected Rules

Preserve:

- Guidance > Control.
- Structured selections > free text.
- Selections drive logic; notes explain exceptions.
- Global command = mission visibility.
- Department views = local action.
- App.tsx routes only.
- Pages compose.
- Modules think.
- Components display.

Avoid:

- duplicate `src` folders.
- full zip overwrites.
- free-text data poisoning.
- import/path drift.
- chat context overload.
- coordination drift.
- generic department assumptions.
- fake route certainty.
- stale SHA edits.

## Next Recommended Move

Recommended next move:

```text
Continue line-by-line audit with dashboard panels, orderWorkflow.ts, and orderBlueprints.ts.
```

Use at least:

- Work-station card: Escalate to Engineering.
- Department quick selector: Engineering.
- Dashboard Quick Actions: Open Engineering Review.
- Plant Signals: Review blocker and Open material issue.
- Traveler Detail: Report issue on this order.
- Traveler Detail: Record ready for handoff.
- Operator Next Best Action: Review needed with no review target.
- Operator Next Best Action: Next handoff with no handoff target.
- Workflow card no-op/visibility actions.

Guardrails:

- No automatic route approval.
- No classifier mutation.
- No confidence increases without confirmed governance.
- Keep structured selections as the source of truth.
- Keep queue/capture visibility-first.
- Pull current repo state before coding.
