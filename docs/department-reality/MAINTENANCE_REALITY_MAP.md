# Maintenance Reality Map

Purpose: preserve real JCM Maintenance operating context so Dynamic Travelers, machine/resource status, and work order flows are built from actual plant reality instead of pretend predictive-maintenance maturity.

## Core Correction

Maintenance is a stand-alone department.

JCM is starting from scratch on machine reliability. The app should not assume mature reliability data, formal downtime codes, predictive maintenance models, or complete machine histories already exist.

The current app already has a quasi-built maintenance work order request system. That should be treated as the starting foundation for reliability data collection.

## Maintenance Role

Maintenance owns or strongly influences:

- Machine/equipment repair response.
- Resource availability truth.
- Machine down / usable status.
- Maintenance request handling.
- Repair history creation.
- Future reliability tracking.

## Current Reliability Maturity

Current state:

```text
Starting from scratch on machine reliability.
```

Implication:

- Do not build complex reliability scoring before basic work-order capture is solid.
- Do not fake MTBF, MTTR, downtime trend, or predictive failure data until actual maintenance records exist.
- Build the first useful loop: report, claim, repair, close, learn.

## Existing App Foundation

The app already contains a maintenance work order request flow in early/quasi-built form.

This should become the reliability backbone:

```text
Production worker / lead reports issue
↓
Maintenance request is created
↓
Maintenance claims or triages request
↓
Repair status is updated
↓
Request is completed / closed
↓
Machine/resource history gains one reliable data point
```

## Dynamic Traveler Implications

Travelers should depend on Maintenance truth when deciding whether a resource is usable.

If a resource is down, inoperable, or blocked by an open maintenance request, the traveler should not recommend it as the best resource.

If the resource is still usable but degraded, the traveler should make that visible instead of hiding it.

Potential traveler states affected by Maintenance:

- AVAILABLE
- BUSY
- DOWN
- DEGRADED
- UNKNOWN
- MAINTENANCE_REQUESTED
- WAITING_ON_MAINTENANCE

## Resource Status Rule

For the early app, keep resource status simple and honest.

Good early states:

```text
Available
Busy
Down
Unknown
```

Possible next states after work-order flow matures:

```text
Degraded
Maintenance Requested
Repair In Progress
Waiting On Parts
Released By Maintenance
```

## Maintenance Traveler / Request Questions

A maintenance-facing work order should answer:

1. What machine/resource has the issue?
2. What department does it affect?
3. Is the resource down or still usable?
4. What order/traveler was affected, if any?
5. Who reported it?
6. When was it reported?
7. Has Maintenance claimed it?
8. Is the repair in progress, waiting, complete, or rejected/no issue found?
9. What notes were added?
10. What production route is being blocked?

## Production Worker View

A production worker should see:

- Whether the resource can be used.
- Whether Maintenance has already been notified.
- Whether another capable resource exists.
- What order/traveler is blocked.
- A simple way to report the issue against the correct order/resource.

Avoid showing maintenance internals that do not help the worker decide what to do next.

## Maintenance View

Maintenance should see first:

- Machine/resource down requests.
- Requests blocking expedited or near-shipping orders.
- Requests blocking bottleneck departments.
- Age of open request.
- Department affected.
- Order/traveler affected when known.
- Repeat issues by machine after enough history exists.

## Priority Implications

Maintenance priority should eventually consider:

```text
Machine down
+ Bottleneck resource
+ Expedited order affected
+ Shipping/JIT impact
+ No alternate capable resource
+ Safety impact
+ Repeat failure
```

Do not start with complicated scoring if the data is not there yet. Start with clear request status and visible production impact.

## Known High-Risk / Problem Resources Mentioned Elsewhere

Current known reliability-sensitive resources from department maps:

- Large MG 4-post roller: inoperable currently.
- Small MG 4-post roller: inoperable currently.
- Wheelabrator: failure-prone / known to eat itself.

These should be validated and eventually represented in resource status data.

## Known Unknowns / Needs Confirmation

- Current maintenance request workflow in the app and what parts are complete.
- Who can submit maintenance requests.
- Who can claim/close maintenance requests.
- Whether Maintenance uses any current paper, verbal, whiteboard, or software system.
- How machine down status is declared today.
- Whether Maintenance has leads/supervisors who triage work.
- Whether parts waiting is a common blocker.
- Whether production can override or keep running a degraded machine.
- Whether Safety can force a resource down.
- Maintenance staffing/shift coverage.
- Chronic machine issue list.

## Immediate App Correction

Do not pretend the plant has mature reliability analytics yet.

Use the maintenance request system as the first reliability data collector.

The first goal is not predictive maintenance. The first goal is trustworthy machine/resource status and repair history.
