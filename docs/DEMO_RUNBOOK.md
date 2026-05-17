# JCM Command Center Guided Demo Runbook

Purpose: make the demo calm, honest, and repeatable without implying that unfinished plant routing is already automated.

## Current Demo State

The app is ready for a guided pilot demo.

Use this framing:

```text
JCM Command Center gives visibility and guidance.
It does not replace supervisors.
It preserves uncertainty where plant truth is still being validated.
```

## Pre-Demo Reset

Use one clean browser profile when possible.

Before presenting:

```text
1. Open the deployed app.
2. Open Pilot Tools.
3. Reset plant simulation.
4. Reset Maintenance Requests from the Maintenance Requests page.
5. Set role to Management or Department Lead.
6. Enable demo feature flags you want to show.
7. Close Pilot Tools before starting the walkthrough.
8. Smoke the path once: Maintenance Requests -> Orders -> LV4500 Simulator -> Saddles Dept.
```

Recommended feature flags:

```text
Urgency score
Next handoff banner
Department blocker escalation
```

Use Kanban only if the department page looks clean in the demo browser.

## Guided Demo Path

Recommended route:

```text
1. Dashboard / Command Center
2. Maintenance Requests
3. Orders
4. LV4500 Simulator
5. Saddles Dept
6. Progress / Validation only if explaining roadmap
```

Do not free-roam every tab. Keep the demo on rails.

## Dashboard Talk Track

Say:

```text
This is the plant command view. It pulls orders, blockers, machine signals, maintenance, and department health into one place.
```

Point out:

```text
Plant Signals
Plant Route Review collapsed summary
Plant Pressure Score
Quick Actions
```

The Plant Route Review section should remain collapsed unless someone asks about route validation.

## Maintenance Requests Talk Track

Say:

```text
This turns maintenance problems into visible, trackable work instead of hallway memory.
```

Show:

```text
Open requests
Critical / line-down request
Claim / waiting / complete flow
Epicor-ready metadata
```

Avoid walking through every prompt unless the audience wants hands-on detail.

## Orders Talk Track

Say:

```text
This is the plant traveler brain. It shows what is blocked, what is ready, where work is, and what the next handoff is.
```

Say clearly:

```text
This is guidance, not automatic dispatch.
Confirmed plant truth is used where we have it. Unconfirmed route areas stay in review.
```

## LV4500 Simulator Talk Track

Say:

```text
This is not machine control. It is read-only operator guidance that captures saddle setup logic, validates combinations, and estimates timing before cutting.
```

Show:

```text
Casting selection
Tap code selection
Batch target
Cycle result
Timing result
Read-only documentation
```

## Saddles Dept Talk Track

Say:

```text
Saddles owns the LV4500 work in this app because that matches the plant ownership model.
```

Point out:

```text
Saddles orders
Crew guidance
LV4500 constraint
Ready for Next Department language
```

## Do Not Present As Finished

Do not present these areas as finalized dispatch automation:

```text
Coating lanes
Couplings
Clamps
Patch clamps
412 / 432 / 452 routing
QA automation
Shipping readiness automation
```

Use this line if asked:

```text
Those areas are intentionally held in plant-truth validation so the app does not pretend to know what we have not confirmed.
```

## Success Criteria

A successful demo should leave the audience with this understanding:

```text
The app is already useful as a pilot.
It makes maintenance, orders, blockers, department handoffs, and LV4500 setup guidance visible.
It is honest about unconfirmed plant routing.
It gives JCM a controlled path to build plant truth department by department.
```
