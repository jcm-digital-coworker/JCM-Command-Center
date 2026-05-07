# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

## Current Build State

Main is GREEN and deployed.

```text
Latest merged PR: #50 Wire route confidence display into plant traveler
Main commit: 19b0f2e60265bee5d0ae3db23839a2e6efbf70f7
Main run: 25528506152
Workflow: Build
Typecheck and build: success
GitHub Pages deploy: success
Updated: 2026-05-07T23:53:25Z
```

## Last Completed Mission

Route-confidence display is installed and visible in the Full Plant Traveler Product Intelligence panel.

Completed work:

- PR #49 extended the existing `src/data/productFamilies.ts` map.
- Added `routeConfidence`, `sourceType`, `routeNote`, `likelyPlantArea`, and `needsConfirmation` fields.
- Added `findProductFamilyBySeries()` and `getProductFamilyRouteConfidence()` helpers.
- PR #50 added operator-safe route confidence display copy helpers.
- PR #50 wired Route Confidence, Likely Area, route review notice, route note, and confirmation items into the Full Plant Traveler Product Intelligence panel.
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
Shipping is always the final physical department.
Ready for Shipping is still conditional on blockers, QA, paperwork, and order completion state.
```

## Stable Completed Work

- PR #48 landed Machine Shop department page, English/Spanish MVP, shell i18n, theme cohesion, and LV4500 simulation Level 2.
- PR #49 landed route confidence metadata for product families.
- PR #50 landed route confidence display in Full Plant Traveler.
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
- dispatch work from public catalog category alone;
- mark an order ready for Shipping just because Shipping is the final department.

## Known Route Confidence Areas

Confirmed / stronger:

- Receiving stands alone and feeds other departments.
- Machine Shop is fed by Receiving and makes components.
- Material Handling is production, not support.
- Saddles route is Receiving -> Coating -> Saddles Dept.
- LV4500s are in Saddles Dept, not Machine Shop.
- Shipping is always the final physical department.
- Maintenance is stand-alone.

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
- Shipping is always last; readiness to ship is not automatic.

## Next Recommended Move

Manual smoke test the live demo:

```text
Open a traveler.
Open Full Plant Traveler.
Confirm Route Confidence appears in Product Intelligence.
Confirm Likely Area appears.
Confirm review copy says confirm before dispatch or handoff.
Confirm no route/action behavior changed.
```

Then continue small:

```text
Wire route confidence into the Department Traveler modal only when TravelerDetailModal.tsx can be patched safely without full-file truncation risk.
```
