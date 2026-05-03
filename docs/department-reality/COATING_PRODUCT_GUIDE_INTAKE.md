# Coating Product Guide Intake

Purpose: capture coating-related clues from JCM public product guides and manuals so the Command Center can eventually infer likely coating lanes from model number, product family, material, and finish language.

This document is not final plant routing truth. It is a product-guide intelligence layer. Actual coating lane rules must still be confirmed against the Plant Department Reality Map and shop-floor knowledge.

## Source Documents Reviewed

- JCM General Product Directory, Effective August 1, 2025.
- JCM Engineered Fittings Manual, Effective August 24, 2020, updated August 1, 2024.

## Core Use For The App

Product guides can help classify orders into likely coating needs:

```text
model number
+ product family
+ material
+ finish language
+ coating option
= probable coating lane / traveler hint
```

The app should not use these hints as final dispatch rules until plant reality confirms them.

## Coating Lanes We Currently Need To Support

Known plant coating lanes/processes from plant reality discussions:

- Wheelabrator / media prep.
- One-man media booths.
- Two-man media booth.
- Plastic dip.
- Fluidized plastic coating bed.
- Pizza oven heat before plastic dip.
- Enamel spray booths.
- Shop coat / continuous paint line.
- Large-part paint booth.
- Passivation room.
- Fusion epoxy or specialty coatings where applicable.

## Product Guide Signals

### Service Saddles

The product directory lists service saddle models including:

- 401 Single Strap Service Saddle
- 402 Double Strap Service Saddle
- 403 Wide Body Service Saddle with stainless strap
- 404 Service Saddle with double stainless steel straps
- 405 Coated Wide Body Service Saddle with stainless strap
- 406 Coated Service Saddle with double stainless steel straps
- 407 Coated Single Strap / Wide Body with electro-galvanized strap language in guide sections
- 408 Coated Saddle with double electro-galvanized straps
- 425 Service Saddle for Concrete Steel Cylinder Pipe
- 502 Stainless Steel Service Saddle

Coating clues:

- Models 405, 406, 407, and 408 are explicitly coated service saddle families.
- The product directory describes 405/407 as having a heavy resilient plastic coating that is fusion applied to the saddle body.
- The product directory describes 406/408 as using a heavy duty double strap saddle body with a fusion applied, heavy resilient plastic coating.
- 401/402/403/404 are service saddle families but not explicitly listed in the index as coated models.
- 502 is stainless steel service saddle and may need different treatment than coated ductile saddle bodies.

Traveler implications:

- Coated service saddle orders should likely route through the saddle coating path before Saddles Dept assembly.
- Product code can help identify coated vs uncoated saddle families.
- Model code alone may not identify all internal coating operations, because the plant route still depends on casting receipt, coating, strap readiness, LV4500 work, and Saddles Dept assembly.

### Universal Clamp Couplings / Repair Fittings

The product directory lists repair and clamp families such as:

- 101 / 102 Universal Clamp Couplings
- 103 / 104 Tapped Universal Clamp Couplings
- 131 / 132 All Stainless Universal Clamp Couplings
- 161 / 162 / 168 fabricated lug stainless clamp families
- 110 Patch Clamp
- 111 Full Repair Clamp
- 112 / 113 Heavy Duty Patch Clamp
- 114 Mechanical Joint Repair Sleeve
- 116 Repair Sleeve for Concrete Steel Cylinder Pipe
- 118 Fabricated Repair Sleeve
- 136 Heavy Duty Stainless Repair Clamp

Coating clues:

- Some carbon steel / ductile / fabricated products list corrosion-resistant shop coat primer.
- Stainless repair products should not be assumed to follow the same paint path as carbon steel products.
- Heavy-duty stainless products may need passivation or stainless-specific handling, but this must be confirmed by plant reality.

Traveler implications:

- Repair fitting products should be tagged by material: carbon/ductile vs stainless.
- Stainless products may require passivation or stainless routing, not generic enamel/shop coat.
- Patch clamp product line should remain distinct from Clamps and generic Assembly.

### Engineered Repair Fittings

The engineered manual and product guide include engineered repair products such as:

- 114 Mechanical Joint Repair Sleeve
- 116 Repair Sleeve for Concrete Steel Cylinder Pipe
- 118 Fabricated Repair Sleeve
- 136 Heavy Duty Stainless Repair Clamp

Coating clues:

- 114 material specs include heavy coat corrosion resistant shop coat primer and optional fusion epoxy coating.
- 116 specs include heavy coat corrosion resistant shop coat primer on sleeve, gland, and straps; pressure plate is epoxy coated; optional epoxy coating on entire sleeve.
- 118 specs include heavy coat corrosion resistant shop coat primer and optional fusion epoxy coating.
- 136 is all stainless and includes passivation language in the engineered manual.

Traveler implications:

- Engineered carbon steel repair products may need shop coat or epoxy coating logic.
- Engineered stainless repair products may need stainless/passivation logic rather than paint.
- Engineered orders already require QA, so coating traveler logic should eventually feed QA readiness.

### Tapping Sleeves / Branching

