# Traveler Product Classification Rule Pack

Purpose: define the first durable rule pack for converting product/order information into Dynamic Traveler route hints, department ownership hints, coating hints, QA requirements, and shipping pressure signals.

This is not final dispatch automation. It is a decision scaffold for future code.

## Core Principle

A traveler should not start with a department guess.

It should start with product identity:

```text
model number
+ product family
+ material
+ size/outlet/body clues
+ finish/coating requirement
+ engineered/standard/return/expedited status
= route and traveler hints
```

Then it should validate those hints against plant reality.

## Source Layers

Use three source layers in this order:

1. Order/product data.
2. Public product guide / website intelligence.
3. Plant Department Reality Maps.

Public product guides can identify what the product is. Plant maps decide how the product actually moves.

## Classification Output Shape

Future code should classify orders into an object shaped like this conceptually:

```text
ProductClassification {
  modelSignal
  productLine
  productFamily
  materialClass
  sizeClass
  outletClass
  finishHint
  engineeredRequired
  qaRequired
  routeHint
  departmentOwnershipHint
  confidence
  needsHumanReview
}
```

## Product Lines

Start with these high-level public product lines:

```text
REPAIR
CONNECTION
BRANCHING
ENGINEERED
TOOLS_ACCESSORIES
UNKNOWN
```

## Product Families

Start with these app-facing product families:

```text
SERVICE_SADDLE
TAPPING_SLEEVE
UNIVERSAL_CLAMP_COUPLING
PATCH_CLAMP
REPAIR_SLEEVE
COUPLING
FLANGED_ADAPTER
SPOOL_OR_TEE
EXPANSION_JOINT
RESTRAINER
LINE_STOP
CAP_SLEEVE
CUSTOM_ENGINEERED
UNKNOWN
```

## Material Classes

Use coarse material classes first:

```text
CARBON_STEEL
STAINLESS
DUCTILE_IRON
CASTING
MIXED_MATERIAL
UNKNOWN
```

Do not overfit material logic until order data supports it.

## Finish Hints

Use the finish vocabulary from the Coating Model Finish Matrix:

```text
STANDARD_SHOP_COAT
FUSION_PLASTIC_COATING
FUSION_EPOXY_COATING
OPTIONAL_FUSION_EPOXY
PASSIVATION
STAINLESS_NO_PAINT_ASSUMED
MIXED_MATERIAL_REVIEW
CUSTOM_FINISH_REVIEW
UNKNOWN_CONFIRM
```

## QA Rules

QA is conditional.

Required QA:

```text
engineered order
return
specific assigned case
```

Not automatic:

```text
normal production unless QA is assigned or spot-check selected
```

Future code should support:

```text
qaRequired
qaAssigned
qaReason
qaStatus
```

## Shipping Rules

All product routes eventually funnel to Shipping unless explicitly marked non-shipping/internal.

JCM operates with just-in-time pressure. Expedited orders are common and should be first-class signals, not oddball exceptions.

Future priority logic should include:

```text
expedited flag
ship date pressure
route position
remaining steps
blocking department
Shipping readiness
QA/documentation readiness
customer/management priority
```

## First Model-Number Rule Hints

These are starter hints only. They must be validated against plant reality before dispatching work.

### Service Saddles

| Model Signal | Classification Hint | Route Hint | Finish Hint | QA Hint |
| --- | --- | --- | --- | --- |
| 401 | SERVICE_SADDLE | Receiving → Coating → Saddles Dept | STANDARD_SHOP_COAT | QA only if assigned |
| 402 | SERVICE_SADDLE | Receiving → Coating → Saddles Dept | STANDARD_SHOP_COAT | QA only if assigned |
| 403 | SERVICE_SADDLE | Receiving → Coating → Saddles Dept | STANDARD_SHOP_COAT | QA only if assigned |
| 404 | SERVICE_SADDLE | Receiving → Coating → Saddles Dept | STANDARD_SHOP_COAT | QA only if assigned |
| 405 | SERVICE_SADDLE | Receiving → Coating → Saddles Dept | FUSION_PLASTIC_COATING | QA only if assigned |
| 406 | SERVICE_SADDLE | Receiving → Coating → Saddles Dept | FUSION_PLASTIC_COATING | QA only if assigned |
| 407 | SERVICE_SADDLE | Receiving → Coating → Saddles Dept | FUSION_PLASTIC_COATING | QA only if assigned |
| 408 | SERVICE_SADDLE | Receiving → Coating → Saddles Dept | FUSION_PLASTIC_COATING | QA only if assigned |
| 425 | SERVICE_SADDLE / ENGINEERED_REVIEW | Receiving → Coating → Saddles Dept or engineered route review | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY | likely review required |
| 502 | SERVICE_SADDLE | Stainless saddle path, confirm passivation/Saddles route | PASSIVATION | QA only if assigned |

Saddles dependency hints:

- LV4500s belong to Saddles Dept, not Machine Shop.
- Uncoated saddle castings come through Receiving, then Coating, then Saddles Dept.
- Straps are sheared in the Press Building and feed Saddles Dept.

### Tapping Sleeves / Branching

