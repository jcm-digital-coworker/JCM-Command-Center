# Assembly and Product Line Reality Map

Purpose: preserve the real JCM downstream assembly structure so Dynamic Traveler routing does not collapse multiple product-line assembly lanes into one generic Assembly department.

This document expands the Plant Department Reality Map and should guide traveler routing after Coating and for integrated product-line departments.

## Core Correction

Assembly is not one generic department.

Assembly work is separated by upstream Fab lane and by product line.

Some product lines do not route through a shared Assembly bucket at all. Their assembly work is integrated inside their own departments.

## High-Level Rule

Do not assume:

```text
Coating → Assembly
```

Instead, route based on the product/fab lane:

```text
Special Fab → Coating → Special Assembly
412 Fab → Coating → 412 Assembly
432 Fab → Coating → 432 Assembly
452 Fab → Coating → 452 Assembly
Coupling fabrication / press-building coupling work → Coating or direct path as confirmed → Couplings Assembly
Receiving → Coating → Saddles Dept integrated assembly
Patch Clamp product line → Patch Clamp stand-alone department
Clamps product line → Clamps integrated build/assembly
```

Exact coating-to-assembly details and exceptions need confirmation.

## Assembly Lanes

### Special Assembly

Special Assembly builds for Special Fab.

Known route relationship:

```text
Special Fab
↓
Coating
↓
Special Assembly
```

Needs confirmation:

- Whether Large Body and Specialized Welding also feed Special Assembly.
- Whether Special Assembly handles industrial/West Wing work or if that has its own assembly path.
- What components or kits Special Assembly typically installs.

### 412 Assembly

412 Assembly builds for 412 Fab.

Known route relationship:

```text
412 Fab
↓
Coating
↓
412 Assembly
```

Known product logic:

- Related to 412 carbon steel small-body / 12 inch and under outlet fabrication.

Needs confirmation:

- Whether 412 Assembly handles only model 412 or related carbon steel tapping sleeve variants.
- What size thresholds apply.
- Whether all 412 Fab output goes to 412 Assembly after Coating.

### 432 Assembly

432 Assembly builds for 432 Fab.

Known route relationship:

```text
432 Fab
↓
Coating
↓
432 Assembly
```

Known product logic:

- Stainless equivalent to 412-style assembly.

Needs confirmation:

- Whether 432 Assembly handles only model 432 or other stainless tapping sleeve variants.
- Whether it mirrors 412 Assembly process exactly or has stainless-specific differences.

### 452 Assembly

452 Assembly builds for 452 Fab.

Known route relationship:

```text
452 Fab
↓
Coating
↓
452 Assembly
```

Known product logic:

- Stainless large body / large outlet work from 452 Fab.

Needs confirmation:

- Size thresholds.
- Components installed here.
- Whether 452 Assembly handles other stainless large-body products.

### Couplings Assembly

Couplings is the assembly department for coupling products.

Known relationship:

- Coupling-related fabrication occurs in the Press Building, which is part of Material Handling.
- Couplings Assembly handles assembly for coupling products.

Needs confirmation:

- Exact route from Press Building coupling fabrication to Couplings Assembly.
- Whether coupling products go through Coating before Couplings Assembly, after assembly, or both depending on product.
- Which coupling product families route here: UCC, steel coupling, fabricated coupling, stainless coupling, etc.
- Whether Couplings Assembly is a standalone department or a lane inside broader Assembly.

## Product-Line Departments With Integrated Assembly

Some product lines have their assembly built into their own departments rather than a shared Assembly area.

### Saddles Dept

Saddles are a different product line and their assembly is integrated within Saddles Dept.

Known flow:

- Uncoated saddle castings are shipped in.
- Saddle castings come through Receiving.
- Uncoated saddles move from Receiving to Coating.
- Coating coats the saddles.
- Coated saddles move to Saddles Dept.
- Straps are sheared in the Press Building.
- The two LV4500 machines are in Saddles Dept, not Machine Shop.
- Saddles Dept assembles saddle products.

Known route:

```text
Receiving
↓
Coating
↓
Saddles Dept
```

Parallel / dependency route:

```text
Press Building shears straps
↓
Saddles Dept
```

Important correction:

- The two LV4500 machines belong to Saddles Dept, not Machine Shop.
- Uncoated saddles come from Receiving to Coating, then move to Saddles Dept.

Traveler implications:

