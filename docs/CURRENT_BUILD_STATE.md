# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean state without dragging the full chat history forward.

Last updated: 2026-05-03

## Current Mission

Build Dynamic Travelers from real plant/product logic instead of generic department assumptions.

Current slice completed:

- Product classification foundation.
- Traveler classification wiring.
- Product Intelligence display in Department Traveler detail modal.
- Product Intelligence display in full Plant Traveler modal.
- Compact Product Intelligence badges on Dynamic Traveler workflow cards.
- Service saddle classification rule refinement.
- 412 carbon tapping sleeve classification refinement.
- Classification Review Summary in the workflow panel.
- Structured local confirmation capture for classification review items.
- Global dashboard Classification Review Queue.
- Safe drill-in navigation from global Classification Review Queue to department/work-center review capture.
- Review-target awareness so drill-in preselects/highlights the selected traveler in the department workflow panel.
- Review-target banner with a user-controlled Clear Target action in the department workflow panel.

## Latest Confirmed Green Build

```text
Run ID: 25285595610
Commit: f0852ebf685b96a668e5c01eaf5c049d2b65c9b7
Status: GREEN
```

Passed:

- Checkout
- Setup Node
- Install dependencies
- Build
- Upload demo build
- Record latest action run

## Last Completed Work

### Review-Target Banner And Clear Target Action

Updated:

```text
src/components/WorkCenterWorkflowPanelV2.tsx
```

The department workflow panel now shows a stronger review-target banner when a worker lands from the global Classification Review Queue.

It now:

- explains that the active target came from the global queue.
- shows the target order number.
- explains that the traveler is preselected below.
- provides a Clear Target button.
- removes `jcm-classification-review-target-v1` from localStorage when cleared.
- dispatches `jcm-classification-review-target-updated` after clearing.
- refreshes panel state so the target notice/highlight can return to normal review display.

Important guardrail:

- Clear Target only clears navigation context.
- It does not approve routes.
- It does not mutate classifier rules.
- It does not raise confidence.
- It does not dispatch work.
- It does not remove review warnings.

### Review-Target Awareness For Classification Review Drill-In

Added/updated:

```text
src/components/dashboard/ClassificationReviewQueue.tsx
src/components/WorkCenterWorkflowPanelV2.tsx
```

The dashboard review queue stores the clicked review target before opening the work center.

It now:

- stores the selected review target under `jcm-classification-review-target-v1`.
- dispatches `jcm-classification-review-target-updated`.
- opens the matching work center through the existing drill-in path.
- lets `WorkCenterWorkflowPanelV2` read the target and preselect the matching review-needed traveler.
- shows a target notice when the user lands in the department review panel from the global queue.
- highlights the targeted review item.

Important guardrail:

- Target awareness only improves navigation/visibility.
- It does not approve routes.
- It does not mutate classifier rules.
- It does not raise confidence.
- It does not dispatch work.

### Global Queue Drill-In Navigation

Added/updated:

```text
src/components/dashboard/ClassificationReviewQueue.tsx
src/pages/DashboardPage.tsx
```

The Plant Command Center dashboard review queue has a safe drill-in path.

It now:

- shows an OPEN REVIEW CAPTURE button per queue item.
- matches the review-needed traveler department to the existing work center list.
- opens the corresponding work-center/department detail page using the existing `onOpenWorkCenter` path.
- leaves structured confirmation capture inside the department workflow panel.
- disables the drill-in button if no matching work center exists.

Important guardrail:

- Drill-in only navigates to the existing review/capture surface.
- It does not approve routes.
- It does not mutate classifier rules.
- It does not raise confidence.
- It does not dispatch work.

### Global Dashboard Classification Review Queue

Added/updated:

```text
src/components/dashboard/ClassificationReviewQueue.tsx
src/pages/DashboardPage.tsx
```

The Plant Command Center dashboard shows a plant-wide Classification Review Queue after Plant Signals.

It gathers review-needed Dynamic Travelers across the plant and shows order number, department, model signal, product family, finish hint, confidence, QA required/not required, review reason, suggested route, current instruction, and saved confirmation count.

Important guardrail:

- The queue is visibility only.
- It does not approve routes.
- It does not mutate classifier rules.
- It does not raise confidence.
- It does not dispatch work.

### Structured Classification Review Confirmation Capture

Added/updated:

