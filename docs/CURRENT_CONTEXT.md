# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

## Current Build State

Main is GREEN and deployed.

```text
Latest verified deployed work: PR #100 demo-session drift reset
Verified commit: ec41d52a6acbe54702e3a50b90c101e7409dd90d
Verified run: 26049772432
Workflow: Build
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-18T17:35:12Z
```

## Current Truth

The app has moved from pure hold-location doorway work into role-based accountability and stress-navigation polish.

Current deployed behavior includes:

- PR #96: Dashboard accountability triage panel shows role-aware ownership cards before the long dashboard sections.
- PR #97: Sticky Mission Bar stays visible while scrolling and provides Command, Orders, Menu, and Back controls.
- Focus Mode commit b10afa11: Hold-location landings now show a Focus Mode panel for the targeted traveler/order.
- PR #98: Work-center review targets are consumed after opening the traveler so refresh does not repeatedly pop the same Fab/department traveler.
- PR #100: Pilot Tools now includes `RESET DEMO SESSION` to clear drift-prone local browser state and return to Management / All / Dashboard.

The app still preserves prior exact hold-location navigation from:

```text
Dynamic Traveler detail
Orders detail route steps
Full Plant Traveler route steps
Dashboard blocked-order rows
Plant Signal cards
Dashboard QA hold rows
Department order cards
```

These safe navigation paths store exact target context, open the owning work center, and let the work-center panel open the matching traveler/order.

They do not:

```text
clear blockers
advance departments
change route logic
change classifier confidence
mutate workflow runtime state
change dispatch behavior
```

## Recently Completed Work

- PR #94: Department order-card `GO TO HOLD LOCATION` merged and deployed.
- PR #95: Context docs refreshed after PR #94 and deployed.
- PR #96: Role-based accountability triage panel merged and deployed.
- PR #97: Sticky Mission Bar merged and deployed.
- PR #98: Work-center review target consumption fix merged and deployed.
- Commit b10afa11: Focus Mode for hold-location landings merged and deployed.
- PR #100: Demo-session reset / drift cleanup merged and deployed.

## Current Product Direction

The app should not behave like a long report. It should help under-stress operators, department leads, support teams, and bosses answer:

```text
What needs attention?
Who owns the next move?
What is safe to do next?
What proof/context exists?
How do I get back?
```

Role-specific priorities:

```text
Operator: Do now, blocked, waiting, ask lead.
Department Lead: We own, waiting on us, waiting on others, ready work, aging/escalate.
Support: Requests for us, needs more info, aging requests, recently cleared.
Management: Plant bottlenecks, aging holds, no response, due-soon risk, decision needed.
```

Accountability language must reduce blame without hiding ownership:

```text
Good: Next action owner: Receiving. Fab is waiting on material verification. Last request sent 48 minutes ago.
Bad: Receiving is holding this up.
```

## Best Demo Path

Use a guided demo instead of free-roam clicking.

Recommended path:

```text
Dashboard / Command Center
Pilot Tools -> RESET DEMO SESSION
Accountability Triage panel
Maintenance Requests
Orders
Hold-location landing / Focus Mode
LV4500 Simulator
Saddles Dept
Progress / Validation only if explaining roadmap
```

Strong demo surfaces:

- Role-based accountability triage.
- Sticky Mission Bar / quick return rail.
- Focus Mode after hold-location navigation.
- Maintenance request visibility and status flow.
- Dashboard blocked-order hold-location navigation.
- Dashboard QA hold-location navigation.
- Plant Signal hold-location navigation.
- Orders/traveler visibility.
- Orders route-step hold-location navigation.
- Full Plant Traveler route-step hold-location navigation.
- Department order-card hold-location navigation.
- Department views.
- LV4500 read-only simulator.
- Pilot Tools reset for clean demo state.
- Plant Route Review collapsed summary for transparent route validation.

Demo language:

```text
The app gives guidance and visibility.
It does not replace supervisors.
It preserves uncertainty where plant truth is still being validated.
It shows ownership without turning accountability into blame.
```

## Current Mission

Run a live browser smoke pass against the deployed app after using Pilot Tools -> RESET DEMO SESSION.

Smoke-test:

