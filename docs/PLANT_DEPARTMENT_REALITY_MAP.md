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

# Receiving

## Status

Receiving stands alone as its own department.

It is fed by incoming supplies and is responsible for organizing incoming material and feeding other departments.

## Department Ownership

Receiving owns or strongly influences:

- Incoming supplies.
- Initial material receipt.
- Material organization.
- Feeding material to downstream departments.
- Material readiness truth for travelers.

## Dynamic Traveler Implications

Receiving travelers should not be treated as generic checklist cards. They need to answer whether material is physically present, organized, and ready to feed the next department.

Receiving should be modeled as the first material truth gate for many routes.

## Receiving Traveler Questions

A Receiving Department Traveler should answer:

1. Has incoming material/supply arrived?
2. Is it organized and identifiable?
3. Which department needs it next?
4. Is the material staged or still waiting?
5. Is there a receiving blocker?
6. Is the order waiting on Receiving before production can start?
7. What is the next handoff?

## Known Unknowns / Needs Confirmation

- Exact receiving staging zones.
- How received material is labeled or tracked today.
- Which departments are most commonly fed directly by Receiving.
- Whether Receiving owns any internal delivery/movement after organization.

---

# Machine Shop

## Status

Machine Shop stands alone as its own department.

It is fed by Receiving and produces components for larger assemblies later in the plant.

Machine Shop turns raw RFWN spigots into 440-series and 449-series spigots. Outlet sizes range from 4 inches to 36 inches.

For 4 inch to 12 inch outlet sizes, spigots may be threaded or push pin.

Only certain machines can run certain sizes and part families. Machine Shop traveler logic must be resource-specific and size-aware.

## Department Ownership

Machine Shop owns or strongly influences:

- RFWN spigot machining.
- 440-series spigots.
- 449-series spigots.
- Push pin spigots.
- Threaded spigots.
- Push plugs.
- Threaded plugs.
- ANSI flanges.
- Class D flanges.
- Grooved flat plate that was burned in Material Handling.
- Facing short pipe.
- Some CC couplings.
- Manual drilling/lathe support work.

## Known Resources

### CNC / Primary Machines

| Resource | Known Work | Size / Range Notes | Traveler Implication |
| --- | --- | --- | --- |
| DMG Mori | Push plugs for push pin spigots. Non-threaded push plugs seal inside spigots. Also runs threaded plugs. | Push plugs: 4 inch to 24 inch. Threaded plugs: 4 inch to 12 inch. | Should appear for push plug and threaded plug traveler operations in range. |
| Mori Seiki | Threaded and push pin spigots. Also ANSI flanges and Class D flanges. | Spigots: 4 inch to 16 inch only. Flanges typically 10 inch to 16 inch. | Should not appear for spigots larger than 16 inch. Larger work should route to Yama Seiki. |
| Yama Seiki | Mostly large parts. Push pin spigots and matching plugs. Class D flanges and ANSI flanges. | Push pin spigots: 16 inch to 36 inch. Flanges: 14 inch to 36 inch. | Primary large-part machine. Should receive larger spigot/flange work. |
| WIA KH-80 | Drills, rigid taps, and threadmills the outside rim of push pin spigots that hold push plugs inside. | All push pin sizes go through this machine. | Push pin spigots must include a KH-80 step. |
| Quickmill Intimidator | Mills grooves in flat plate burned out in Material Handling. | Various sizes. Carbon steel / general plate groove work unless otherwise refined. | Should be tied to upstream Material Handling burn-table output. |
| WIA L300C | Mostly one-off machine. Smaller Class D flanges, smaller ANSI flanges, facing short pipe, and some CC couplings. | Smaller flange/one-off work. Exact size limits need confirmation. | Should be used carefully for one-off/smaller work, not generic large work. |
| G&L mill | Runs the same type of grooved plate work as the Intimidator, but in stainless. | Stainless groove work. | Stainless plate groove travelers should prefer G&L over Intimidator. |

### Manual / Support Equipment