```text
src/types/classificationReview.ts
src/logic/classificationReviewConfirmations.ts
src/components/travelers/ClassificationReviewCapture.tsx
src/components/WorkCenterWorkflowPanelV2.tsx
```

The workflow panel supports local-only structured confirmation capture for classification review items.

It uses controlled selection fields, saves confirmations to localStorage under `jcm-classification-review-confirmations-v1`, shows saved confirmation counts per review-needed traveler, and shows recent confirmations for the active traveler.

Important guardrail:

- Confirmations do not mutate classifier rules.
- Confirmations do not approve routes automatically.
- Confirmations do not raise confidence automatically.
- Confirmations do not dispatch work.

### Classification Review Summary

Updated:

```text
src/components/WorkCenterWorkflowPanelV2.tsx
```

Added a display-only Classification Review Summary above the Dynamic Travelers list.

### 412 Carbon Tapping Sleeve Classification Refinement

Updated:

```text
src/data/productClassificationRules.ts
```

412 rule was tightened only for the carbon 412 tapping sleeve family. Confidence remains MEDIUM. Review warning remains for 12 inch outlet threshold and exact coating lane.

### Service Saddle Classification Refinement

Updated:

```text
src/data/productClassificationRules.ts
```

401-404 route confidence is HIGH for Receiving -> Coating -> Saddles Dept. 405-408 stay MEDIUM until coating process is confirmed. 502 remains LOW and human-review-required.

### Product Intelligence Badges On Workflow Traveler Cards

Updated:

```text
src/components/WorkCenterWorkflowPanelV2.tsx
```

Dynamic Traveler cards show finish hint, QA status, review status, and confidence.

### Product Classification Foundation

Added:

```text
src/types/productClassification.ts
src/data/productClassificationRules.ts
src/logic/classifyProductionOrder.ts
```

Classifier outputs product line, product family, material class, size/outlet/body clues, finish hints, engineered requirement, QA requirement, route hint, ownership hint, confidence, and human review reasons.

### Traveler Wiring

Updated:

```text
src/types/dynamicTraveler.ts
src/logic/dynamicTraveler.ts
```

DynamicTraveler and PlantTraveler carry classification intelligence, finish hints, QA requirement, suggested route, and review reasons.

Important behavior guardrail:

- Product classification can influence route only when it does not require human review.
- RequiredDepartments still override classifier route hints.
- Classification is a mapmaker, not full dispatch authority.

## Current Durable Plant Truth

### Receiving

- Receiving stands alone.
- Fed by incoming supplies.
- Organizes material and feeds other departments.
- First material truth gate for many routes.

### Machine Shop

Machine Shop stands alone and is fed by Receiving.

Known equipment/logic:

- DMG Mori: push plugs 4 inch to 24 inch, threaded plugs 4 inch to 12 inch.
- Mori Seiki: threaded and push pin spigots 4 inch to 16 inch, ANSI/Class D flanges typically 10 inch to 16 inch.
- Yama Seiki: large parts, push pin spigots 16 inch to 36 inch, flanges 14 inch to 36 inch.
- WIA KH-80: all push pin spigots go through here for drilling/tapping/threadmilling rim.
- Quickmill Intimidator: grooves flat plate burned by Material Handling.
- WIA L300C: smaller flanges, one-off work, face short pipe, some CC couplings.
- G&L mill: same groove work as Intimidator but stainless.
- American Hole Wizard radial arm drill and manual horizontal short bed lathe are support resources.

Do not show machines that cannot run the size/type/material.

### Material Handling

Material Handling is production, not support. It owns or influences burning, plasma, laser, rolling, saw cutting, press work, large-diameter coupling expansion, press brake work, and some coupling welding.

Important resources:

- 2016 Messer burn table
- 2006 Alltra plasma table
- HK FS-1200 laser table, owned by Material Handling but housed in main plant
- Large MG 4-post roller, currently inoperable
- Small MG 4-post roller, currently inoperable
- 7L roller
- two Webb 3-post rollers
- unknown additional roller
- two self-feeding saws
- Press Building with Beckwood expander, Bliss 300-ton press, 250-ton press, 120-ton press, Baileigh CNC press brake, coupling welders

### Fab

Fab is not one generic welding department.

Fab lanes:

- Special Fab
- Large Body
- Specialized Welding
- 412 Fab
- 432 Fab
- 452
- West Wing / Industrial Welders

Rules known:

