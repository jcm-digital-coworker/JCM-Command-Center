# JCM Website Product Infrastructure Intake

Purpose: capture public JCM website product/category/documentation intelligence that can support JCM Command Center traveler logic, product-family classification, routing hints, and operator context.

This document is not plant truth. Website information describes public product structure. The Plant Department Reality Map describes actual shop ownership, resources, and routing.

## Source Boundary

Public source reviewed:

- https://www.jcmindustries.com/
- https://www.jcmindustries.com/products/
- https://www.jcmindustries.com/product-category/repair-fittings/
- https://www.jcmindustries.com/product-category/branching-fittings/
- https://www.jcmindustries.com/product-category/engineered-fittings/
- https://www.jcmindustries.com/products/product-specifications/

Use this public information for:

- product taxonomy
- model number lookup
- product-family tags
- traveler classification hints
- document/resource links
- UI labels
- sales/order intake validation

Do not use website information to override plant floor reality.

## Top-Level Website Product Structure

The public website groups products into these main lines:

- Repair Fittings
- Connection Fittings
- Branching Fittings
- Engineered Fittings
- Tools & Accessories

The website describes JCM as a manufacturer of pipe fittings and fabrications for repair, connection, and branching applications.

## Useful App Implications

These top-level product lines can become high-level app classification tags:

```text
Repair
Connection
Branching
Engineered
Tools / Accessories
```

These should support, but not replace, the internal production route map.

## Capability / Scope Signals

Website capability language includes:

- repair, connection, and branching applications
- pipe sizes from 1/2 inch through 144 inch and larger
- transmission, distribution, service, wastewater, irrigation, and other pipelines
- Cast Iron
- Ductile Iron
- Concrete Steel Cylinder
- Reinforced Concrete
- Asbestos Cement
- PVC
- HDPE
- Steel
- Glass Fiber Reinforced Pipe
- large diameter sizes
- high working pressure
- exotic / non-standard pipe diameters
- limited-space applications
- underwater applications
- customer-designed piping appurtenances
- compromised-integrity pipe applications
- fabrication to accommodate out-of-round pipe

## Traveler Implications From Capabilities

Potential future order/traveler tags:

- emergency / JIT
- large diameter
- high pressure
- exotic diameter
- limited space
- underwater
- customer-designed
- compromised pipe integrity
- out-of-round accommodation
- pipe material type

These tags may matter for:

- engineering required
- management priority
- QA documentation
- production routing
- special handling
- customer urgency

## Repair Fittings Product Groups

Public repair fitting groups include:

- All 316 Stainless Steel UCC
- All Other Products
- Fabricated Repair Fittings
- Joint Repair Clamps
- Multi Band UCC
- Patch Clamps
- Single Band UCC
- Tapped Outlet UCC

Representative website models include:

- 101 Universal Clamp Coupling - Single Band - Standard Range
- 102 Universal Clamp Coupling - Multi Band - Extended Range
- 103 Tapped Universal Clamp - Standard Range
- 104 Tapped Universal Clamp - Extended Range
- 105 Collar Leak Clamp
- 106 Bell Joint Leak Clamp for IPS PVC
- 108 Universal Clamp Coupling - Sewer Clamp
- 110 Patch Clamp
- 111 Full- Repair Clamp
- 112 Heavy Duty Patch Clamp
- 113 Multi Band Heavy Duty Patch Clamp
- 114 Mechanical Joint Split Repair Sleeve
- 114 Mechanical Joint Bell Repair Sleeve
- 116 Repair Sleeve for Concrete Steel Cylinder Pipe
- 118 Fabricated Repair Sleeve
- 131 Universal Clamp Coupling All Stainless Steel - Standard Range - Cast Lug
- 132 Universal Clamp Coupling All Stainless Steel - Extended Range - Cast Lug
- 136 All Stainless Heavy Duty Repair Clamp
- 143 Bell Joint Leak Clamp
- 6131 All 316 Stainless Steel UCC - Standard Range - Cast Lug
- 6132 All 316 Stainless Steel UCC - Extended Range - Cast Lug
- 6136 All 316 Stainless Steel Heavy Duty Repair Clamp