| Resource | Known Work | Notes |
| --- | --- | --- |
| American Hole Wizard radial arm drill | Manual drilling support. | Exact traveler use cases need confirmation. |
| Manual horizontal short bed lathe | Manual lathe support. | Exact traveler use cases need confirmation. |

## Product / Operation Rules

### RFWN Spigots

Machine Shop turns raw RFWN spigots into 440-series and 449-series spigots.

Known outlet range:

- 4 inch to 36 inch outlet size.
- 4 inch to 12 inch can be threaded or push pin.

### Push Plugs / Threaded Plugs

- DMG Mori runs push plugs for push pin spigots.
- Push plugs are non-threaded plugs that seal the inside of the spigots.
- DMG Mori push plug range: 4 inch to 24 inch.
- DMG Mori threaded plug range: 4 inch to 12 inch.
- Yama Seiki runs plugs that go with larger push pin spigots when applicable.

### Spigots

- Mori Seiki runs threaded and push pin spigots from 4 inch to 16 inch only.
- Yama Seiki runs larger push pin spigots from 16 inch to 36 inch.
- WIA KH-80 is required for all push pin sizes because it drills, rigid taps, and threadmills the outside rim that holds the push plugs inside.

### Flanges

- Mori Seiki runs ANSI flanges and Class D flanges, typically 10 inch to 16 inch.
- Yama Seiki runs Class D flanges and ANSI flanges from 14 inch to 36 inch.
- WIA L300C runs smaller Class D flanges and smaller ANSI flanges.

### Plate Groove Work

- Material Handling burns flat plate.
- Quickmill Intimidator mills grooves in flat plate from Material Handling.
- G&L mill runs the same groove work as Intimidator, but in stainless.

## Bottleneck / Risk Notes

Known Machine Shop risks:

- Machine capability is size-specific.
- Push pin work requires multiple resources/steps, including KH-80.
- Large spigot/flange work should not be offered to smaller machines.
- Stainless plate groove work should not be treated like carbon/general plate groove work.
- Material Handling burn output feeds some Machine Shop groove work.

## Dynamic Traveler Implications

Machine Shop travelers must not show every machine as an option.

Resource recommendations must account for:

- Product family.
- Operation type.
- Size range.
- Threaded vs push pin.
- Push plug vs threaded plug.
- Flange type.
- Stainless vs non-stainless groove work.
- Upstream Material Handling burn dependency.

If a machine cannot run the size, material, or operation, it must not appear as a capable resource.

## Machine Shop Traveler Questions

A Machine Shop Department Traveler should answer:

1. What is the operation: spigot, push plug, threaded plug, flange, groove, facing, coupling, manual support?
2. What size/range is this work?
3. Is it threaded, push pin, plug, flange, stainless groove, or general groove work?
4. Which machine can actually run it?
5. Is there a required secondary operation, such as KH-80 for push pin spigots?
6. Is upstream Material Handling output required before machining?
7. Where does the completed component go next?

## Known Unknowns / Needs Confirmation

- Exact relationship between 440-series vs 449-series and threaded/push pin routing.
- Exact L300C size limits for smaller flanges.
- Exact CC coupling work run on L300C.
- Which parts require American Hole Wizard or manual horizontal short bed lathe.
- Whether 16 inch boundary between Mori Seiki and Yama Seiki is inclusive, overlap, or depends on part family.

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

---

# Coating

## Status

Coating is one of the largest areas in the plant.

Current knowledge is rough and needs more confirmation. Coating shares its supervisor with Shipping, which is located across the shop.

Coating has at least three coating types:

1. Plastic dip.
2. Enamel.
3. Shop coat.

## Department Ownership

Coating owns or strongly influences:

- Surface preparation.
- Wheelabrator/media blasting for non-service-saddle parts.
- Media cleanup of weld BBs and other manufacturing imperfections.
- Enamel coating.
- Plastic dip coating.
- Shop coat.
- Saddle shop coat line.
- Large-part paint booth work.
- Strap, patch clamp, and clamp media blasting.
- Passivation.

## Known Resources

### Surface Prep / Media

