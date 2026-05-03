# Coating Model Finish Matrix

Purpose: convert JCM product-guide coating/finish language into a practical model-number-to-finish matrix for future Dynamic Traveler coating lane logic.

This document is product-guide intelligence, not final plant dispatch truth. Use it as a starting map for asking better shop-floor questions and building confirmed coating rule packs.

## Source Documents

- JCM General Product Directory, Effective August 1, 2025.
- JCM Engineered Fittings Manual, Effective August 24, 2020.

## Guardrail

Public product guide finish language does not automatically equal internal plant lane routing.

Final traveler logic must combine:

```text
model number / product guide finish signal
+ order-specific finish requirement
+ material
+ plant department reality map
+ confirmed shop-floor route
```

## Finish / Coating Signal Types

Use these app-facing finish tags as the first vocabulary:

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

## Model / Product Finish Matrix

| Model / Product Signal | Product Family | Product-Guide Finish Signal | Likely App Finish Tag | Traveler Note |
| --- | --- | --- | --- | --- |
| 401 | Service Saddle | Standard shop coat primer for 401-404 saddle family | STANDARD_SHOP_COAT | Confirm whether all uncoated saddle castings still route Receiving → Coating → Saddles Dept. |
| 402 | Service Saddle | Standard shop coat primer for 401-404 saddle family | STANDARD_SHOP_COAT | Double strap saddle. Confirm coating lane and strap timing. |
| 403 | Service Saddle | Standard shop coat primer for 401-404 saddle family | STANDARD_SHOP_COAT | Wide body / stainless strap. Confirm if coating lane differs from 401/402. |
| 404 | Service Saddle | Standard shop coat primer for 401-404 saddle family | STANDARD_SHOP_COAT | Double stainless strap. Confirm coating lane and strap timing. |
| 405 | Coated Service Saddle | Fusion bonded, high density blue plastic coating, 12 mil minimum | FUSION_PLASTIC_COATING | Coated saddle. Likely plastic coating path. Confirm oven/bed lane. |
| 406 | Coated Service Saddle | Fusion applied heavy resilient plastic coating | FUSION_PLASTIC_COATING | Double stainless strap coated saddle. Confirm plastic coating lane. |
| 407 | Coated Service Saddle | Fusion bonded, high density blue plastic coating, 12 mil minimum | FUSION_PLASTIC_COATING | Coated saddle with electro-galvanized strap. Confirm strap/coating timing. |
| 408 | Coated Service Saddle | Fusion applied heavy resilient plastic coating | FUSION_PLASTIC_COATING | Double electro-galvanized strap coated saddle. Confirm plastic coating lane. |
| 425 | Service Saddle for Concrete Steel Cylinder Pipe | Heavy corrosion-resistant shop coat primer; optional fusion epoxy | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY | PCCP saddle. Confirm whether it follows saddle lane or engineered/special route. |
| 502 | Stainless Service Saddle | 304 stainless fabrication is passivated per ASTM A380 | PASSIVATION | Stainless saddle path. Confirm if Coating/passivation room owns this internally. |
| 101 / 102 / 171 / 172 | Universal Clamp Couplings | Corrosion-resistant shop coat paint primer | STANDARD_SHOP_COAT | Clamp/coupling route must be confirmed against Clamps/Couplings departments. |
| 131 / 132 / 133 / 134 | All Stainless UCC / tapped UCC | Stainless construction / corrosion resistance; no shop-coat language in viewed material spec | STAINLESS_NO_PAINT_ASSUMED / PASSIVATION_CONFIRM | Confirm whether passivation room handles these. |
| 161 / 162 / 168 | Stainless fabricated lug clamps | All stainless construction for corrosive environments | STAINLESS_NO_PAINT_ASSUMED / PASSIVATION_CONFIRM | Confirm passivation and product-line lane. |
| 110 / 111 / 112 / 113 | Patch clamps / full repair / heavy duty patch | Material options; coating route not fully confirmed in extracted chunks | UNKNOWN_CONFIRM | Keep Patch Clamp stand-alone. Need shop-floor and source confirmation. |
| 114 | Mechanical Joint Repair Sleeve | Heavy corrosion-resistant shop coat primer; optional fusion epoxy | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY | Engineered order, QA required. Finish may be order-specific. |
| 116 | Repair Sleeve for Concrete Steel Cylinder Pipe | Shop coat on sleeve/gland/straps; epoxy-coated pressure plate; optional epoxy entire sleeve | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY | Engineered order, QA required. Component-level coating matters. |
| 118 | Fabricated Repair Sleeve | Heavy shop coat primer; optional fusion epoxy | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY | Engineered order, QA required. Finish may be customer/application-specific. |
| 136 | Heavy Duty Stainless Repair Clamp | Fully passivated to insure corrosion resistance | PASSIVATION | Engineered/stainless path, QA required. |
| 159 Type 2 | Cap Sleeve | Carbon steel, corrosion-resistant shopcoat primer; optional fusion epoxy | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY | Type matters. Do not classify all 159s the same. |
| 159 Type 1 / 3 / 5 | Cap Sleeve | All stainless Type 304 variants | STAINLESS_NO_PAINT_ASSUMED / PASSIVATION_CONFIRM | Confirm internal passivation route. |
| 412 | Carbon Steel Tapping Sleeve | Heavy shop coat primer; optional fusion applied epoxy | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY | 412 Fab → Coating → 412 Assembly route candidate. Confirm actual lane. |
| 414 | Mechanical Joint Tapping Sleeve | Shop coat primer; optional fusion epoxy | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY | Engineered/special tapping sleeve. QA required if engineered. |
| 415 | Tapping Sleeve for Concrete Steel Cylinder Pipe | Coating appears order/special-requirement driven in engineered manual | CUSTOM_FINISH_REVIEW | Needs deeper source extraction and plant confirmation. |
| 416 / 417 | Weld-On Tapping Outlets / Sleeves | Shop coat primer; optional fusion epoxy in source material | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY | May require welding route and special coating review. |
| 422 | Carbon Steel Tapping Sleeve for PVC/Steel/HDPE | Furnished standard fusion epoxy coated with electro-coated bolts | FUSION_EPOXY_COATING | Strong source signal. Confirm actual coating lane. |
| 432 | All Stainless Tapping Sleeve | Stainless tapping sleeve | STAINLESS_NO_PAINT_ASSUMED / PASSIVATION_CONFIRM | 432 Fab/Assembly path. Confirm passivation handling. |
| 438 / 439 | Stainless tapping sleeve variants | Stainless construction for corrosive environments | STAINLESS_NO_PAINT_ASSUMED / PASSIVATION_CONFIRM | Confirm route and finish handling. |
| 452 | All Stainless Tapping Sleeve Outlet Seal Gasket | All stainless / corrosion resistance; available in 316 stainless | STAINLESS_NO_PAINT_ASSUMED / PASSIVATION_CONFIRM | 452 Fab/Assembly path. Confirm passivation handling. |
| 459 | Stainless MJ outlet tapping sleeve | Stainless construction | STAINLESS_NO_PAINT_ASSUMED / PASSIVATION_CONFIRM | Confirm route. |
| 462 / 464 | Stainless tapping sleeve with carbon steel flange | Mixed stainless + carbon steel flange | MIXED_MATERIAL_REVIEW | Component-aware finish logic required. Carbon flange may need coating while sleeve is stainless. |
| 465 / 469 | Stainless sleeve with carbon MJ outlet | Mixed stainless + carbon mechanical-joint outlet | MIXED_MATERIAL_REVIEW | Component-aware finish logic required. |
| 607 / 617 | Weld-on restrainers | Bare clean metal for welding or shop coat primer | CUSTOM_FINISH_REVIEW | Finish depends on weld/use requirement. |
| 801 / 802 | Expansion Joints | Body has shop coat primer; epoxy or stainless options for corrosive/acidic environments | STANDARD_SHOP_COAT / OPTIONAL_FUSION_EPOXY / CUSTOM_FINISH_REVIEW | Engineered product, QA required. Finish is order-specific. |
| 800 / 820 / 822 / 823 | Fabricated spools / tees / bypass tees | Fusion epoxy coated steel fittings in engineered guide | FUSION_EPOXY_COATING | Engineered/custom route. Confirm coating lane. |

