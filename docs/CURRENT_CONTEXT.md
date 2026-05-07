# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

## Current Build State

Latest verified PR build is GREEN.

```text
PR: #49 Add route confidence to product families
PR head commit: 69cdb62e14fec7057ac90b13b0ad292d2ae1df9e
PR run: 25528062201
Workflow: Build
Typecheck and build: success
Demo build artifact: success
```

Main merge is complete but the post-merge main run was not visible at the time this context was updated.

```text
Merge commit: ee8c205a09b08d6f3a1cc973d06f973af769ac48
Main build for merge: unknown / pending verification
Last recorded main breadcrumb in docs/LATEST_ACTION_RUN.md may still be stale until Actions records a newer main run.
```

## Last Completed Mission

Product-family route confidence seed is merged.

Completed work:

- PR #49 extended the existing `src/data/productFamilies.ts` map.
- Added `routeConfidence`, `sourceType`, `routeNote`, `likelyPlantArea`, and `needsConfirmation` fields.
- Added `findProductFamilyBySeries()` and `getProductFamilyRouteConfidence()` helpers.
- Kept product intelligence in one source instead of adding a duplicate map.
- No runtime routing changed.
- No `requiredDepartments` changed.
- No action behavior changed.

## Current Mission

Keep product information useful without letting public catalog data become dispatch authority.

Current decision:

```text
Website/catalog/manual data can classify product families.
Plant-confirmed knowledge is still required before route dispatch.
Unknown route = review prompt, not command.
```

## Stable Completed Work

- PR #48 landed Machine Shop department page, English/Spanish MVP, shell i18n, theme cohesion, and LV4500 simulation Level 2.
- PR #49 landed route confidence metadata for product families.
- DEV toolkit is one bottom-right floating DEV button.
- Work Center workflow buttons use typed action contracts, not visible-label parsing.
- `BLOCKED_HERE` workflow cards are review-only.
- Product Intelligence appears in traveler modals and workflow cards.
- Classification review visibility exists in workflow and dashboard surfaces.
- Department order cards use the plant traveler material-action selector.

## Product Route Confidence Rules

Product-family data may support:

- product category display;
- model-family grouping;
- likely area hints;
- review prompts;
- route-confidence badges.

Product-family data must not:

- override `requiredDepartments`;
- silently change current or next department;
- mark QA universal;
- mark Coating required without confirmation;
- dispatch work from public catalog category alone.

## Known Route Confidence Areas

Confirmed / stronger:

- Receiving stands alone and feeds other departments.
- Machine Shop is fed by Receiving and makes components.
- Material Handling is production, not support.
- Saddles route is Receiving -> Coating -> Saddles Dept.
- LV4500s are in Saddles Dept, not Machine Shop.
- Maintenance is stand-alone.
- Everything eventually funnels to Shipping.

Needs review before dispatch:

- Coating sub-flow.
- Couplings route relative to Coating.
- Clamps ownership and variants.
- Patch Clamps ownership and variants.
- 412 Fab ownership and exceptions.
- 432 Fab ownership and exceptions.
- What 452 means internally.
- Assembly lane ownership.
- QA conditions.
- Shipping readiness rules.

## Protected Shared Files

- `src/App.tsx`
- `src/components/shell/AppDrawer.tsx`
- `src/components/shell/AppHeader.tsx`
- `src/components/shell/DevToolkitFlyout.tsx`

## Core Rules

- Guidance > Control.
- Structured selections > free text.
- Selections drive logic; notes explain exceptions.
- Global command = mission visibility.
- Department views = local action.
- App.tsx routes only.
- Pages compose.
- Modules think.
- Components display.
- Runtime behavior must come from typed contracts or selectors, not display text.
- Review-only actions must not clear blockers or mutate production state.
- Product classification is a mapmaker, not dispatch authority.
- RequiredDepartments override classifier route hints.
- No route-confidence increase without confirmed plant facts.

## Next Recommended Move

Verify the post-merge main build for `ee8c205a09b08d6f3a1cc973d06f973af769ac48` when Actions posts it.

Then continue small:

```text
Surface route confidence in UI as review language, not dispatch behavior.
```

First target should be read-only display language, not runtime route changes.
