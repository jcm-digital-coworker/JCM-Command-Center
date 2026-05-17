# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

## Current Build State

Main is GREEN and deployed.

```text
Latest verified deployed work: PR #82 exact held-traveler navigation
Verified commit: 1c6f427e7692c0e944b2f305f134c05d74622efb
Verified run: 26004203662
Workflow: Build
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-17T22:13:27Z
```

## Current Truth

The app is in a guided demo-ready state with one important traveler-navigation fix now deployed.

Completed demo readiness work:

- PR #76 refreshed demo order dates, softened route-validation wording, renamed DEV controls to Pilot Tools, and corrected Saddles handoff wording.
- PR #77 collapsed the dashboard Classification Review Queue into a calmer Plant Route Review summary while preserving review badges and expanded review details.
- PR #78 added `docs/DEMO_RUNBOOK.md` with pre-demo reset steps, guided demo path, talk tracks, caution areas, and success criteria.
- PR #80 refreshed current context/build-state docs after demo runbook work.
- PR #82 added blocked/held traveler navigation: traveler details can now store an exact target and open the owning work center, where the matching traveler opens automatically.
- `docs/GITHUB_OPERATIONS_PLAYBOOK.md` defines the repo workflow, risk tracks, pull/merge protocols, and large-file protocol.

Current demo story:

```text
JCM Command Center gives visibility and guidance.
It does not replace supervisors.
It preserves uncertainty where plant truth is still being validated.
```

## Recently Completed Work

- PR #69: LV4500 cycle-time display precision live and deployed.
- PR #70: Progress / Not Yet Live drawer checklist refreshed after LV4500 smoke test.
- PR #71: Dashboard quick-action labels clarified to match navigation behavior.
- PR #72: Department order-card navigation labels clarified.
- PR #73: Skill-gap coverage action label clarified.
- PR #74: AI worker guardrails and patch relay workflow added.
- PR #75: Current context/build-state docs refreshed after LV4500 and worker lane updates.
- PR #76: Demo polish pass merged and deployed.
- PR #77: Plant Route Review accordion merged and deployed.
- PR #78: Guided demo runbook merged and deployed.
- PR #80: Demo context docs refreshed and deployed.
- PR #82: Exact held-traveler navigation merged and deployed.

## PR #82 Behavior Truth

For a Dynamic Traveler with `BLOCKED` or `HOLD` signal/status:

```text
GO TO HOLD DEPARTMENT - <department>
```

This action:

```text
stores orderNumber, department, travelerId, source, and timestamp
opens the owning work center through the existing station route
opens the matching traveler modal in the destination workflow panel
```

It does not:

```text
clear blockers
advance departments
change route logic
change classifier confidence
mutate workflow runtime state
change dispatch behavior
```

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
- Orders/traveler visibility.
- Dynamic Traveler hold navigation to exact owning department/order.
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

Run the live demo reset and dry run, with special attention to the PR #82 hold-navigation flow.

Use `docs/DEMO_RUNBOOK.md` as the live demo playbook.

Focus after demo polish:

```text
Route validation for Coating lanes, couplings, clamps, patch clamps, 412/432/452, QA conditions, and shipping readiness.
```

## Current Decision

```text
Repo truth beats chat memory.
GitHub Actions beats status vibes.
PR patch beats verbal summaries.
Small branches beat giant rewrites.
Risk track decides inspection depth.
Product classification is useful guidance, not dispatch authority.
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
- Large files must not be full-rewritten from truncated connector output.
- Demo still needs a clean browser/localStorage reset before showing live.
- PR #82 needs live browser smoke validation, because CI proves compile/deploy but not full click-flow behavior.

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
Find or create a blocked/held Dynamic Traveler.
Open traveler detail.
Click GO TO HOLD DEPARTMENT.
Confirm the owning work center opens and the exact traveler/order opens automatically.
Keep Plant Route Review collapsed unless explaining route validation.
Do not deep-demo Coating/clamps/412/432/452 as finalized routing.
```

After demo prep, resume plant-truth route audit before changing behavior.