```text
RESET DEMO SESSION returns to Management / All / Dashboard.
Sticky Mission Bar stays visible while scrolling.
Command / Orders / Menu / Back buttons work without scrolling to the top.
Accountability Triage panel appears before Department Health.
Hold-location navigation opens Focus Mode for the targeted traveler/order.
Refreshing after a hold-location landing does not repeatedly reopen the old Fab traveler.
Dashboard blocked-order GO TO HOLD LOCATION.
Dashboard QA hold GO TO HOLD LOCATION.
Plant Signals hold-location navigation.
Dynamic Traveler detail GO TO HOLD DEPARTMENT.
Orders route-step GO TO HOLD LOCATION.
Full Plant Traveler route-step GO TO HOLD LOCATION.
Department order-card GO TO HOLD LOCATION.
```

Use `docs/DEMO_RUNBOOK.md` as the live demo playbook, but remember that newer PR #96/#97/#98/#100 behavior is now part of the demo.

## Next Source Audit Target

Do not add more data or doorways until the live UX smoke pass confirms the new accountability/reset/navigation work.

Possible next product slice after smoke:

```text
Role-specific dashboard buckets:
  Management: Plant Bottlenecks / Aging Holds / Due Soon Risk / Decision Needed
  Lead: We Own / Waiting On Us / Waiting On Others / Ready Work
  Operator: Do Now / Blocked / Ask Lead
  Support: Requests For Us / Aging Requests / Needs More Info
```

Possible later audits:

```text
Maintenance / equipment alert paths
Receiving material issue paths
Route truth for Coating, clamps, 412, 432, 452
```

## Current Decision

```text
Repo truth beats chat memory.
GitHub Actions beats status vibes.
PR patch beats verbal summaries.
Small branches beat giant rewrites.
Risk track decides inspection depth.
Product classification is guidance, not dispatch authority.
Unconfirmed routes must stay conservative.
RequiredDepartments still override classifier route hints.
No confidence increase without confirmed plant facts.
Shipping is always last, but readiness to ship is not automatic.
QA is conditional, not universal.
Demo polish must not imply dispatch automation is complete.
The app should reduce blame by showing ownership, age, last action, and next safe move.
```

## Known Risk Areas

- CI proves compile/deploy, not full click-flow behavior.
- Swapping app/webpage contexts can still expose browser cache or service-worker weirdness; use `RESET DEMO SESSION` first.
- Coating is complex and must not be modeled as one bucket.
- Fab has lanes, not one generic bucket.
- Assembly is lane/product specific.
- Couplings, clamps, patch clamps, 412, 432, and 452 need route truth confirmation.
- QA conditions need explicit rules.
- Shipping readiness needs explicit completion/inspection/material conditions.
- Large files must not be full-rewritten from truncated connector output.

## Guardrails

- Guidance > Control.
- Structured selections > free text.
- Selections drive logic; notes explain exceptions.
- Global command = mission visibility.
- Department views = local action.
- App.tsx routes only.
- Pages compose.
- Modules think.
- Components display.
- Button behavior comes from typed action contracts or selectors, not display text.
- Review copy must not imply automatic resolution.
- View/no-op actions must not mutate runtime state.
- LV4500 simulator is read-only and must not create real machine command behavior.
- Reset/demo controls may clear local demo state only when explicitly clicked.
- Use the GitHub Operations Playbook risk tracks before repo edits.

## Durable Plant Truth

- Receiving stands alone and feeds other departments.
- Machine Shop is fed by Receiving and makes components.
- Material Handling is production, not support.
- Fab is split into lanes: Special Fab, Large Body, Specialized Welding, 412 Fab, 432 Fab, 452, West Wing.
- Fab is fed by Machine Shop and Material Handling.
- Fab output moves to Coating.
- Coating is complex and must not be modeled as one bucket.
- Assembly is lane/product specific, not one generic department.
- Saddles route differs by product/coating path:
  - Plastic-coated saddles go to Coating before LV4500 tapping.
  - Other saddles go to Saddles for tapping first, then to Coating for shop-coat or enamel.
- Stainless parts do not get coated; they go to passivation or bead blast as applicable.
- LV4500s are in Saddles Dept, not Machine Shop.
- QA is conditional, not universal.
- Shipping is always the final physical department.
- Maintenance is facilities and equipment repair only.

## Next Recommended Move

Run the live browser smoke pass from a reset state.

Checklist:

```text
Open deployed app.
Pilot Tools -> RESET DEMO SESSION.
Confirm Dashboard / Management / All.
Confirm Accountability Triage appears before Department Health.
Scroll a long page and confirm Sticky Mission Bar stays visible.
Use Command / Orders / Menu / Back without scrolling to top.
Click a hold-location action and confirm Focus Mode appears.
Refresh and confirm the old Fab traveler does not reopen repeatedly.
Run the seven hold-location doorway checks.
Only patch newly observed dead-ends or demo-breaking confusion.
```
