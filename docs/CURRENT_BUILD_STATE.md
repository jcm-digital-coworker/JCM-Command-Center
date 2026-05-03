# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-03

## Current Mission

Build Dynamic Travelers and station-tablet flow from real plant/product logic instead of generic department assumptions.

Current emphasis:

- Fast, stable, clickerboard-style operation.
- Department cards explain why to open an area.
- Work Center Tablet explains what local action deserves attention first.
- Operator Next Best Action is the primary tablet operating surface.
- Digital Co-worker information is now a flyout, not prime page content.
- Copy Station Link supports QR/deep-link station tablet behavior.
- Use current repo state before coding. Do not rely on stale chat context or old SHAs.

## Latest Confirmed Green Build

```text
Run ID: 25289205624
Commit: d5d73b2da8c4f243639764001d65a5dcfe03e8f5
Status: GREEN
```

Passed:

- Checkout
- Setup Node
- Install dependencies
- Build
- Upload demo build
- Record latest action run

## Most Recent Completed Work

### Tablet Operating Mode Emphasis

Updated:

```text
src/pages/WorkCenterDetailPage.tsx
```

The Work Center Tablet now visually emphasizes the Operator Next Best Action console as the active operating surface.

Added a compact operating-mode strip inside the console:

```text
TABLET OPERATING MODE
```

Mode labels are derived from the current action model:

- Help count greater than zero -> `HELP FIRST`.
- Pending review count greater than zero -> `REVIEW FIRST`.
- Ready count greater than zero -> `RUN READY WORK`.
- Otherwise -> `MONITOR / STAGE`.

The strip explains that lane taps jump to work, help, review, or handoff areas without changing dispatch authority.

Preserved existing repo behavior:

- Copy Station Link.
- Digital Co-worker flyout.
- Review target behavior.
- Runtime workflow panel behavior.

Guardrail:

- This is visual hierarchy only.
- No dispatch change.
- No route approval.
- No classifier mutation.
- No confidence change.
- No App.tsx change.

### Digital Co-worker Flyout

Updated:

```text
src/pages/WorkCenterDetailPage.tsx
```

The full-width Digital Co-worker block was removed from the main Work Center Tablet flow and moved into a top-right hero button/flyout.

The flyout now contains:

- Today's priority.
- Supervisor info tiles when in supervisor view.
- Worker station note when in worker/operator view.
- Close button.

Why:

- The Digital Co-worker block was not useful enough to occupy prime tablet space.
- The Operator Next Best Action console should sit higher on the page.
- The tablet should feel faster and more like a shop-floor control surface.

Follow-up fix:

```text
Commit: 7757dd05d91a24f73de47513ad6987305b59d696
```

Removed unused helpers after the flyout move:

- `getNextMoveStyle`
- `getLargeTextStyle`
- `getThreeColumnGridStyle`

### Claude Guide Pull Notes

Added:

```text
docs/CLAUDE_PULL_NOTES.md
```

Important correction from `CLAUDE.md`:

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

Older chat context may treat some of those as future/display-only. Use repo state instead.

### Precise Review Lane Targeting

Updated:

```text
src/pages/WorkCenterDetailPage.tsx
```

The Work Center Tablet Review Needed lane now reuses the existing review-target system.

When tapped, it:

- finds the leading review-needed traveler for the active work center.
- stores it under `jcm-classification-review-target-v1`.
- dispatches `jcm-classification-review-target-updated`.
- scrolls to the workflow/review area.
- lets `WorkCenterWorkflowPanelV2` preselect/highlight the targeted traveler.

Guardrail:

- Navigation only. No approval, dispatch, classifier mutation, confidence increase, or new review system.

### Operator Next Best Action Lane Drill-Ins

Updated:

```text
src/logic/operatorNextBestActions.ts
src/pages/WorkCenterDetailPage.tsx
```

The Work Center Tablet action console supports fast click-through movement.