| Resource | Known Work | Current Known Status |
| --- | --- | --- |
| Wheelabrator | Media-cleans non-service-saddle parts, removes weld BBs and manufacturing imperfections. Uses abrasive shot from a wheel-style delivery system. Known to be rough on itself / eats itself. | Needs current status confirmation |
| One-man media booth #1 | Used for straps for saddles, patch clamps, and regular clamps. | Needs confirmation |
| One-man media booth #2 | Used for straps for saddles, patch clamps, and regular clamps. | Needs confirmation |
| One-man media booth #3 | Used for straps for saddles, patch clamps, and regular clamps. | Needs confirmation |
| Two-man media booth | Larger media booth for similar work. | Needs confirmation |

### Coating / Paint

| Resource | Known Work | Current Known Status |
| --- | --- | --- |
| Continuous shop coat paint line | Runs shop coat for saddles. Slow but effective. | Needs current status confirmation |
| Large-part paint booth | Paint booth for larger parts. | Needs current status confirmation |
| Enamel spray booths | Enamel coating. There may be three spray booths. | Count/status needs confirmation |
| Pizza oven | Heats parts before plastic dip. | Needs current status confirmation |
| Fluidized plastic coating bed | Plastic dip coating, typically saddles only. | Needs current status confirmation |

### Chemical / Passivation

| Resource | Known Work | Current Known Status |
| --- | --- | --- |
| Passivation room | Various water and chemical baths. | Needs confirmation |

## Known Coating Flows

### Non-Service-Saddle Parts

For non-service-saddle products:

1. Parts go into the Wheelabrator.
2. Wheelabrator media-cleans parts.
3. It removes weld BBs and other manufacturing imperfections.
4. Parts move to coating based on required finish.

### Enamel

- Enamel is applied in spray booths.
- Number of enamel spray booths is believed to be three, but needs confirmation.

### Plastic Dip

- Parts are heated in the pizza oven.
- Parts are dipped in the fluidized plastic coating bed.
- Plastic dip is typically saddles only.

### Shop Coat

- Shop coat runs on a continuous paint line for saddles.
- The line is slow but effective.

### Media Booths

- Three one-man media booths and one two-man media booth are used for straps for saddles, patch clamps, and regular clamps.

### Passivation

- Passivation room has various water and chemical baths.
- Specific products/processes need confirmation.

## Bottleneck / Risk Notes

Known Coating risks:

- Coating is a very large area with many resources/process states.
- Supervisor is shared with Shipping across the shop, which may create oversight/communication drag.
- Wheelabrator is failure-prone or maintenance-prone.
- Continuous paint line is slow.
- Plastic dip requires oven heat before coating bed.
- Process sequencing matters: prep/cleaning before coating, heating before plastic dip, cure/wait states may matter.

## Dynamic Traveler Implications

Coating travelers should be process-specific, not one generic Coating step.

They may need to distinguish:

- Wheelabrator prep.
- Media booth prep.
- Enamel spray booth.
- Plastic dip oven heat.
- Fluidized bed dip.
- Shop coat paint line.
- Large-part paint booth.
- Passivation.
- Cure/wait/hold states.

Coating should expose when a part is waiting on prep, coating, heat, dip, cure, passivation, or supervisor/QA release.

## Coating Traveler Questions

A Coating Department Traveler should answer:

1. What coating type is required: plastic dip, enamel, or shop coat?
2. What prep is required: Wheelabrator, one-man media, two-man media, or passivation?
3. What coating resource can run it?
4. Does the part need oven heat first?
5. Is the part in a cure/wait/hold state?
6. Is the part a saddle, strap, patch clamp, regular clamp, larger part, or other product family?
7. Where does the order go after Coating?

## Known Unknowns / Needs Confirmation

- Exact number of enamel spray booths.
- Names/numbers of spray booths.
- Exact product rules for plastic dip vs enamel vs shop coat.
- Whether service saddles bypass Wheelabrator or follow a different prep route.
- Which product families use passivation.
- Cure times or hold rules.
- Current status of Wheelabrator, paint line, booths, oven, bed, and passivation room.

## Immediate App Correction

Coating should not be modeled as a single generic coating resource.

Coating needs process-specific traveler rules and resource states.
