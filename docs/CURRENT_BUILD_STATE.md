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
- Department descriptions now flow through a shared operating profile layer instead of scattered hardcoded page copies.
- Workflow action buttons must not imply resolution unless the app actually resolves something.
- Blocker navigation must land on visible blocker context, not an empty or generic support area.
- Validate live tablet use before more UI collapse, panel reordering, or route certainty.
- Use current repo state before coding. Do not rely on stale chat context or old SHAs.

## Latest Confirmed Green Build

```text
Run ID: 25292684537
Commit: 5b7caef2ec5e4886e1ad8ede8e426b3b3d339b27
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

Problem fixed:

- Operator Next Best Action previously used `Go to blocker`, then landed at the general Live Workflow panel.
- That was not precise enough because it did not visibly identify the specific blocked/held traveler.

Current behavior:

- Needs Help with a blocked/held Dynamic Traveler now says `Open blocked traveler`.
- The lane detail says it opens the Blocker Focus card in Live Workflow.
- Live Workflow now renders a `BLOCKER FOCUS` card near the top when a blocked/held traveler exists.
- The card identifies the leading blocked/held traveler by order number and current instruction.
- The card includes `Open traveler detail` for the focused traveler.
- The card explicitly says opening it does not clear the blocker, approve the route, or dispatch work.

Guardrail:

- No blocker clearing.
- No route approval.
- No dispatch behavior.
- No classifier mutation.
- No confidence increase.

### Workflow Action Routing Fix

Files:

```text
src/components/WorkCenterWorkflowPanelV2.tsx
```

PR:

```text
#8 Fix workflow action routing
```

Problem fixed:

- Generic workflow card buttons containing `Blocker` or `Lead` were treated as blocker resolution.
- The action logged `BLOCKER_RESOLUTION`, applied `RESOLVE_BLOCKER`, and opened Maintenance.
- This could make the app look like it resolved a blocker when it only navigated away.

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

Purpose:

- Stop different pages from telling different stories about the same department.
- Create one shared descriptive layer for department operating meaning.
- Keep unresolved route/coverage facts visible as unresolved instead of turning them into fake certainty.

Shared source:

```text
src/data/departmentOperatingProfiles.ts
```

Shared profile fields:

- department.
- resource label.
- open-for signal.
- truth strength: STRONG, PARTIAL, or PLACEHOLDER.
- operating summary.

Aligned consumers:

```text
src/components/dashboard/DashboardWorkCenterCard.tsx
src/components/shell/DepartmentCards.tsx
src/data/workCenters.ts
src/pages/PlantMapPage.tsx
src/data/workCenterResources.ts
src/pages/departments/DepartmentPageTools.tsx
```

What changed:

- Dashboard cards no longer carry their own hardcoded department resource labels, open-for text, or truth-strength map.
- Shell DepartmentCards now show the same shared resource label and operating summary used by Dashboard cards.
- `workCenters.ts` now uses `departmentOperatingProfiles` for primary function text.
- Stale “future/deferred” language was removed where it conflicted with current repo state.
- Plant Map now uses `plantDepartmentOrder` and shared department resource labels for section headers.
- Plant Map hero copy no longer carries its own separate department story.
- `workCenterResources.ts` now includes Sales and Engineering.
- `workCenterResources.ts` no longer implies unconfirmed certainty for Saddles, Clamps, or Patch Clamps.
- Shared department `PageShell` now displays the shared operating summary, resource label, and truth-strength badge for specialized department pages.
- Local department-page subtitle text remains as local detail under the shared profile summary instead of replacing the shared department truth.

Targeted scan results:

- No obvious leftover stale strings found for “future work center,” “deferred work center,” “future subgroups,” or old Plant Map “battlefield map” copy.
- WorkflowMobilePage appears to use department names and traveler counts rather than competing department summaries.
- ReceivingPage is workflow-specific and does not currently need profile wiring.
- App.tsx remains a route/control shell.
- Crew guidance remains decision logic, not department identity copy.
- Plant assets remain asset-level facts and are intentionally not flattened into department summaries.

### Tablet Action Console And Help Target Cleanup

Files:

```text
src/logic/operatorNextBestActions.ts
src/pages/WorkCenterDetailPage.tsx
```

Fixes:

- Needs Help caused by risk/maintenance support still targets the lower support/risk area.
- Needs Help caused by blocked/held travelers now opens visible workflow blocker context instead of lower risks or Maintenance.
- The lower risks/support panel clarifies that traveler blockers, holds, and material shortages appear in the workflow panel above.
- The confusing standalone Tablet Operating Mode strip was removed from the page.
- The current operating mode is now the action-console title.
- Digital Co-worker is centered as an inline flyout panel and contains dynamic mode/ready/help/review counts.

## Important Repo Correction From CLAUDE.md

Docs:

```text
docs/CLAUDE_PULL_NOTES.md
```

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

- Classifier outputs product line, product family, material class, size/outlet/body clues, finish hints, engineered requirement, QA requirement, route hint, ownership hint, confidence, and human review reasons.
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

## Current Durable Plant Truth

### Receiving

- Receiving stands alone.
- Fed by incoming supplies.
- Organizes material and feeds other departments.
- First material truth gate for many routes.

### Machine Shop

- Machine Shop stands alone and is fed by Receiving.
- Do not show machines that cannot run the size/type/material.
- DMG Mori: push plugs 4 inch to 24 inch; threaded plugs 4 inch to 12 inch.
- Mori Seiki: threaded and push pin spigots 4 inch to 16 inch; ANSI/Class D flanges typically 10 inch to 16 inch.
- Yama Seiki: large parts, push pin spigots 16 inch to 36 inch, flanges 14 inch to 36 inch.
- WIA KH-80: all push pin spigots go through here for drilling/tapping/threadmilling rim.
- Quickmill Intimidator: grooves flat plate burned by Material Handling.
- WIA L300C: smaller flanges, one-off work, face short pipe, some CC couplings.
- G&L mill: same groove work as Intimidator but stainless.

### Material Handling

- Material Handling is production, not support.
- Owns/influences burning, plasma, laser, rolling, saw cutting, press work, large-diameter coupling expansion, press brake work, and some coupling welding.
- Important resources include Messer burn table, Alltra plasma table, HK FS-1200 laser table, rollers, self-feeding saws, and Press Building assets.

### Fab

Fab is not one generic welding department.

Fab lanes:

- Special Fab.
- Large Body.
- Specialized Welding.
- 412 Fab.
- 432 Fab.
- 452.
- West Wing / Industrial Welders.

Known rules:

- Fab is fed by Machine Shop and Material Handling.
- Fab welds components into assemblies.
- All Fab output moves to Coating.
- 412 Fab: carbon, small body, 12 inch and under outlets.
- 432 Fab: stainless equivalent of 412-style work.
- 452: stainless, large body / large outlet, not specialized.
- West Wing: industrial-only, body/outlet/material vary.

### Coating

Coating is complex. Do not model as one bucket.

Known resources/processes:

- Wheelabrator/media prep for non-service-saddle parts.
- one-man media booths.
- two-man media booth.
- continuous shop coat paint line for saddles.
- large-part paint booth.
- enamel spray booths, count needs confirmation.
- pizza oven.
- fluidized plastic coating bed.
- passivation room with water/chemical baths.

Strong finish hints:

- 401-404 service saddles: standard shop coat primer.
- 405-408 coated saddles: fusion plastic coating.
- 502 stainless saddle: passivation.
- 412: shop coat primer, optional fusion epoxy.
- 422: standard fusion epoxy.
- 114/118: shop coat primer, optional fusion epoxy.
- 116: shop coat plus epoxy-coated pressure plate.
- 136: passivation.
- 800/820/822/823: fusion epoxy coating.
- 801/802: shop coat primer unless epoxy/stainless option.

Needs confirmation:

- whether fusion plastic coating equals pizza oven plus fluidized bed.
- which products use enamel.
- which products use continuous shop coat line vs large-part paint booth.
- which stainless products are passivated in-house.
- whether fusion epoxy is in-house, outsourced, or both.

### Assembly / Product-Line Departments

- Assembly is not one generic department.
- Special Fab -> Coating -> Special Assembly.
- 412 Fab -> Coating -> 412 Assembly.
- 432 Fab -> Coating -> 432 Assembly.
- 452 Fab -> Coating -> 452 Assembly.
- Couplings is assembly department for coupling products.
- Coupling fabrication happens in Press Building, part of Material Handling.
- Saddles assembly is integrated in Saddles Dept.
- Clamps assembly is integrated in Clamps Dept.
- Patch Clamp is stand-alone.

### Saddles

Correct saddle route:

```text
Receiving -> Coating -> Saddles Dept
```

Additional dependency:

```text
Press Building shears straps -> Saddles Dept
```

Important:

- Uncoated saddle castings are shipped in.
- Saddle castings come through Receiving.
- Uncoated saddles move from Receiving to Coating.
- Coated saddles move to Saddles Dept.
- LV4500s are in Saddles Dept, not Machine Shop.
- Do not route Saddles through Machine Shop because LV4500s are machine resources.

### QA / Shipping / Maintenance

- QA is conditional, not universal.
- QA required for engineered orders, returns, and specifically assigned cases.
- Regular production is mostly spot-check unless QA is assigned.
- Everything eventually funnels to Shipping.
- JCM runs just-in-time, so expedited orders are common.
- Maintenance is stand-alone.
- Existing maintenance request flow should become the first reliability backbone.

## Product / Reality Docs

```text
docs/JCM_WEBSITE_PRODUCT_INFRASTRUCTURE.md
docs/department-reality/COATING_PRODUCT_GUIDE_INTAKE.md
docs/department-reality/COATING_MODEL_FINISH_MATRIX.md
docs/TRAVELER_PRODUCT_CLASSIFICATION_RULE_PACK.md
docs/LOOSE_ENDS.md
docs/CLAUDE_PULL_NOTES.md
docs/WORK_CENTER_TABLET_VALIDATION.md
docs/WORK_CENTER_TABLET_VALIDATION_RESULTS.md
docs/PLANT_DEPARTMENT_REALITY_MAP.md
docs/department-reality/FAB_REALITY_MAP.md
docs/department-reality/ASSEMBLY_AND_PRODUCT_LINE_REALITY_MAP.md
docs/department-reality/SHIPPING_AND_JIT_REALITY_MAP.md
docs/department-reality/QA_REALITY_MAP.md
docs/department-reality/MAINTENANCE_REALITY_MAP.md
```

## Repo-First Operating Rule

From `CLAUDE.md`, every coding session must begin from current `main`.

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

## Active Risks

- Coating is still partly uncertain.
- Couplings route relative to Coating is still uncertain.
- Clamps and Patch Clamps need more detail.
- 412/432/452 rules need confirmation before route hints become dispatch logic.
- Classifier should not overrule human review.
- Current confirmation capture is local-only and does not yet feed route-rule update workflows.
- Work Center Tablet lane drill-ins are mostly scroll/navigation; make them smarter only if operators need precise panel/item focus.
- HELP FIRST priority may need clearer copy if departments also have ready work.
- Live validation should confirm that Blocker Focus is obvious enough and that `Open traveler detail` is understood as review/visibility only.

## Next Recommended Move

Recommended next move:

```text
Run live Work Center Tablet validation on the deployed/tablet view.
```

Why:

- The app is green on main after the Blocker Focus card.
- Needs Help for blocked/held travelers now lands on visible blocker context.
- Generic blocker review no longer pretends to resolve blockers or sends workers to Maintenance without a real maintenance-owned issue.
- Department-description drift has been centralized behind shared operating profiles.
- Remaining route uncertainty is plant-truth uncertainty, not a UI-description alignment problem.
- Lower panel collapse/reordering should still be based on live use.

Use at least:

- Machine Shop: help/blocker and ready cases.
- Assembly: mixed ready and blocked cases.
- Fab: blocker and handoff cases.
- Shipping: ready and blocked final-flow cases.
- Saddles Dept: saddle/product-review-sensitive case.

Guardrails:

- No automatic route approval.
- No classifier mutation.
- No confidence increases without confirmed governance.
- Keep structured selections as the source of truth.
- Keep queue/capture visibility-first.
- Pull current repo state before coding.