## Repair Traveler Implications

Repair product travelers may need to distinguish:

- UCC single band
- UCC multi band
- tapped outlet UCC
- patch clamp
- heavy duty patch clamp
- repair sleeve
- bell joint leak clamp
- stainless vs non-stainless
- standard range vs extended range
- cast lug vs fabricated lug

These distinctions may map to different departments, material handling requirements, coating routes, assembly steps, and QA/documentation needs.

## Connection Fittings Product Signals

Representative website models include:

- 201 Steel Coupling
- 202 Long Steel Coupling
- 210 Ductile Iron Coupling
- 213 Reducing Ductile Iron Coupling
- 230 Stainless Steel Stiffener 6 inch Width
- 242 Ductile Iron Optimum Range Long Length
- 262 Fabricated Stainless Steel Coupling
- 303 Fabricated Flanged Adapter
- 309 Fabricated Dismantling Joint
- 362 Fabricated Stainless Steel Flanged Adapter
- 4262 All 304 Stainless Steel Bolted Coupling
- 6262 All 316 Stainless Steel Bolted Coupling
- 631 Asbestos Cement Coupling Restrainer

## Connection Traveler Implications

Connection products may need tags for:

- steel coupling
- ductile iron coupling
- reducing coupling
- stainless fabricated coupling
- flanged adapter
- dismantling joint
- stiffener
- restrainer
- all 304 stainless
- all 316 stainless

## Branching Fittings Product Groups

Public branching fitting groups include:

- All Other Products
- Carbon Steel Tapping Sleeves
- Service Saddles
- Stainless Steel Tapping Sleeves

Representative website models include:

- 401 Single Strap Service Saddle
- 402 Double Strap Service Saddle
- 403 Wide Body Service Saddle
- 404 Service Saddle with Double Stainless Steel Straps
- 405 Coated Wide Body Stainless Steel
- 406 Coated with Double Stainless Steel Straps
- 407 Coated Single Strap Electro Galvanized
- 408 Coated Double Strap Electro Galvanized
- 411 Plain Outlet Tapping Sleeve
- 412 Fabricated Steel Tapping Sleeve
- 414 Mechanical Joint Tapping Sleeve
- 415 Concrete Steel Cylinder Pipe Tapping Sleeve
- 416 Weld-On Tapping Sleeve
- 417 Weld-On Tapping Sleeve
- 418 Threaded Outlet Tapping Sleeve
- 419 Fabricated Tapping Sleeve - Mechanical Joint Outlet
- 422 Fabricated Tapping Sleeve - PVC Steel
- 425 Concrete Steel Cylinder Pipe Service Saddle
- 429 Fabricated Tapping Sleeve - PVC Steel - Mechanical Joint Outlet
- 432 Stainless Steel Tapping Sleeve with Full Circumferential Gasket
- 438 Stainless Steel Threaded Outlet Tapping Sleeve
- 439 Stainless Steel Tap Sleeve - Mechanical Joint Outlet
- 452 Stainless Steel Tapping Sleeve with Outlet Seal Gasket
- 459 Stainless Steel Tapping Sleeve Outlet Seal Gasket Mechanical Joint Outlet
- 462 Stainless Steel Tapping Sleeve - Carbon Steel Flange
- 464 Stainless Steel Tapping Sleeve - Outlet Seal - Carbon Steel Flange
- 465 Stainless Steel Tapping Sleeve - Outlet Seal - Carbon Steel Mechanical Joint Outlet
- 469 Stainless Steel Tapping Sleeve Full Gasket Carbon Steel Mechanical Joint Outlet
- 502 Stainless Steel Service Saddles
- 6432 All 316 Stainless Steel Tapping Sleeve with Full Circumferential Gasket
- 6438 All 316 Stainless Steel Threaded Outlet Tapping Sleeve
- 6439 All 316 Stainless Steel MJ Outlet Tapping Sleeve with Full Circumferential Gasket
- 6452 All 316 Stainless Steel Tapping Sleeve with Outlet Seal Gasket
- 6459 All 316 Stainless Steel MJ Outlet Tapping Sleeve with Outlet Seal Gasket

