# Fab Department Reality Map

Purpose: preserve real JCM Fab department knowledge for Dynamic Traveler routing, resource filtering, work ownership, and department-specific traveler rules.

This document expands the Plant Department Reality Map. It should be treated as repo memory for Fab-specific logic.

## Core Correction

Fab is not one generic welding/fabrication department.

Fab is split into several fabrication lanes/departments. Traveler logic must distinguish these lanes by product family, body size, outlet size, material, and industrial/specialized status.

## Department Structure

Fab includes at least these lanes:

1. Special Fab
2. Large Body
3. Specialized Welding
4. 412 Fab
5. 432 Fab
6. 452
7. West Wing / Industrial Welders

Some of these may be physical areas, production lanes, department subgroups, or commonly used shop-floor names. Exact reporting/supervisor structure needs confirmation.

## Department Feed

All Fab lanes are fed by:

- Machine Shop
- Material Handling

Machine Shop and Material Handling make components. Fab welds those components into assemblies.

## Department Handoff

After Fab completes its work, everything moves to Coating for the next step.

Known general route:

```text
Machine Shop + Material Handling
↓
Fab lane
↓
Coating
```

## Overall Fab Ownership

Fab owns or strongly influences:

- Carbon steel fabrication.
- Stainless fabrication.
- Body fabrication.
- Outlet fabrication.
- Specialized welding.
- Industrial welding.
- Welding Machine Shop components and Material Handling components into assemblies.
- Sending fabricated assemblies to Coating.

## Fab Lanes

### Special Fab

Special Fab handles specialized fabrication work.

Known work:

- Mostly carbon steel fabrication.
- Large body work.
- Specialized welding.

Known relationship:

- Special Fab appears closely related to Large Body and Specialized Welding.

Needs confirmation:

- Whether Special Fab, Large Body, and Specialized Welding are separate lanes or overlapping names.
- Product families routed here.
- Size thresholds.
- Material exceptions.

### Large Body

Large Body handles large body fabrication.

Known work:

- Mostly carbon steel fabrication.
- Large body work.

Needs confirmation:

- Size threshold for large body.
- Whether large body includes large outlet or only body diameter/geometry.
- Which product models or product families route here.

### Specialized Welding

Specialized Welding handles specialized welding work.

Known work:

- Mostly carbon steel fabrication.
- Specialized welding.

Needs confirmation:

- What makes welding specialized.
- Whether this includes certified procedures, unusual material, unusual geometry, customer requirements, or industrial work.
- Whether it overlaps with Special Fab or West Wing.

### 412 Fab

412 Fab is the small-body 412 lane.

Known work:

- 412 fabrication.
- Small body.
- 12 inch and under outlet fabrication.
- All carbon steel.

Traveler rule:

- 412 carbon steel products with outlet size 12 inch and under should route to 412 Fab.

Needs confirmation:

- Whether 412 Fab handles only model 412 or related carbon steel tapping sleeve variants.
- Whether the 12 inch threshold is inclusive.
- Whether body size matters separately from outlet size.

### 432 Fab

432 Fab is similar to 412 Fab but stainless.

Known work:

- Same general role as 412 Fab.
- Stainless fabrication.

Traveler rule:

- Stainless work equivalent to 412-style small-body/outlet fabrication should route to 432 Fab.

Needs confirmation:

- Whether 432 Fab handles only model 432 or related stainless tapping sleeve variants.
- Outlet/body size thresholds.
- Whether 432 includes full-circumferential gasket stainless tapping sleeves only or other stainless families.

### 452

452 handles large body and large outlet stainless work.

Known work:

- Large body.
- Large outlet.
- Stainless only.
- Nothing specialized.

Traveler rule:

- Stainless large-body and large-outlet work that is not specialized should route to 452.

Needs confirmation:

- Size threshold for large body/outlet.
- Whether model 452 specifically owns this lane or if 452 is the lane name for multiple stainless large outlet products.
- What qualifies as specialized vs non-specialized.

### West Wing / Industrial Welders

West Wing is the industrial welding area.

Known work:

- Industrial-only work.
- Bodies vary.
- Outlet sizes vary.
- Material grades vary.

Traveler rule:

- Industrial work should route to West Wing instead of normal Fab lanes.

Needs confirmation:

- What product models/families are considered industrial.
- What makes the work industrial: customer, spec, material grade, pressure, size, testing, or documentation.
- Whether West Wing owns all industrial welding or shares with Special Fab.

## Product / Material Routing Signals

Fab traveler routing must consider:

- Product model/family.
- Carbon steel vs stainless.
- Body size.
- Outlet size.
- Specialized vs non-specialized.
- Industrial vs standard.
- Upstream Machine Shop component readiness.
- Upstream Material Handling component readiness.

## Bottleneck / Risk Notes

Known Fab risks:

- Treating Fab as one generic department would hide the real lane assignment.
- Outlet size and material drive routing.
- Stainless and carbon work split into different lanes.
- Industrial work is its own West Wing path.
- Fabrication cannot start until Machine Shop and Material Handling components are ready.
- All Fab output moves to Coating, so Fab delays likely starve Coating or shift coating schedules.

## Dynamic Traveler Implications

Fab Department Travelers should be lane-aware.

They should not simply say:

```text
Work order in Fab.
```

They should say things like:

```text
Fab lane: 412 Fab
Material: Carbon steel
Outlet: 12 inch or under
Upstream: waiting on Machine Shop component / Material Handling component
Next: Coating
```

or:

```text
Fab lane: West Wing
Type: Industrial
Material grade: varies / confirm
Next: Coating
```

## Fab Traveler Questions

A Fab Department Traveler should answer:

1. Which Fab lane owns this work?
2. Is it carbon steel, stainless, or another material grade?
3. What body size and outlet size matter?
4. Is it standard, specialized, large body, large outlet, or industrial?
5. Are Machine Shop components ready?
6. Are Material Handling components ready?
7. Where does it go next after welding/fabrication?

## Known Unknowns / Needs Confirmation

- Exact lane boundaries between Special Fab, Large Body, and Specialized Welding.
- Whether Special Fab / Large Body / Specialized Welding are separate departments, one shared area, or overlapping labels.
- Exact size thresholds for Large Body and 452.
- Whether 12 inch and under outlet rule for 412 is inclusive.
- Whether 432 follows the same 12 inch threshold as 412.
- Which specific product models route to 412, 432, and 452.
- What qualifies an order as industrial for West Wing.
- What makes work specialized.
- Whether all Fab lanes share one supervisor or have different leads.
- Any major Fab equipment, fixtures, tables, weld stations, cranes, or bottleneck tools.

## Immediate App Correction

Any app logic that treats Fab as one generic resource is wrong.

Fab must be modeled as a collection of fabrication lanes with route rules based on material, size, product family, outlet size, and industrial/specialized status.