| Model Signal | Classification Hint | Route Hint | Finish Hint | QA Hint |
| --- | --- | --- | --- | --- |
| 412 | TAPPING_SLEEVE | 412 Fab → Coating → 412 Assembly | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY | QA if engineered/assigned |
| 432 | TAPPING_SLEEVE | 432 Fab → Coating/passivation review → 432 Assembly | STAINLESS_NO_PAINT_ASSUMED / PASSIVATION_CONFIRM | QA if engineered/assigned |
| 452 | TAPPING_SLEEVE | 452 Fab → Coating/passivation review → 452 Assembly | STAINLESS_NO_PAINT_ASSUMED / PASSIVATION_CONFIRM | QA if engineered/assigned |
| 414 / 415 / 440 | TAPPING_SLEEVE / ENGINEERED | Special Fab or engineered route review | CUSTOM_FINISH_REVIEW | QA required if engineered |
| 462 / 464 / 465 / 469 | TAPPING_SLEEVE / MIXED_MATERIAL | stainless/carbon mixed route review | MIXED_MATERIAL_REVIEW | QA if engineered/assigned |

Fab lane hints:

- 412 Fab: carbon, small-body, 12 inch and under outlets.
- 432 Fab: stainless equivalent to 412-style work.
- 452: stainless large body / large outlet, non-specialized.
- West Wing: industrial-only, variable body/outlet/material grade.
- Special Fab / Large Body / Specialized Welding: mostly carbon steel, needs more lane boundary confirmation.

### Repair / Clamp / Coupling Families

| Model Signal | Classification Hint | Route Hint | Finish Hint | QA Hint |
| --- | --- | --- | --- | --- |
| 101 / 102 / 171 / 172 | UNIVERSAL_CLAMP_COUPLING | Clamps or Couplings route review | STANDARD_SHOP_COAT | QA only if assigned |
| 131 / 132 / 133 / 134 | UNIVERSAL_CLAMP_COUPLING | stainless clamp/coupling route review | STAINLESS_NO_PAINT_ASSUMED / PASSIVATION_CONFIRM | QA only if assigned |
| 110 / 111 / 112 / 113 | PATCH_CLAMP | Patch Clamp stand-alone route | UNKNOWN_CONFIRM | QA only if assigned |
| 114 / 116 / 118 | REPAIR_SLEEVE / ENGINEERED | engineered route review | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY | QA required |
| 136 | REPAIR_SLEEVE / ENGINEERED | stainless engineered route review | PASSIVATION | QA required |
| 201 / 202 / 203 / 204 | COUPLING | Couplings route review | STANDARD_SHOP_COAT / UNKNOWN_CONFIRM | QA only if assigned unless engineered |
| 262 | COUPLING / STAINLESS | Couplings route review | STAINLESS_NO_PAINT_ASSUMED / PASSIVATION_CONFIRM | QA if assigned/engineered |

Product-line route hints:

- Clamps material is sheared in the Press Building, then built/assembled in Clamps Dept.
- Patch Clamp is stand-alone.
- Coupling fabrication happens in the Press Building, and Couplings is the assembly department for coupling products.

### Engineered / Spools / Expansion

| Model Signal | Classification Hint | Route Hint | Finish Hint | QA Hint |
| --- | --- | --- | --- | --- |
| 800 / 820 / 822 / 823 | SPOOL_OR_TEE / ENGINEERED | engineered route review | FUSION_EPOXY_COATING | QA required |
| 801 / 802 | EXPANSION_JOINT / ENGINEERED | engineered route review | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY / CUSTOM_FINISH_REVIEW | QA required |
| 303 / 304 / 309 | FLANGED_ADAPTER / ENGINEERED_OR_CONNECTION | Machine Shop/Fab/Coating route review | STANDARD_SHOP_COAT / CUSTOM_FINISH_REVIEW | QA if engineered/assigned |

## Confidence Levels

Use confidence to prevent false authority.

```text
HIGH: product guide and plant route both confirmed
MEDIUM: product guide strong, plant route partially confirmed
LOW: product guide signal exists, plant route unknown
REVIEW: mixed material, engineered, custom, or unclear routing
```

## Human Review Triggers

Always flag for review when:

- model number is unknown
- product is engineered/custom
- material is mixed
- finish is optional or customer-specific
- route lane is unclear
- size/outlet crosses known lane boundary
- QA is assigned manually
- expedited order is blocked
- no capable resource exists

## Traveler Dispatch Guardrails

A classified order should not become a traveler until required routing assumptions are clear enough to help the worker.

Do not show fake certainty.

Bad:

```text
Send to Coating.
```

Better:

```text
Finish hint: fusion plastic coating.
Likely lane: saddle plastic coating path.
Needs confirmation: oven/bed route.
```

Best after confirmation:

```text
Run through saddle plastic coating path: heat in oven, dip in fluidized bed, send to Saddles Dept.
```

## First Code Slice Recommendation

When this becomes code, build it as pure data + pure logic:

```text
src/data/productClassificationRules.ts
src/logic/classifyProductionOrder.ts
src/types/productClassification.ts
```

Do not bury classification inside UI components.

## Next Confirmation Targets

Ask the floor / user:

1. Does fusion plastic coating equal pizza oven + fluidized bed?
2. Which products use enamel?
3. Which products use shop coat line vs large paint booth?
4. Which stainless products go through passivation room?
5. Are fusion epoxy coatings in-house, outsourced, or both?
6. Do 412/432/452 routes always go Fab → Coating → matching Assembly?
7. Where do Couplings go relative to Coating?
8. Where do Patch Clamps go relative to Coating?
9. Where do Clamps go relative to Coating?
10. Which normal products bypass QA and go directly to Shipping?

## Decision Rule

Product classification should answer:

```text
What is this order likely to be?
What route does it probably need?
What finish/coating does it probably need?
Does it require QA?
What needs human confirmation before dispatch?
```

If it cannot answer those, the traveler should ask for clarification instead of pretending.
