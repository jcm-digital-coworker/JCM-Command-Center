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

## Latest Confirmed Green Build

```text
Run ID: 25267450016
Commit: 1f3e2f0e15b4a962f72d621f222071541f1450f5
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

### Service Saddle Classification Refinement

Updated:

```text
src/data/productClassificationRules.ts
```

Service saddle rules were tightened only for the Saddles product family:

- 401/402/403/404 standard service saddles now use confirmed route: Receiving -> Coating -> Saddles Dept.
- 401/402/403/404 confidence raised to HIGH for route confidence, while preserving review warning for exact shop-coat sub-lane and strap coating timing.
- 405/406/407/408 coated service saddles use confirmed route: Receiving -> Coating -> Saddles Dept.
- 405/406/407/408 keep MEDIUM confidence because fusion plastic coating process still needs confirmation.
- 502 stainless service saddle remains LOW and human-review-required until stainless/passivation handling and route are confirmed.

Important guardrail:

- This does not make automatic dispatch final.
- Coating sub-lane details still require review.
- No Couplings, Clamps, Patch Clamp, 412, 432, or 452 route assumptions were expanded.

### Product Intelligence Badges On Workflow Traveler Cards

Updated:

```text
src/components/WorkCenterWorkflowPanelV2.tsx
```

Dynamic Traveler cards now show compact Product Intelligence badges before opening the modal:

- finish hint
- QA required / QA not required
- review needed / classified
- confidence

This is display-only. It does not change dispatch behavior.

### Product Classification Foundation

Added:

```text
src/types/productClassification.ts
src/data/productClassificationRules.ts
src/logic/classifyProductionOrder.ts
```

Classifier outputs:

- product line
- product family
- material class
- size/outlet/body clues when known
- finish hints
- engineered requirement
- QA requirement
- QA reason
- route hint
- department ownership hint
- confidence
- human review reasons

### Traveler Wiring

Updated:

```text
src/types/dynamicTraveler.ts
src/logic/dynamicTraveler.ts
```

DynamicTraveler now carries:

- productClassification
- finishHints
- qaRequired
- classificationReviewReasons

PlantTraveler now carries:

- productClassification
- finishHints
- qaRequired
- suggestedRoute
- classificationReviewReasons

Important behavior guardrail:

- Product classification can influence route only when it does not require human review.
- RequiredDepartments still override classifier route hints.
- Classification is a mapmaker, not full dispatch authority.

### Traveler UI Visibility

Updated:

```text
src/components/travelers/TravelerDetailModal.tsx
src/components/travelers/PlantTravelerDetailModal.tsx
```

Both modals now show Product Intelligence:

- Model Signal
- Matched Rule
- Product Family
- Material
- Finish Hint
- QA Required
- Confidence
- Suggested Route
- Review warnings before automatic dispatch

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

Material Handling is production, not support.

Owns or influences:

- burning plate
- plasma cutting
- laser cutting
- rolling
- saw cutting pipe/bar/round stock
- press work
- large-diameter coupling expansion
- press brake work
- some coupling welding

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

QA is conditional, not universal.

QA required for:

- engineered orders
- returns
- specifically assigned cases

Regular production:

- mostly spot-check unless QA is assigned.

Do not route every order through QA by default.

### Shipping / JIT

- Everything eventually funnels to Shipping.
- Shipping is final outbound gate.
- JCM runs just-in-time.
- Expedited orders are common, not rare.
- Priority logic must eventually account for ship pressure, route position, blockers, QA/documentation readiness, and Shipping readiness.

### Maintenance

- Maintenance is stand-alone.
- JCM is starting from scratch on machine reliability.
- Existing maintenance work order request flow should become the first reliability backbone.
- Do not fake mature reliability analytics yet.
- First goal: trustworthy machine/resource status and repair history.

## Current Product Intelligence Docs

Created/updated docs:

```text
docs/JCM_WEBSITE_PRODUCT_INFRASTRUCTURE.md
docs/department-reality/COATING_PRODUCT_GUIDE_INTAKE.md
docs/department-reality/COATING_MODEL_FINISH_MATRIX.md
docs/TRAVELER_PRODUCT_CLASSIFICATION_RULE_PACK.md
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
- Current UI shows intelligence, but does not yet make it actionable.

## Next Recommended Move

Do not jump straight to automatic dispatch.

Recommended next code slice:

```text
Refine one more product family only, likely 412.
```

Why:

- 412 route has partial confirmation from Fab and Assembly maps.
- 412 still needs outlet threshold confirmation before route confidence can be raised too far.
- It is a good next isolated route-rule slice.

Alternate next move:

```text
Ask shop-floor questions for Saddles coating details before raising 405-408 confidence.
```

Important Saddles questions:

- Does fusion plastic coating equal pizza oven plus fluidized bed?
- Do straps get coated before or after Saddles Dept/LV4500 work?
- Does 502 follow the same Saddles Dept path?
- Is 502 passivated in Coating/passivation room?

## Exact Next Action

If continuing route rules:

1. Start with 412 only.
2. Preserve human-review guardrails around the 12 inch outlet threshold and coating type.
3. Do not generalize to 432 or 452 until stainless/passivation details are confirmed.
4. Build and verify CI.

If continuing knowledge capture:

1. Ask/answer the Saddles coating questions above.
2. Update service saddle rules only after confirmation.
3. Build and verify CI if code changes.