- Saddles traveler logic must include Receiving/coating of uncoated saddle castings, strap readiness from Press Building, LV4500 work, and Saddles Dept assembly.
- Saddles should not be routed to generic Assembly unless confirmed as an exception.
- Saddles should not be routed through Machine Shop just because LV4500s are machine resources. LV4500 ownership is Saddles Dept.

Needs confirmation:

- What the LV4500s do for saddle production.
- Whether both LV4500s have the same capability.
- Which saddle models use the LV4500s.
- Whether saddle straps always come from the Press Building.
- Exact coating type/process for uncoated saddle castings.
- Whether straps are coated before or after LV4500/Saddles Dept work.

### Clamps Dept

Clamps are a different product line and their assembly is integrated within Clamps Dept.

Known flow:

- Material for Clamps is sheared in the Press Building.
- Clamps are built and assembled in Clamps Dept.

Traveler implications:

- Clamps should be modeled as its own product-line department with integrated build and assembly.
- Press Building shear work is an upstream dependency.
- Clamps should not be routed through generic Assembly unless confirmed.

Needs confirmation:

- Which clamp products belong here versus Patch Clamp.
- Whether clamp material is always sheared in the Press Building.
- Whether Clamps go through Coating before or after assembly, or by product type.

### Patch Clamp Dept

Patch Clamp is stand-alone.

Known flow:

- Patch Clamp is its own product-line department.
- Patch Clamp assembly is not part of generic Assembly.

Traveler implications:

- Patch Clamp should have a dedicated traveler lane/department.
- Patch Clamp should not be collapsed into Clamps or generic Assembly without confirmation.

Needs confirmation:

- Where Patch Clamp material comes from.
- Whether Patch Clamps use Press Building shear work.
- Whether Patch Clamps go through Coating.
- What resources/equipment exist inside Patch Clamp.

## Downstream Routing Corrections

The older generic route:

```text
Fab → Coating → Assembly
```

is only partially correct.

Better route logic:

```text
Fab lane → Coating → matching assembly lane
```

Examples:

```text
412 Fab → Coating → 412 Assembly
432 Fab → Coating → 432 Assembly
452 Fab → Coating → 452 Assembly
Special Fab → Coating → Special Assembly
```

Product-line routes may bypass generic Assembly entirely:

```text
Receiving → Coating → Saddles Dept
Press Building straps → Saddles Dept
Press Building shear → Clamps Dept build/assembly
Patch Clamp product line → Patch Clamp stand-alone department
```

## Dynamic Traveler Implications

Traveler routing must distinguish:

- shared Assembly lanes
- Fab-lane-specific assembly
- Couplings Assembly
- Saddles Dept integrated assembly
- Clamps Dept integrated assembly
- Patch Clamp stand-alone assembly

A traveler should not simply say:

```text
Send to Assembly.
```

when the real instruction is:

```text
Send to 432 Assembly.
```

or:

```text
Send coated saddle to Saddles Dept after Receiving and Coating are complete; confirm Press Building straps are ready.
```

## Assembly / Product-Line Traveler Questions

A downstream traveler should answer:

1. Is this a Fab-lane assembly, Couplings assembly, Saddles, Clamps, or Patch Clamp path?
2. Which exact assembly lane owns it?
3. Did the correct upstream Fab lane complete it?
4. Did Coating complete the required process, if applicable?
5. Are required components ready: straps, castings, couplings components, sheared material, etc.?
6. Is there a product-line-specific machine dependency, such as the Saddles LV4500s?
7. Where does this go after assembly: QA, Shipping, or another step?

## Known Unknowns / Needs Confirmation

- Exact relationship between Couplings fabrication, Press Building, Coating, and Couplings Assembly.
- Whether Couplings Assembly is standalone or part of broader Assembly in reporting structure.
- Whether Special Assembly also serves Large Body / Specialized Welding / West Wing outputs.
- What happens to West Wing industrial work after Coating.
- Whether product-line departments share supervisors or leads.
- Exact equipment/resources in Special Assembly, 412 Assembly, 432 Assembly, 452 Assembly, Couplings, Saddles, Clamps, and Patch Clamp.
- Coating timing for Clamps, Patch Clamps, and Couplings.
- Exact coating process for saddle castings and straps.
- Whether QA is a separate step after each assembly lane.
- Which finished products go straight to Shipping vs QA first.

## Immediate App Correction

Any app logic that treats Assembly as one generic department is wrong.

Assembly must become a downstream route family made of specific assembly lanes and product-line assembly departments.