The product directory and engineered manual include tapping sleeve families such as:

- 411 Fabricated Tapping Sleeve - Plain End Outlet
- 412 Fabricated Tapping Sleeve - Flanged Outlet
- 414 Fabricated Mechanical Joint Tapping Sleeve
- 415 Tapping Sleeve for Concrete Steel Cylinder Pipe
- 418 Fabricated Threaded Outlet Tapping Sleeve
- 432 All Stainless Steel Tapping Sleeve
- 438 Stainless Steel Threaded Outlet Tapping Sleeve
- 439 Stainless Steel Tapping Sleeve - Mechanical Joint Outlet
- 452 All Stainless Steel Tapping Sleeve with Outlet Seal Gasket
- 459 Stainless Steel Tap Sleeve - Mechanical Joint Outlet
- 462 / 464 / 465 / 469 stainless sleeve variants with carbon steel flange or MJ outlet language
- 440 Line Stop Fittings

Coating clues:

- 412 and related carbon fabricated tapping sleeves likely need carbon steel finish logic.
- 432 and 452 are stainless tapping sleeve families and should not be treated like carbon steel coating.
- 462/464/465/469 mix stainless sleeve language with carbon steel flange/MJ outlet language, so they may need hybrid material/finish handling.

Traveler implications:

- Coating rules for tapping sleeves should be tied to Fab lane: 412, 432, 452, Special Fab, West Wing where applicable.
- Mixed-material products need component-aware coating/passivation logic.

### Fabricated Spools / Expansion Joints / Engineered Connection Work

The engineered manual includes:

- 801 Expansion Joint - Single End
- 802 Expansion Joint - Double End
- 800 Fabricated Spools
- fabricated tees / bypass tees

Coating clues:

- Expansion joint typical specification says the body has shop coat primer and the slip pipe is stainless steel.
- Fabricated spools and tees may be fusion epoxy coated in the engineered manual language.

Traveler implications:

- Engineered connection/spool work may need special coating choices: shop coat, fusion epoxy, stainless handling, or other specified finish.
- Product-family classifier should flag these as engineered/custom and likely QA-required.

## Preliminary Coating Classification Hints

These are not final rules. They are starting hints for app logic.

| Product / Model Signal | Likely Coating Hint | Needs Plant Confirmation |
| --- | --- | --- |
| 405 / 406 / 407 / 408 service saddles | fusion applied heavy resilient plastic coating / saddle coating path | exact plant lane: plastic dip vs other coating process |
| 401 / 402 / 403 / 404 service saddles | service saddle, not explicitly coated in model title | whether castings still route Receiving → Coating → Saddles Dept |
| 502 stainless service saddle | stainless saddle path | passivation vs no coating vs special handling |
| 101 / 102 / 103 / 104 carbon/ductile UCC families | shop coat or standard clamp finish hints | Clamps/Couplings/Patch Clamp lane and coating timing |
| 131 / 132 / 133 / 134 stainless UCC families | stainless path | passivation or stainless handling |
| 110 / 112 / 113 patch clamps | patch clamp path | coating timing and material options |
| 114 / 116 / 118 carbon engineered repair | shop coat primer or fusion epoxy option | coating lane, booth/line, QA timing |
| 136 stainless repair | stainless / passivation hint | exact passivation requirement |
| 412 carbon tapping sleeve | carbon Fab/412 path, coating likely after Fab | exact coating type and assembly lane |
| 432 / 452 stainless tapping sleeve | stainless Fab lane, possible passivation/stainless handling | exact passivation or coating need |
| 462 / 464 / 465 / 469 mixed stainless/carbon outlet variants | mixed-material coating/passivation logic | component-specific coating path |
| 800 / 801 / 802 engineered spools/expansion joints | shop coat or fusion epoxy options | exact finish by order/customer spec |

## Coating Traveler Questions Generated By Product Guides

A Coating traveler should eventually answer:

1. What product family/model is this?
2. Is it carbon steel, ductile iron, stainless, or mixed material?
3. Is the product explicitly coated by model number?
4. Is the required finish shop coat, enamel, fusion epoxy, plastic dip, passivation, or other?
5. Does it need media prep first?
6. Does it need oven heat before plastic coating?
7. Is it a saddle, clamp, patch clamp, coupling, tapping sleeve, engineered repair, spool, or industrial product?
8. Does this coating step feed Saddles Dept, matching Assembly lane, Clamps, Patch Clamp, Couplings, QA, or Shipping?

## Guardrail

Product guides can tell us what the product is sold as and what finishes/options are publicly described. They cannot tell us the exact internal route by themselves.

Final route logic must combine:

```text
public product guide signal
+ order/product model
+ material/finish requirement
+ plant department reality map
+ user-confirmed shop-floor flow
```

## Next Research Tasks

- Pull additional website/source-folder PDFs if available.
- Extract all finish/coating/passivation/fusion-epoxy/shop-coat mentions.
- Build a model-number-to-coating-hint table.
- Ask shop-floor confirmation for each uncertain product family.
- Convert confirmed coating hints into traveler rule packs only after validation.
