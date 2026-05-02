# Plant Department Reality Map

Purpose: preserve real JCM plant knowledge in the repo so traveler logic, routing, department pages, and resource recommendations match the actual shop instead of generic manufacturing assumptions.

This document is repo memory. Update it whenever plant reality is clarified.

## Core Rule

Do not expand Dynamic Travelers across the plant until the target department's real work ownership, resources, blockers, and handoff behavior are documented here.

Department truth outranks generic app assumptions.

## Current Department List - Known / In Progress

Earlier app context listed these work centers:

- Receiving
- Machine Shop
- Material Handling
- Fab
- Assembly
- Saddles Dept
- Patch Clamps
- Clamps
- Shipping
- Maintenance
- Office

This list is not enough by itself. Each department needs a real operational breakdown before traveler rules are expanded.

---

# Material Handling

## Status

Material Handling is a production department, not merely support, staging, or material movement.

It appears to be a major plant bottleneck and owns several upstream production processes that feed rollers, Machine Shop, coupling work, and forming/press operations.

Material Handling includes work in at least two physical areas:

1. Main / primary Material Handling area.
2. Press Building, which is part of Material Handling but housed separately.

The HK FS-1200 laser table is owned by Material Handling but housed in the main part of the plant.

## Department Ownership

Material Handling owns or strongly influences:

- Burning plate.
- Plasma cutting.
- Laser cutting.
- Rolling material.
- Cutting pipe.
- Cutting bar / round stock.
- Press work.
- Large-diameter coupling expansion.
- Press brake work.
- Some coupling welding work.

## Known Resources

### Plate Burning / Cutting

| Resource | Notes | Current Known Status |
| --- | --- | --- |
| 2016 Messer burn table | Large burn table. Burns plate for rollers and for Machine Shop to groove. | Needs current status confirmation |
| 2006 Alltra plasma table | Older and slower than Messer. Performs similar plate-burning work. | Needs current status confirmation |
| HK FS-1200 laser table | Owned by Material Handling but housed in main plant area. | Needs current status confirmation |

### Rollers

| Resource | Notes | Current Known Status |
| --- | --- | --- |
| Large MG 4-post roller | Used for F-bar material for large ID couplings. | Inoperable currently |
| Small MG 4-post roller | Same function as large MG roller but for smaller ID range. | Inoperable currently |
| 7L roller | Roller in Material Handling. Details/range need confirmation. | Needs current status confirmation |
| Webb 3-post roller #1 | One of two 3-post Webb rollers. | Needs current status confirmation |
| Webb 3-post roller #2 | One of two 3-post Webb rollers. | Needs current status confirmation |
| Unknown additional roller | Present in department, details unknown. | Needs identification |

### Saws

| Resource | Notes | Current Known Status |
| --- | --- | --- |
| Self-feeding saw #1 | Cuts pipe and bar/round stock. | Needs current status confirmation |
| Self-feeding saw #2 | Cuts pipe and bar/round stock. | Needs current status confirmation |

### Press Building

The Press Building is part of Material Handling but is its own building. It houses presses and the large-diameter Beckwood expander.

| Resource | Notes | Current Known Status |
| --- | --- | --- |
| Beckwood large-diameter expander | Expands couplings out to true diameters. Major capability. | Needs current status confirmation |
| Bliss 300-ton press | Press Building resource. | Needs current status confirmation |
| 250-ton press | Press Building resource. | Needs current status confirmation |
| 120-ton press | Press Building resource. | Needs current status confirmation |
| Baileigh CNC press brake | Press brake in Press Building / Material Handling ownership. | Needs current status confirmation |
| Coupling welder/co-worker #1 | Material Handling owns two coupling welding co-worker roles. | Staffing/name/shift needs confirmation |
| Coupling welder/co-worker #2 | Material Handling owns two coupling welding co-worker roles. | Staffing/name/shift needs confirmation |

## Production Flows Material Handling Feeds

Material Handling appears to feed:

- Rollers.
- Machine Shop, especially plate or material that will be grooved.
- Coupling production.
- F-bar / large ID coupling material.
- Forming and press operations.
- Downstream Fab, Assembly, or department-specific routing depending on product type.

Exact product-family routes need confirmation.

## Bottleneck Notes

Material Handling is a big bottleneck area.

Known bottleneck risks:

- Large MG 4-post roller is currently inoperable.
- Small MG 4-post roller is currently inoperable.
- Messer vs Alltra capacity/speed difference matters.
- Press Building is physically separate, so route visibility and handoff clarity matter.
- HK FS-1200 laser table is owned by Material Handling but physically located elsewhere, so ownership and location must both be shown.
- Unknown roller exists and needs identification before traveler logic relies on it.

## Dynamic Traveler Implications

Material Handling travelers must not be treated as generic material staging travelers.

They need production-specific resource logic for:

- burn table work
- plasma table work
- laser table work
- roller work
- saw cutting
- press work
- press brake work
- expansion work
- coupling welding

Material Handling resources should appear as capable options only when they can actually perform the needed operation.

If a roller or press is down or inoperable, travelers should expose that as a blocker or unavailable resource, not a hidden detail.

## Material Handling Traveler Questions

A Material Handling Department Traveler should answer:

1. What operation is required: burn, laser, roll, saw, press, expand, brake, or weld?
2. Which resource can perform the operation?
3. Is the recommended resource available, down, slower, or physically in another building?
4. Is the material ready for the operation?
5. What downstream department needs this material next?
6. Is this feeding Machine Shop, rollers, coupling work, or another route?
7. What is the handoff after Material Handling completes its step?

## Known Unknowns / Needs Confirmation

- Exact official names for all rollers.
- Capability/range of 7L roller.
- Capability/range of both Webb 3-post rollers.
- Identification and capability of the additional unknown roller.
- Current status of Messer, Alltra, HK laser, saws, presses, press brake, and Beckwood expander.
- Which product families use each Material Handling resource.
- Whether coupling welders are formally assigned to Material Handling or shared with another department in reporting structure.
- Typical handoff routes after each Material Handling operation.

## Immediate App Correction

Any app logic that treats Material Handling as only staging/support is wrong.

Material Handling should be modeled as a production department with its own resources, bottlenecks, operation types, and traveler rules.