Lane buttons:

- Run Now -> Go to workflow.
- Needs Help -> Go to help.
- Review Needed -> Go to review.
- Next Handoff -> Go to handoff.

Behavior:

- Buttons scroll to existing page sections using stable element IDs.
- No work is approved or dispatched.
- No classifier rules are changed.
- No confidence levels are raised.

### Operator Next Best Action Console And Selector

Added/updated:

```text
src/logic/operatorNextBestActions.ts
src/pages/WorkCenterDetailPage.tsx
```

The Work Center Tablet includes an Operator Next Best Action console near the top of the tablet page.

It shows four lanes:

- Run Now.
- Needs Help.
- Review Needed.
- Next Handoff.

The decision logic lives in `src/logic/operatorNextBestActions.ts`, keeping the page aligned with the doctrine: pages compose, modules think.

### Useful-Info Department Focus Cards

Updated:

```text
src/components/dashboard/DashboardWorkCenterCard.tsx
```

Department Focus cards now show useful operating signals instead of thin clickable tiles:

- department name and status.
- sharper resource/lane label.
- truth-strength badge: STRONG, PARTIAL, or PLACEHOLDER.
- Open For signal.
- Owns summary.
- top two daily focus items.
- coverage count or note.
- next useful module.

### Classification Review / Plant Truth Work

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

### Product Classification / Traveler Intelligence

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

## Repo-First Operating Rule

From `CLAUDE.md`, every coding session must begin from current `main`.

Required developer flow:

```bash
git fetch origin main && git log HEAD..origin/main --oneline
```

If main is ahead:

```bash
git pull origin main
npm run build
```

For this chat/API workflow:

- Pull current repo files before editing.
- Use current `main` state, not old chat memory.
- Do not reuse stale blob SHAs.
- If the contents endpoint rejects a stale file SHA, use current commit/tree/blob state instead.
- Check whether the repo already contains the component, selector, data field, or fix before building it.

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

## Current Product Intelligence Docs

```text
docs/JCM_WEBSITE_PRODUCT_INFRASTRUCTURE.md
docs/department-reality/COATING_PRODUCT_GUIDE_INTAKE.md
docs/department-reality/COATING_MODEL_FINISH_MATRIX.md
docs/TRAVELER_PRODUCT_CLASSIFICATION_RULE_PACK.md
docs/LOOSE_ENDS.md
docs/CLAUDE_PULL_NOTES.md
```

Department reality docs:

```text
docs/PLANT_DEPARTMENT_REALITY_MAP.md
docs/department-reality/FAB_REALITY_MAP.md
docs/department-reality/ASSEMBLY_AND_PRODUCT_LINE_REALITY_MAP.md
docs/department-reality/SHIPPING_AND_JIT_REALITY_MAP.md
docs/department-reality/QA_REALITY_MAP.md
docs/department-reality/MAINTENANCE_REALITY_MAP.md
```

## Current Protected Rules

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
- `CURRENT_BUILD_STATE.md` must be kept aligned with `CLAUDE.md` because repo behavior may be ahead of older chat assumptions.

## Next Recommended Move

Recommended next move:

```text
Use the tablet operating-mode strip, Digital Co-worker flyout, Copy Station Link, and lane drill-ins in the live Work Center Tablet view; then evaluate whether remaining lower-page panels should be collapsed, reordered, or moved behind action buttons for clickerboard-speed operation.
```

Good next candidates:

- Collapse or move lower-priority tablet panels behind action buttons.
- Improve precise focus inside `WorkCenterWorkflowPanelV2` only if the current review target behavior still feels too broad.
- Audit Dashboard / Orders / Plant Map for similar stale, bulky panels.

Guardrails:

- No automatic route approval.
- No classifier mutation.
- No confidence increases without confirmed governance.
- Keep structured selections as the source of truth.
- Keep queue/capture visibility-first.
- Pull current repo state before coding.
