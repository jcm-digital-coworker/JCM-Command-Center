# Dynamic Traveler Doctrine

Purpose: define the durable architecture, operating rules, and proven-model guardrails for JCM Command Center Dynamic Travelers.

This document is repo memory. It exists so future traveler work does not drift into generic dashboards, decorative cards, or disconnected workflow panels.

## Core Definition

A Dynamic Traveler is a system-generated dispatch-and-response object for one order at one department step.

It answers, for the current co-worker and department:

1. What do I need to work on?
2. Where do I need to do it?
3. What resource can do the work?
4. What is the best current resource?
5. What is blocking the work?
6. Where does it go next?
7. What action can I take now?

A Dynamic Traveler is not just a page. It is a data object that can be rendered in Workflow, Orders, Plant Map, Support, QA, Maintenance, and Management views.

## Proven Model Guardrails

Dynamic Traveler design should borrow from proven manufacturing models without pretending to be a full enterprise MES on day one.

### ISA-95 / MOM Layering

Use the traveler as a lightweight Manufacturing Operations Management layer between business/order planning and physical work execution.

Architecture direction:

```text
Business / order planning
↓
Dynamic Traveler / Command Center
↓
Departments, resources, material, QA, maintenance
↓
Physical work
```

The traveler should connect production, quality, maintenance, and material signals instead of treating them as separate dashboards.

### MES Dispatch and Response Loop

Every useful traveler should support the loop:

```text
Released order
↓
Department traveler
↓
Co-worker task
↓
Action taken
↓
Response / status update
```

Avoid one-way display-only traveler work. If the screen only shows status and cannot guide or receive action, it is not yet a true traveler.

### Kanban Authorization and Movement Signal

Treat the traveler like a digital kanban/traveler hybrid.

It should authorize or guide:

- make this
- move this
- inspect this
- stage this
- send this next

A material request, move request, issue report, or handoff must be tied to the order/traveler, not left as a floating generic button.

### Theory of Constraints / Flow Protection

Do not rank work only by due date or visible urgency.

Traveler priority should eventually account for:

- readiness
- blockers
- resource capability
- bottleneck impact
- downstream starvation risk
- WIP pileup risk
- due date pressure
- customer or management priority

Early versions may use simpler scoring, but the architecture must leave room for bottleneck-aware prioritization.

### Visual Management

Abnormalities must be obvious.

The traveler should clearly expose states like:

- READY
- BLOCKED
- WAITING ON MATERIAL
- QA HOLD
- NO CAPABLE RESOURCE
- RESOURCE DOWN
- SEND TO NEXT DEPARTMENT

Do not bury the important truth in paragraph text. If a co-worker must infer the next move from six fields, the traveler failed.

### Standard Work by Department

Each department should have repeatable traveler rules.

A traveler is generic in shape but department-specific in instruction.

Examples:

- Receiving asks: Is material here? Where is it staged? Who needs it?
- Machine Shop asks: What resource can run it? Is material staged? Where does it go next?
- Fab asks: What cell, fixture, weld, or fabrication step is needed?
- Coating asks: What prep, coating, booth, oven, or process zone is needed?
- Assembly asks: What station and components are required?
- QA asks: What inspection, hold, or release step is required?
- Shipping asks: Is it packed, staged, documented, and ready to ship?

## Top-Down Traveler Model

Build traveler logic from top down:

```text
Order Blueprint
↓
Department Route
↓
Department Traveler
↓
Co-worker Task
↓
Action / Report / Handoff
```

### Order Blueprint

The blueprint defines what the order is.

Inputs may include:

- order number
- customer
- part / assembly number
- product family
- quantity
- due or projected ship date
- priority
- drawing / revision when available
- required departments
- special requirements
- material requirements
- QA requirements

The order blueprint should not decide every local department action. It provides the skeleton.

### Department Route

The route defines which departments touch the order and in what intended sequence.

Example:

```text
Receiving → Machine Shop → Coating → Assembly → QA → Shipping
```

Not every order touches every department.

### Department Traveler

A department traveler interprets the order for one department.

It should know:

