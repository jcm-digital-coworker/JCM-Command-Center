# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-18

## Current Build Status

Main is GREEN and deployed.

```text
Latest verified deployed work: PR #100 demo-session drift reset
Verified commit: ec41d52a6acbe54702e3a50b90c101e7409dd90d
Verified run: 26049772432
Branch: main
Workflow: Build
Status: GREEN
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-18T17:35:12Z
```

Verified deployed steps:

- Checkout
- Setup Node
- Install dependencies
- Build
- Upload demo build
- Upload Pages artifact
- Record latest action run
- Deploy GitHub Pages
- Complete jobs

## Last Completed Missions

### PR #100 - Demo-session reset / drift cleanup

Pilot Tools now includes `RESET DEMO SESSION` to clear drift-prone browser state after app/page swapping or repeated demo testing.

What changed:

- Added `src/logic/demoSessionReset.ts`.
- Added a Pilot Tools `RESET DEMO SESSION` button.
- Clears runtime overrides, workflow action log, plant simulation session/events, review targets, maintenance request local state, coverage overrides, and stale `?wc=` query params.
- Returns the app to Management / All / Dashboard.
- Does not change source production orders, route logic, blocker behavior, or workflow actions.

Verified:

```text
PR source run: 26049711269
PR source commit: e9f0982971c14d018ef33cbe01bf1502d773d8d6
Post-merge main run: 26049772432
Main commit: ec41d52a6acbe54702e3a50b90c101e7409dd90d
Typecheck and build: success
GitHub Pages deploy: success
```

### Commit b10afa11 - Focus Mode for hold-location landings

Hold-location landings now show a Focus Mode panel at the top of the work-center workflow.

What changed:

- Shows focused order, current instruction, work center, owner, next handoff, material status, and safe-action reminder.
- Preserves PR #98 one-shot target consumption so refresh does not reopen the same traveler repeatedly.
- Does not clear holds, approve routes, dispatch work, or mutate workflow runtime state.

Verified:

```text
Run: 26048753779
Main commit: b10afa11bda0b7c7f07b2e9397dc27bd84ff430c
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #98 - Consume work-center review target after opening traveler

Fixed refresh reopening the same Fab/department traveler repeatedly after a hold-location landing.

Root cause:

```text
jcm-classification-review-target-v1 was saved for one-shot navigation.
WorkCenterWorkflowPanelV2 opened the traveler but did not consume the saved target.
Refresh loaded the same target again and reopened the traveler.
```

Verified:

```text
PR source run: 26046622372
PR source commit: 275e8695c81ed0e4c5a407defee2cf3c76013fce
Main included by later deployed commit: b10afa11bda0b7c7f07b2e9397dc27bd84ff430c
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #97 - Sticky Mission Bar

Added a sticky return rail so users do not have to scroll back to the top to recover context.

What changed:

- New `StickyMissionBar` shell component.
- Shows role, current location, mission guidance, Command, Orders, Menu, and Back controls.
- Wired into normal app shell and work-center detail shell.
- Navigation only; no workflow state changes.

Verified:

```text
Run: 26039753875
Main commit: 58de2734af47519248fcc29fb32ea6c027ff8cd1
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #96 - Role-based accountability triage panel

Dashboard now starts with role-aware accountability signals before the long dashboard sections.

What changed:

- Added `src/logic/accountabilitySignals.ts`.
- Added `src/components/dashboard/RoleAccountabilityPanel.tsx`.
- Wired panel above Department Health.
- Shows blocked department, next owner, age/last touch, needed next, proof line, and safe action.
- Role framing covers Operator, Department Lead, Support, and Management.

Verified:

```text
Run: 26037886205
Main commit: e925f11e844c58ecf510e8c29ec942e1e900ed65
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #95 - Context docs refresh after PR #94

Verified:

