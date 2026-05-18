# Current Build State

Purpose: preserve the smallest useful operating context for the JCM Command Center build so future work continues from the current clean repository state without dragging full chat history forward.

Last updated: 2026-05-18

## Current Build Status

Main is GREEN and deployed.

```text
Latest verified deployed work: PR #94 department order-card hold-location navigation
Verified commit: 52c59fcc0a1dff6e56ed2b591662e7b3266404d8
Verified run: 26008024404
Branch: main
Workflow: Build
Status: GREEN
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-18T01:02:34Z
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

### PR #94 - Department order-card hold-location navigation

Department order cards now show `GO TO HOLD LOCATION - <department>` when a mapped blocked/held traveler step exists.

What changed:

- `DepartmentPageTools.OrderCard` adds a companion hold-location button for mapped blocked/held steps.
- Existing blocker-type buttons remain intact for material, engineering, QA, equipment, and coverage context.
- The action stores exact target context and opens the owning work center.
- No blocker, route, runtime, or dispatch state is changed.

Verified:

```text
PR source run: 26007995011
PR source commit: b84606b0eb0dae44b632353fc98aa6446016824f
Post-merge main run: 26008024404
Main commit: 52c59fcc0a1dff6e56ed2b591662e7b3266404d8
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #92 - Context docs refresh after PR #91

Verified:

```text
Run: 26007286435
Main commit: c2a652d2bca37a4f347b4596d2a65a67e69737af
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #91 - Dashboard QA hold-location navigation

Dashboard QA hold rows now show `GO TO HOLD LOCATION - <department>` when a mapped blocked/held traveler step exists.

Verified:

```text
PR source run: 26006323164
PR source commit: 737bcaf919ef1178f79642ad8fe22ac0ab4eae7d
Post-merge main run: 26007116165
Main commit: b9b4542e78dc600385cce54b182f66822b972a0e
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #90 - Context docs refresh after PR #88/#89

Verified:

```text
Run: 26006170393
Main commit: 6ab700c17dc13fce29e30d0fca1fc10ed24992fc
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #89 - Plant Signal hold-location navigation

Plant Signal cards now carry optional exact hold-location target data and open the owning work center when a hold target is available.

Verified:

```text
PR source run: 26005369402
PR source commit: 76dfa93e9c6a317b41d99c615481477777d62919
Post-merge main run: 26005568860
Main commit: a38e8406b05c3471979f6a139f327f637b18b1c4
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #88 - Dashboard blocked-order hold-location navigation

Dashboard blocked-order rows now show `GO TO HOLD LOCATION - <department>` when a blocked/held traveler step can be derived.

Verified:

```text
PR source run: 26005203259
PR source commit: 1e4f789e81e42024161e316c09cfe22020894ba5
Post-merge main run: 26005217470
Main commit: fb55495152436a5097e6994e8c3a830c8e8bf43d
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #86 - Full Plant Traveler hold-location navigation

Full Plant Traveler route steps now show `GO TO HOLD LOCATION` for blocked/held steps with mapped work centers.

Verified:

```text
PR source run: 26004794667
PR source commit: af0b02919939e46cb9a2c1158ef3edf5db4b74c7
Post-merge main run: 26004820988
Main commit: d6dbfa65f9caa0e11fd822660aa87970ee156cf9
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #85 - Orders route-step hold-location navigation

Orders detail route steps now show `GO TO HOLD LOCATION` for blocked/held route steps with mapped work centers.

Verified:

```text
PR source run: 26004643834
PR source commit: 10f27098bb9a395d71095a4360e00a6cb07e30f8
Post-merge main run: 26004662063
Main commit: e823eaefc8e30139e379484124304fe57040faa6
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #82 - Exact held-traveler navigation

Blocked/held Dynamic Travelers can open the owning department and exact traveler/order.

Verified:

```text
PR source run: 26004187535
PR source commit: 809ebf6a87e8f0dc10ea1e3039151487e9e9874a
Post-merge main run: 26004203662
Main commit: 1c6f427e7692c0e944b2f305f134c05d74622efb
Typecheck and build: success
GitHub Pages deploy: success
```

### PR #78 - Guided demo runbook

`docs/DEMO_RUNBOOK.md` is merged and deployed.

Verified:

```text
PR source run: 26003061324
PR source commit: 1b7027b65a713e38e81d7651cd05adfe2dd80ed1
Post-merge main run: 26003076380
Main commit: e01e975738ba7d4c85568cc6261b86e9e47fce7c
Typecheck and build: success
GitHub Pages deploy: success
```

## Hold-Location Navigation Truth

Exact hold-location navigation is now available from:

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

The app is ready for a guided demo path after local browser reset.

Use `docs/DEMO_RUNBOOK.md` as the demo playbook.

Recommended path:

```text
Dashboard / Command Center
Maintenance Requests
Orders
LV4500 Simulator
Saddles Dept
Progress / Validation only if explaining roadmap
```

Pre-demo local reset:

```text
Open the deployed app in the demo browser.
Reset Maintenance Requests.
Reset plant simulation from Pilot Tools.
Set role to Management or Department Lead.
Enable desired Pilot Tools feature flags.
Smoke path: Maintenance Requests -> Orders -> LV4500 Simulator -> Saddles Dept.
Test Dashboard blocked-order GO TO HOLD LOCATION.
Test Dashboard QA hold GO TO HOLD LOCATION.
Test Plant Signals hold-location navigation.
Test Dynamic Traveler detail GO TO HOLD DEPARTMENT.
Test Orders route-step GO TO HOLD LOCATION.
Test Full Plant Traveler route-step GO TO HOLD LOCATION.
Test Department order-card GO TO HOLD LOCATION.
Confirm each opens the owning work center and exact traveler/order.
Keep Plant Route Review collapsed unless explaining route validation.
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
```

## Active Risks / Next Audit Targets

### Live smoke-test risk

CI proves compile/deploy, not full click-flow behavior. Live browser validation still needs to confirm that hold-location actions land in the owning work center and open the exact traveler/order.

Do not add more doorway patches before a live click-flow smoke pass unless a visible dead-end is found during the dry run.

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

### Demo local-state risk

The app uses localStorage for pilot/demo state. Use one clean browser profile or reset Maintenance Requests, plant simulation, and feature flags before presenting.

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

Run the live demo reset and dry run.

After the smoke pass, only patch newly observed dead-ends or demo-breaking issues.