- department
- step status
- current instruction
- capable resources
- best current resource
- blockers
- material signal
- QA signal
- maintenance/resource signal
- next handoff
- available actions

### Co-worker Task

The co-worker task is the individual-facing traveler view.

It should be short and direct:

```text
Run order #104582 on LV-4500.
Material is staged.
QA is clear.
After this step, send it to Coating.
```

### Action / Report / Handoff

Traveler actions must be order-specific.

Starter actions:

- open traveler detail
- request material for this order
- report issue on this order
- report resource cannot run this order
- mark ready for next department
- send to next department
- open full order

Future actions may include barcode scans, completion confirmations, labor assignment, or ERP/MES integration.

## Ownership Model

The system generates the traveler. People maintain the truth that feeds it.

| Owner | Owns |
| --- | --- |
| Sales / Management | priority, due date, customer pressure |
| Engineering | part identity, route, revision, technical requirements |
| Department Lead / Supervisor | local flow rules, preferred resources, escalation rules |
| Production Co-worker | actual work status, issue reports, completion signals |
| Support | material, receiving, staging, QA, release, and handoff blockers |
| Maintenance | resource availability, machine health, service impact |

## Resource Model

Use the word `resource`, not only `machine`.

Resources vary by department:

| Department | Resource Examples |
| --- | --- |
| Receiving | dock, staging zone, material location |
| Machine Shop | machine, chuck, fixture, setup family |
| Fab | work cell, fixture, weld area, forming station |
| Coating | booth, prep area, oven, coating line, process zone |
| Assembly | station, bench, kit area, fixture |
| QA | inspection station, gauge, test method |
| Shipping | staging lane, packaging area, dock |

Machine Shop can be the proof ground, but the data model must support all departments.

## Traveler States

Use a small, clear state set:

- NOT_READY: the department cannot act yet.
- READY: the department can act now.
- ACTIVE: work is currently underway.
- BLOCKED: action is required before work can continue.
- DONE: this department step is complete.
- HOLD: QA, management, engineering, or process hold prevents movement.

State labels shown to users should be blunt and visually distinct.

## Minimum Useful Traveler

A traveler is not useful unless it can answer these seven questions:

1. What order is this?
2. What department step is active?
3. Is this step ready, active, blocked, done, or on hold?
4. What resource can do the work?
5. What is the recommended resource?
6. Where does the order go next?
7. What action can the co-worker take?

If a proposed UI or logic change does not improve one of these answers, challenge it.

## Anti-Patterns

Avoid these mistakes:

- Adding generic panels that do not affect traveler decisions.
- Showing all data fields before showing the next action.
- Making material request a floating workflow action instead of order-specific.
- Hard-coding traveler logic only for Machine Shop.
- Calling something a traveler when it cannot guide action or receive response.
- Ranking work only by due date.
- Treating equipment status as useful without tying it to order/resource capability.
- Building UI before the traveler object exists.

## First Implementation Slice

The first code slice should establish the traveler engine, not a finished MES.

Recommended first implementation:

1. Create dynamic traveler types.
2. Create department resource data.
3. Create a traveler generator from production orders.
4. Support all departments with generic fallback rules.
5. Add stronger Machine Shop resource matching as proof ground.
6. Render Workflow from travelers instead of raw orders.
7. Keep actions demo-safe until writeback flows are defined.

## Expansion Plan

Phase 1: Doctrine and types.

Phase 2: Generic department traveler generator.

Phase 3: Machine Shop proof ground with resource matching.

Phase 4: Order-specific material request action.

Phase 5: Department rule packs for Receiving, Fab, Coating, Assembly, QA, Shipping, Support, and Maintenance.

Phase 6: Bottleneck-aware priority and constraint signals.

Phase 7: Actual status writeback and scan/confirmation flows.

## Decision Rule

Before changing Workflow, Orders, Plant Map, Material, QA, Maintenance, or department routing, ask:

```text
Does this help the co-worker know what to work on, where to do it, what resource to use, what is blocking it, where it goes next, or what action to take?
```

If not, do not build it as part of Dynamic Traveler work.
