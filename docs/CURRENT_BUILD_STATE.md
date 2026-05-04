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
- Blocker navigation must land on visible blocker context.
- Engineering escalation, Engineering quick selection, and dashboard Quick Actions must land on Engineering when the operator asks for Engineering.
- Dashboard Quick Actions and Plant Signals are review/navigation surfaces, not hidden runtime mutation surfaces.
- Navigation contracts should be audited as route contracts, not patched with timing workarounds.
- Use current repo state before coding. Do not rely on stale chat context or old SHAs.

## Latest Confirmed Green Build

```text
Run ID: 25294894057
Commit: da1ff121cfd91931c9bac24181092bee600c2bca
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

Problems fixed:

- `workflowActions.ts` still contained a stale Engineering navigation retry helper from an earlier temporary mitigation.
- `workflowActions.ts` mixed action logging with navigation dispatch.
- `workflowRuntimeState.ts` allowed `RESOLVE_BLOCKER` to wipe all blockers and mark the order READY.
- `TravelerDetailModal` still had a stale `REPORT_ISSUE` path that called `RESOLVE_BLOCKER`; the runtime reducer now prevents that path from clearing blockers.
- Plant Signals still used a stale quick-action runtime executor to mutate order state from dashboard prompts.
- Plant Signals used labels like `Resolve first blocker` and routed blocked signals to Orders.
- The old quick-action runtime executor and target helper carried hidden `resolve/stage/escalate first order` behavior and are now removed.

Current behavior:

- `workflowActions.ts` is an action-log module only.
- `RESOLVE_BLOCKER` is non-destructive unless a future explicit resolution workflow is designed.
- If stale UI reports an issue through `RESOLVE_BLOCKER`, blockers are preserved and the note is sanitized to `Issue reported - blocker preserved for review`.
- Plant Signals are review/navigation only.
- Blocked Plant Signals now say `Review blocker` and route to workflow.
- Material Plant Signals now say `Open material issue` and route to Receiving.
- Plant Signals no longer call a runtime mutation executor.

Guardrail:

- No hidden dashboard mutation.
- No automatic blocker clearing.
- No route approval.
- No dispatch behavior.
- No classifier mutation.
- No confidence increase.

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

Source contract:

```text
visible Quick Action label -> NavigationIntent -> navigationContracts -> AppTab
```

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

### Engineering Quick Selection Route Fix

Files:

```text
src/App.tsx
```

PR:

```text
#11 Fix Engineering quick selection route
```

Current behavior:

```text
if (nextDepartment === 'Engineering') {
  setSelectedWorkCenter(null);
  navigateTo('engineering');
  return;
}
```

Result:

- Engineering quick selection opens the Engineering page.
- Work-station card Engineering escalation opens the Engineering page.
- Dashboard Quick Action Engineering review opens the Engineering page.

### Root Engineering Route Fix

Files:

```text
src/App.tsx
```

PR:

```text
#10 Update app navigation
```

Current behavior:

```text
onOpenEngineering={() => {
  setSelectedWorkCenter(null);
  setDepartmentFilter('Engineering');
  navigateTo('engineering');
}}
```

This is the corrective root fix for the workstation-card path.

### Blocker Focus Card

Files:

```text
src/components/WorkCenterWorkflowPanelV2.tsx
src/logic/operatorNextBestActions.ts
```

PR:

```text
#9 Add blocker focus card
```

Current behavior:

- Needs Help with a blocked/held Dynamic Traveler says `Open blocked traveler`.
- Live Workflow renders a `BLOCKER FOCUS` card near the top when a blocked/held traveler exists.
- The card identifies the leading blocked/held traveler by order number and current instruction.
- The card includes `Open traveler detail`.
- The card states opening it does not clear the blocker, approve the route, or dispatch work.

### Workflow Action Routing Fix

Files:

```text
src/components/WorkCenterWorkflowPanelV2.tsx
```

PR:

```text
#8 Fix workflow action routing
```

Current behavior:

- Generic `Resolve Blocker` copy is shown as `Review blocker`.
- Generic blocker review stays in the workflow context.
- Generic blocker review logs a local workflow action only.
- Generic blocker review does not open Maintenance.
- Generic blocker review does not clear blockers.
- Generic blocker review does not change route/runtime state.
- Maintenance opens only for explicit maintenance/machine/service/repair/alarm/down/downtime actions.
- Material actions still open Receiving material request.
- Engineering/hold actions now route through the corrected App Engineering callback.

## Important Repo Correction From CLAUDE.md

`CLAUDE.md` confirms repo behavior has moved beyond some older chat assumptions:

- Phase 2 workflow engine behavior is live.
- `WorkCenterWorkflowPanelV2` is the primary station tablet card.
- Runtime workflow state exists in `workflowRuntimeState.ts`.
- `TravelerDetailModal` action buttons mutate runtime workflow state.
- Sales and Engineering departments are live.
- Saddles department page is live.
- Shift Handoff page is live.
- QR station deep-links exist through `?wc=<workCenterId>`.
- Maintenance repeat offender detection is live.
- Skill gap alerts are live.

Use repo state over stale chat assumptions.

## Classification Review / Plant Truth Work

Key files:

```text
src/components/dashboard/ClassificationReviewQueue.tsx
src/components/WorkCenterWorkflowPanelV2.tsx
src/components/travelers/ClassificationReviewCapture.tsx
src/logic/classificationReviewConfirmations.ts
src/types/classificationReview.ts
src/data/classificationReviewChecklist.ts
```

Current behavior:

- Dashboard shows a plant-wide Classification Review Queue.
- Queue can drill into matching work center review capture.
- Review targets are saved to `jcm-classification-review-target-v1`.
- Department workflow panel preselects/highlights targeted review-needed traveler.
- Review target can be cleared by the user.
- Plant Truth Checklist exposes unresolved plant-truth questions without a second confirmation system.
- Structured confirmations stay local under `jcm-classification-review-confirmations-v1`.

Guardrail:

- Review/capture work is visibility and structured confirmation only.
- It does not approve routes, mutate classifier rules, raise confidence, or dispatch work.

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

## Active Risks

- `TravelerDetailModal.tsx` still has stale wording/path naming around `REPORT_ISSUE`; runtime now protects blockers, but the UI should be refactored so reporting an issue logs/reviews rather than calling `RESOLVE_BLOCKER` at all.
- Coating is still partly uncertain.
- Couplings route relative to Coating is still uncertain.
- Clamps and Patch Clamps need more detail.
- 412/432/452 rules need confirmation before route hints become dispatch logic.
- Classifier should not overrule human review.
- Current confirmation capture is local-only and does not yet feed route-rule update workflows.
- Work Center Tablet lane drill-ins are mostly scroll/navigation; make them smarter only if operators need precise panel/item focus.
- HELP FIRST priority may need clearer copy if departments also have ready work.
- Live validation should confirm all Engineering paths land on the Engineering page: workstation card escalation, department quick selection, and Dashboard Quick Action.
- Live validation should confirm Plant Signals do not mutate runtime state and only navigate to review surfaces.
- Live validation should confirm Blocker Focus is obvious enough and `Open traveler detail` is understood as review/visibility only.

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
Continue line-by-line audit with TravelerDetailModal.tsx and dynamic traveler action generation.
```

Use at least:

- Work-station card: Escalate to Engineering.
- Department quick selector: Engineering.
- Dashboard Quick Actions: Open Engineering Review.
- Plant Signals: Review blocker and Open material issue.
- Traveler Detail: Report issue on this order.

Guardrails:

- No automatic route approval.
- No classifier mutation.
- No confidence increases without confirmed governance.
- Keep structured selections as the source of truth.
- Keep queue/capture visibility-first.
- Pull current repo state before coding.