## Strong Source-Backed Rules Ready For Confirmation

These are strong enough to ask the shop floor directly:

### Service Saddles

```text
401-404 → standard shop coat primer by product guide
405-408 → fusion plastic coating by product guide
502 → passivation by product guide
```

Shop-floor confirmation needed:

- Do 401-404 castings still go Receiving → Coating → Saddles Dept?
- Are 405-408 processed through the pizza oven / fluidized plastic coating bed?
- Does 502 go through passivation room or another stainless finishing path?

### Engineered Carbon Steel

```text
114 / 118 → shop coat primer, optional fusion epoxy
116 → shop coat plus epoxy-coated pressure plate, optional full epoxy
412 / 414 / 416 / 417 → shop coat primer, optional fusion epoxy
422 → standard fusion epoxy
800/820/822/823 → fusion epoxy coated
801/802 → shop coat primer unless epoxy/stainless option
```

Shop-floor confirmation needed:

- Which of these go to continuous shop coat line versus paint booth?
- Which go to large-part paint booth?
- Which get fusion epoxy in-house versus outsourced or special process?

### Stainless Products

```text
502 / 136 → explicit passivation language found
432 / 438 / 439 / 452 / 459 / 6432 / 6438 / 6439 / 6452 / 6459 → stainless corrosion-resistant families; passivation needs confirmation
```

Shop-floor confirmation needed:

- Which stainless families actually go through passivation room?
- Which stainless products skip coating entirely?
- Which mixed-material products require both passivation and coating/paint on carbon components?

## Traveler Rule Implications

Future Coating travelers should not simply say:

```text
Send to Coating.
```

They should eventually say:

```text
Finish: Fusion plastic coating
Likely lane: saddle plastic coating path
Prep: confirm media / oven heat
Next: Saddles Dept
```

or:

```text
Finish: Shop coat primer
Likely lane: large-part paint booth or continuous line, confirm by product/size
Next: matching assembly lane or QA if engineered
```

or:

```text
Finish: Passivation
Likely lane: passivation room
Next: QA or Shipping depending route
```

## Known Unknowns To Ask Next

- Does `shop coat primer` mean the continuous saddle paint line, large paint booth, or another coating process depending on product size?
- Does `fusion plastic coating` equal the pizza oven + fluidized bed process?
- Which models use enamel versus shop coat versus plastic dip?
- Which products go through Wheelabrator before coating?
- Which products use one-man media booths versus two-man media booth?
- Which stainless products are passivated in-house?
- Are fusion epoxy coatings performed in-house, outsourced, or both?
- Do coating steps happen before or after assembly for Clamps, Patch Clamps, Couplings, and special engineered products?