- Fab is fed by Machine Shop and Material Handling.
- Fab welds those components into assemblies.
- All Fab output moves to Coating.
- 412 Fab: carbon, small body, 12 inch and under outlets.
- 432 Fab: stainless equivalent of 412-style work.
- 452: stainless, large body / large outlet, not specialized.
- West Wing: industrial-only, body/outlet/material vary.

### Coating

Coating is large and complex. Do not model as one bucket.

Known processes/resources:

- Wheelabrator/media prep for non-service-saddle parts.
- one-man media booths
- two-man media booth
- continuous shop coat paint line for saddles
- large-part paint booth
- enamel spray booths, count needs confirmation
- pizza oven
- fluidized plastic coating bed
- passivation room with water/chemical baths

Product-guide finish matrix exists and should be used as a hint layer only.

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

Need confirmation:

- whether fusion plastic coating equals pizza oven plus fluidized bed.
- which products use enamel.
- which products use continuous shop coat line vs large-part paint booth.
- which stainless products are passivated in-house.
- whether fusion epoxy is in-house, outsourced, or both.

### Assembly / Product-Line Departments

Assembly is not one generic department.

Fab-lane assembly:

- Special Fab -> Coating -> Special Assembly
- 412 Fab -> Coating -> 412 Assembly
- 432 Fab -> Coating -> 432 Assembly
- 452 Fab -> Coating -> 452 Assembly

Product-line assembly:

- Couplings is assembly department for coupling products.
- Coupling fabrication happens in Press Building, part of Material Handling.
- Saddles assembly is integrated in Saddles Dept.
- Clamps assembly is integrated in Clamps Dept.
- Patch Clamp is stand-alone.

### Saddles Correction

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

### QA

QA is conditional, not universal. QA required for engineered orders, returns, and specifically assigned cases. Regular production is mostly spot-check unless QA is assigned.

### Shipping / JIT

Everything eventually funnels to Shipping. JCM runs just-in-time, so expedited orders are common.

### Maintenance

Maintenance is stand-alone. JCM is starting from scratch on machine reliability. Existing maintenance work order request flow should become the first reliability backbone.

## Current Product Intelligence Docs

Created/updated docs:

```text
docs/JCM_WEBSITE_PRODUCT_INFRASTRUCTURE.md
docs/department-reality/COATING_PRODUCT_GUIDE_INTAKE.md
docs/department-reality/COATING_MODEL_FINISH_MATRIX.md
docs/TRAVELER_PRODUCT_CLASSIFICATION_RULE_PACK.md
docs/LOOSE_ENDS.md
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

Preserve these:

- Guidance > Control
- Structured selections > free text
- Selections drive logic; notes explain exceptions
- Global command = mission visibility
- Department views = local action
- App.tsx routes only
- Pages compose
- Modules think
- Components display

Avoid these failure modes:

- duplicate src folders
- full zip overwrites
- free-text data poisoning
- import/path drift
- chat context overload
- coordination drift
- generic department assumptions
- fake route certainty

## Active Risks

Main active risks:

- Coating is still partly uncertain.
- Couplings route relative to Coating is still uncertain.
- Clamps and Patch Clamps need more detail.
- 412/432/452 rules need confirmation before route hints become dispatch logic.
- Classifier should not overrule human review.
- Current confirmation capture is local-only and does not yet feed route-rule update workflows.

## Next Recommended Move

Recommended next move:

```text
Pause coding and collect plant facts from docs/LOOSE_ENDS.md.
```

Why:

- Global queue can route users to the correct work-center page and preselect the review item.
- The review target banner now explains the landing context and can clear the stored target.
- The next useful improvement is plant truth, not more UI chrome.
- Route-rule expansion should wait for plant confirmations.

Most valuable confirmations:

- Is the 12 inch outlet threshold for 412 inclusive?
- Does 412 always route 412 Fab -> Coating -> 412 Assembly?
- Which exact coating lane handles 412 shop coat?
- Is optional fusion epoxy in-house, outsourced, or order-specific?
- Does fusion plastic coating for 405-408 equal pizza oven plus fluidized bed?
- Do saddle straps get coated before or after Saddles Dept/LV4500 work?
- Does 502 follow the same Saddles Dept path?
- Is 502 passivated in Coating/passivation room?

Guardrails:

- No automatic route approval.
- No classifier mutation.
- No confidence increases without confirmed governance.
- Keep structured selections as the source of truth.
- Keep queue/capture visibility-first.
