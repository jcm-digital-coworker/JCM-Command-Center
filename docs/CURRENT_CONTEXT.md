# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

## Current Build State

Main is GREEN and deployed.

```text
Latest verified deployed work: PR #89 plant signal hold-location navigation
Verified commit: a38e8406b05c3471979f6a139f327f637b18b1c4
Verified run: 26005568860
Workflow: Build
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-17T23:16:16Z
```

## Current Truth

The app is in a guided demo-ready state with exact hold-location navigation now available from the main blocker surfaces we have touched:

- PR #82: Dynamic Traveler detail can open the owning hold department and exact traveler.
- PR #85: Orders detail route steps show `GO TO HOLD LOCATION` for blocked/held steps.
- PR #86: Full Plant Traveler route steps show `GO TO HOLD LOCATION` for blocked/held steps.
- PR #88: Dashboard blocked-order rows show `GO TO HOLD LOCATION - <department>` when a held/blocked traveler step can be derived.
- PR #89: Plant Signal cards carry exact hold target data and open the owning work center when a target exists.

All five use the same safe pattern:

```text
store orderNumber, department, travelerId, source, updatedAt
open the owning work center through the existing station route
let WorkCenterWorkflowPanelV2 open the matching traveler/order
```

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

- PR #76: Demo polish pass merged and deployed.
- PR #77: Plant Route Review accordion merged and deployed.
- PR #78: Guided demo runbook merged and deployed.
- PR #80: Demo context docs refreshed and deployed.
- PR #82: Exact held-traveler navigation merged and deployed.
- PR #84: Context docs refreshed after PR #82 and deployed.
- PR #85: Orders route-step `GO TO HOLD LOCATION` merged and deployed.
- PR #86: Full Plant Traveler route-step `GO TO HOLD LOCATION` merged and deployed.
- PR #87: Context docs refreshed after PR #85/#86 and deployed.
- PR #88: Dashboard blocked-order `GO TO HOLD LOCATION` merged and deployed.
- PR #89: Plant Signal exact hold-location navigation merged and deployed.

## Best Demo Path

Use a guided demo instead of free-roam clicking.

Recommended path:

```text
Dashboard / Command Center
Maintenance Requests
Orders
LV4500 Simulator
Saddles Dept
Progress / Validation only if explaining roadmap
```

Strong demo surfaces:

- Maintenance request visibility and status flow.
- Dashboard blocked-order hold-location navigation.
- Plant Signal hold-location navigation.
- Orders/traveler visibility.
- Dynamic Traveler hold navigation to exact owning department/order.
- Orders route-step hold-location navigation.
- Full Plant Traveler route-step hold-location navigation.
- Department views.
- LV4500 read-only simulator.
- Pilot Tools for controlled role/feature/simulation setup.
- Plant Route Review collapsed summary for transparent route validation.

Demo language:

```text
The app gives guidance and visibility.
It does not replace supervisors.
It preserves uncertainty where plant truth is still being validated.
```

## Current Mission

Run the live demo reset and dry run, with special attention to exact hold-location navigation from:

```text
Dashboard blocked-order rows
Plant Signal cards
Dynamic Traveler detail
Orders detail route steps
Full Plant Traveler route steps
```

Use `docs/DEMO_RUNBOOK.md` as the live demo playbook.

## Next Source Audit Target

Audit the remaining support signal rows and department cards for the same pattern:

```text
If a blocker, hold, support issue, material issue, QA hold, or equipment alert is visible, can the operator open the exact work location?
```

Likely areas to inspect next:

```text
Dashboard QA / Safety / Maintenance signal rows
Department order cards with broad blocker buttons
Maintenance / equipment alert paths
Receiving material issue paths
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
```

## Known Risk Areas

- Coating is complex and must not be modeled as one bucket.
- Fab has lanes, not one generic bucket.
- Assembly is lane/product specific.
- Couplings, clamps, patch clamps, 412, 432, and 452 need route truth confirmation.
- QA conditions need explicit rules.
- Shipping readiness needs explicit completion/inspection/material conditions.
- Demo still needs clean browser/localStorage reset before showing live.
- PR #82/#85/#86/#88/#89 need live browser click-flow smoke validation; CI proves compile/deploy, not operator path.
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

Run the live demo reset and dry run.

Checklist:

```text
Open the deployed app in the demo browser.
Reset Maintenance Requests.
Reset plant simulation from Pilot Tools.
Set role to Management or Department Lead.
Enable desired Pilot Tools feature flags.
Smoke path: Maintenance Requests -> Orders -> LV4500 Simulator -> Saddles Dept.
Test Dashboard blocked-order GO TO HOLD LOCATION.
Test Plant Signals hold-location navigation.
Test Dynamic Traveler detail GO TO HOLD DEPARTMENT.
Test Orders route-step GO TO HOLD LOCATION.
Test Full Plant Traveler route-step GO TO HOLD LOCATION.
Confirm each path opens the owning work center and exact traveler/order.
Keep Plant Route Review collapsed unless explaining route validation.
Do not deep-demo Coating/clamps/412/432/452 as finalized routing.
```

After demo prep, audit QA / Safety / Maintenance signal rows and department order-card blocker buttons before changing route behavior.