```text
Run: 26008149957
Main commit: aaeb6631a70d8b83c12f2b801a16590c3588cb62
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #94 - Department order-card hold-location navigation

Department order cards now show `GO TO HOLD LOCATION - <department>` when a mapped blocked/held traveler step exists.

Verified:

```text
PR source run: 26007995011
PR source commit: b84606b0eb0dae44b632353fc98aa6446016824f
Post-merge main run: 26008024404
Main commit: 52c59fcc0a1dff6e56ed2b591662e7b3266404d8
Typecheck and build: success
GitHub Pages deploy: success
```

## Current Product State

The app now has three stress-navigation layers on top of the earlier hold-location work:

```text
Accountability Triage: who owns the next move, what is needed, and what is safe to do.
Sticky Mission Bar: where am I, why am I here, and how do I get back without scrolling.
Focus Mode: when a hold-location action lands, show the targeted order/traveler first.
```

Pilot Tools also has:

```text
RESET DEMO SESSION
```

to clear stale local browser state before demo or smoke testing.

## Hold-Location Navigation Truth

Exact hold-location navigation is available from:

```text
Dynamic Traveler detail
Orders detail route steps
Full Plant Traveler route steps
Dashboard blocked-order rows
Plant Signal cards
Dashboard QA hold rows
Department order cards
```

All seven store exact target context and open the owning work center without clearing or mutating the hold.

Guardrails preserved:

```text
No blocker clearing.
No route changes.
No department advancement.
No classifier confidence changes.
No workflow runtime mutation.
No dispatch behavior change.
```

## Demo Prep State

Use Pilot Tools -> `RESET DEMO SESSION` before smoke testing or presenting.

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

Smoke checklist:

```text
RESET DEMO SESSION returns to Management / All / Dashboard.
Accountability Triage appears before Department Health.
Sticky Mission Bar stays visible while scrolling.
Command / Orders / Menu / Back work without scrolling to top.
Hold-location landing opens Focus Mode.
Refresh after hold-location landing does not reopen the old Fab traveler repeatedly.
Seven hold-location doorway checks still land in the owning work center and exact traveler/order.
```

Avoid deep-demoing as finalized routing:

- Coating sub-flow.
- Couplings.
- Clamps.
- Patch clamps.
- 412 / 432 / 452 routing rules.
- QA automation.
- Shipping readiness automation.

## Current Decision

```text
GitHub Actions is the source of truth for merge readiness.
Repo truth beats chat memory.
GitHub Actions beats status vibes.
PR patch beats verbal summaries.
Small branches beat giant rewrites.
Risk track decides inspection depth.
Product classification is a mapmaker, not dispatch authority.
Product route confidence is not dispatch authority.
RequiredDepartments still override classifier route hints.
No confidence increase without confirmed plant facts.
Shipping is always last; readiness to ship is not automatic.
QA is conditional, not universal.
Demo polish must not imply dispatch automation is complete.
The app should reduce blame by showing ownership, age, last action, and next safe move.
```

## Active Risks / Next Audit Targets

### Live smoke-test risk

CI proves compile/deploy, not full click-flow behavior. Live browser validation still needs to confirm the new accountability/reset/navigation layers work cleanly.

Do not add more product features before a live UX smoke pass unless a demo-breaking issue appears.

### Browser-state drift risk

The new reset clears known drift-prone state, but browser cache/service-worker behavior can still require hard refresh or clean profile if the deployed page feels stale.

### Possible next product slice after smoke

Role-specific dashboard buckets:

```text
Management: Plant Bottlenecks / Aging Holds / Due Soon Risk / Decision Needed
Lead: We Own / Waiting On Us / Waiting On Others / Ready Work
Operator: Do Now / Blocked / Ask Lead
Support: Requests For Us / Aging Requests / Needs More Info
```

### Possible later audits

- Maintenance / equipment alert paths.
- Receiving material issue paths.
- Route truth for Coating, clamps, 412, 432, 452.

### Plant-truth gaps remain

Continue preserving uncertainty for:

- Coating sub-flow.
- Couplings.
- Clamps.
- Patch clamps.
- 412 / 432 / 452 routing rules.
- Assembly lanes.
- QA conditions.
- Shipping readiness.

### Large-file edit risk

`update_file` is full-file replacement, not a true line patch. For large files, follow `docs/GITHUB_OPERATIONS_PLAYBOOK.md`: search target, fetch nearby lines, fetch complete blob if needed, re-fetch edited range, review PR patch, and stop if only truncated content is available.

## Guardrails Preserved

- Guidance > Control.
- Structured selections > free text.
- Selections drive logic; notes explain exceptions.
- Global command = mission visibility.
- Department views = local action.
- App.tsx routes only.
- Pages compose.
- Modules think.
- Components display.
- Button behavior must come from typed action contracts or selectors, not display text.
- Review copy must not imply automatic resolution.
- View/no-op actions must not mutate runtime state.
- Product classification is a mapmaker, not dispatch authority.
- Product route confidence is not dispatch authority.
- RequiredDepartments still override classifier route hints.
- No confidence increase without confirmed plant facts.
- Shipping is always last; readiness to ship is not automatic.
- LV4500 simulator is read-only and must not create real machine command behavior.
- Reset/demo controls may clear local demo state only when explicitly clicked.

## Durable Plant Truth Reminders

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

## Repo-First Operating Rule

- Pull current repo files before editing.
- Use current `main`, not old chat memory.
- Do not reuse stale blob SHAs.
- Check whether the repo already contains the component, selector, data field, or fix before building it.
- Verify every repo write by fetching the edited file before stacking dependent changes.
- For large files, avoid blind contents updates from truncated connector output.
- Use the GitHub Operations Playbook risk track before every repo task.

## Next Recommended Move

Run the live browser smoke pass from a reset state.

After the smoke pass, only patch newly observed dead-ends or demo-breaking confusion.