## Branching Traveler Implications

Branching products may need tags for:

- service saddle
- single strap
- double strap
- wide body
- coated saddle
- electro galvanized
- tapping sleeve
- carbon steel tapping sleeve
- stainless steel tapping sleeve
- threaded outlet
- mechanical joint outlet
- carbon steel flange
- outlet seal gasket
- full circumferential gasket
- all 316 stainless

These tags will matter for Saddles Dept, Coating, Fab, Assembly, QA, and Shipping rule packs.

## Engineered Fittings Product Groups

Public engineered fitting groups include:

- Branching
- Connection
- Repair

Representative website models include:

- 114 Mechanical Joint Split Repair Sleeve
- 114 Mechanical Joint Bell Repair Sleeve
- 116 Repair Sleeve for Concrete Steel Cylinder Pipe
- 118 Fabricated Repair Sleeve
- 412 Fabricated Steel Tapping Sleeve
- 414 Mechanical Joint Tapping Sleeve
- 415 Concrete Steel Cylinder Pipe Tapping Sleeve
- 440 Line Stop Fitting
- 801 Expansion Joint - Single End
- 802 Expansion Joint - Double End
- 820 Spool Fabricated Plain End Tee
- 822 Spool Fabricated Flange x Tee
- 823 Bypass Tee
- 831 Flange x Flange with Test Outlet
- 832 Flange x Flange without Test Outlet
- 833 Flange x Plain End with Test Outlet
- 834 Flange x Plain End without Test Outlet

## Engineered Traveler Implications

Engineered products may require stronger workflow signals:

- engineering required
- custom fabrication
- unusual pipe diameter
- special application
- test outlet presence
- flange/plain end configuration
- repair/connection/branching sub-type
- documentation and QA review

## Product Documentation Infrastructure

The website exposes important product information resources:

- Product Catalog
- Current Price Book PDF
- Current Price Book Excel
- Engineering Manual
- American Iron and Steel / Buy American information
- Browse Product Specifications
- Browse Installation Instructions
- JCM High Density Polyethylene Pipe Fittings Manual
- Industry Cross Reference Chart

## App Build Opportunities

Website-derived infrastructure can feed these app systems:

### 1. Product Family Classifier

Map model numbers to high-level families:

```text
101 / 102 / 131 / 132 / 6131 / 6132 → UCC / clamp coupling
110 / 112 / 113 → patch clamp
114 / 116 / 118 / 136 → fabricated repair / repair sleeve
401-408 / 425 / 502 → service saddle
411-419 / 422 / 429 / 432 / 438 / 439 / 452 / 459 / 462 / 464 / 465 / 469 / 6432 / 6438 / 6439 / 6452 / 6459 → tapping sleeve / branching
801-834 → engineered connection/spool/flange/plain-end work
```

### 2. Traveler Rule Hints

Use product-family tags to infer possible traveler steps:

- service saddle → Saddles Dept / Coating / Assembly / QA / Shipping
- tapping sleeve → Fab / Coating / QA / Shipping, exact rules pending plant reality map
- UCC → Clamps or Patch Clamps / Coating / Assembly / QA / Shipping, exact rules pending
- fabricated repair sleeve → Fab / Coating / Assembly / QA / Shipping, exact rules pending
- engineered spool/flange work → Engineering / Material Handling / Machine Shop / Fab / Coating / QA / Shipping, exact rules pending

### 3. Order Intake Validation

If an order model number is known, the app can pre-tag:

- public product line
- likely product family
- likely complexity
- possible departments
- likely documentation requirements

### 4. Document Links

Future app views should support links to:

- product specs
- installation instructions
- engineering manual
- product catalog
- HDPE fittings manual
- AIS/BABA compliance

## Guardrail

Public website taxonomy is helpful, but production routing must be validated against the Plant Department Reality Map before code uses it for traveler dispatch.

Do not automatically route an order only because the website groups the product a certain way.
