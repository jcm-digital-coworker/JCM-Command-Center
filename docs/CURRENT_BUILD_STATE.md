# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-03

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
- Engineering escalation must land on Engineering, not Orders/Production.
- Navigation contracts need live validation because some callbacks still live in the large App shell.
- Use current repo state before coding. Do not rely on stale chat context or old SHAs.

## Latest Confirmed Green Build

```text
Run ID: 25292994170
Commit: 23cf3a02c057f8601411b36ae4c834ac96a088bd
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

### Navigation Exterminator Pass: Engineering Escalation

Files:

```text
src/logic/workflowActions.ts
```

Problem found:

- The root `App.tsx` work-center callback for `onOpenEngineering` still points at `navigateTo('orders')`.
- That means `Escalate to Engineering` can land on the Orders/Production-style page instead of the Engineering page.
- A first-pass single navigation event was not strong enough because the existing callback could still win the state race.

Current mitigation:

- `ENGINEERING_ESCALATION` now routes to Engineering more than once shortly after the action is logged.
- This is intended to reassert the Engineering destination after the work-center tablet closes.
- Latest build for this mitigation is green.

Important remaining root-wire task:

```text
Replace the `App.tsx` work-center `onOpenEngineering` callback destination from `orders` to `engineering` when the large App shell can be safely patched.
```

Known current root snippet to fix:

```text
onOpenEngineering={() => {
  setSelectedWorkCenter(null);
  navigateTo('orders');
}}
```

Target behavior:

```text
onOpenEngineering={() => {
  setSelectedWorkCenter(null);
  setDepartmentFilter('Engineering');
  navigateTo('engineering');
}}
```

Guardrail:

- No route approval.
- No dispatch behavior.
- No classifier mutation.
- No confidence increase.
- Engineering escalation remains a visibility/escalation handoff, not an automatic resolution.

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
- Engineering/hold actions still open Engineering escalation.

### Department Truth Alignment Audit

Shared source:

```text
src/data/departmentOperatingProfiles.ts
```

Aligned consumers:

```text
src/components/dashboard/DashboardWorkCenterCard.tsx
src/components/shell/DepartmentCards.tsx
src/data/workCenters.ts
src/pages/PlantMapPage.tsx
src/data/workCenterResources.ts
src/pages/departments/DepartmentPageTools.tsx
```

Current behavior:

- Dashboard cards, shell DepartmentCards, work-center data, Plant Map, resource questions, and department-page shell use shared department operating profiles.
- Sales and Engineering exist as live department views.
- Stale/fake-future department wording was removed from the obvious source layer.
- Unresolved routes remain unresolved, not promoted to certainty.

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

- The direct `App.tsx` Engineering callback still needs root-wire correction when the large file can be patched safely.
- Coating is still partly uncertain.
- Couplings route relative to Coating is still uncertain.
- Clamps and Patch Clamps need more detail.
- 412/432/452 rules need confirmation before route hints become dispatch logic.
- Classifier should not overrule human review.
- Current confirmation capture is local-only and does not yet feed route-rule update workflows.
- Work Center Tablet lane drill-ins are mostly scroll/navigation; make them smarter only if operators need precise panel/item focus.
- HELP FIRST priority may need clearer copy if departments also have ready work.
- Live validation should confirm Engineering escalation lands on the Engineering page and not Orders/Production after the reassertion patch.
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
Live-test the Engineering escalation again after redeploy/refresh. If it still lands on Orders/Production, patch the App.tsx root callback directly before any more UI work.
```

Use at least:

- Machine Shop: help/blocker and engineering escalation cases.
- Assembly: mixed ready and blocked cases.
- Fab: blocker, engineering escalation, and handoff cases.
- Shipping: ready and blocked final-flow cases.
- Saddles Dept: saddle/product-review-sensitive case.

Guardrails:

- No automatic route approval.
- No classifier mutation.
- No confidence increases without confirmed governance.
- Keep structured selections as the source of truth.
- Keep queue/capture visibility-first.
- Pull current repo state before coding.
