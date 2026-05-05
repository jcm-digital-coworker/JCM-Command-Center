# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

Current build state:
- Latest recorded Action is GREEN.
- Run ID 25408232896
- Source commit 9e7a3507a10ac046b2c65c23a646690606a5198f
- Branch: main
- Workflow: Build
- Verified steps: Checkout, Setup Node, Install dependencies, Build, Upload demo build, Record latest action run.

Last completed mission:
- PR #38 merged: Fix plant traveler active action projection.
- Merge commit: 9e7a3507a10ac046b2c65c23a646690606a5198f
- The earlier DepartmentPageTools build break was traced to `traveler.actions` being read on `PlantTraveler` while actions actually belong to the active department step.
- The app now keeps `PlantTraveler.actions` as a compatibility projection from the active department step, not as independent plant-level truth.
- New selector helpers exist in `src/logic/plantTravelerSelectors.ts`:
  - `getActivePlantTravelerStep`
  - `getActivePlantTravelerActions`
  - `getPlantTravelerMaterialAction`

Current mission:
- Finish cleanup without gaps or band-aids.
- Preferred next code cleanup: update `src/pages/departments/DepartmentPageTools.tsx` so OrderCard uses `getPlantTravelerMaterialAction(traveler)` instead of direct `traveler.actions.find(...)`.
- This file is large; do not blind-rewrite it from truncated connector output.
- Use Codespace, Claude, or a full-file-safe patch path before editing `DepartmentPageTools.tsx`.

Stable completed work:
- DEV toolkit is one bottom-right floating DEV button.
- DEV floater includes feature flags, role selector, department selector, and context/status access if present.
- Receiving gate page is active through a shim.
- `src/pages/ReceivingPage.ts` exports `./ReceivingGatePage`.
- `src/pages/ReceivingGatePage.tsx` contains the real gate-driven Receiving page.
- Active plant traveler action projection is explicit and green on main.

Known seam still to clean:
- `src/pages/departments/DepartmentPageTools.tsx` still has at least one direct `traveler.actions` read.
- It is not currently breaking the build because `PlantTraveler.actions` remains as a compatibility projection.
- Clean target: import `getPlantTravelerMaterialAction` from `../../logic/plantTravelerSelectors` and replace the direct material-action lookup.

Protected shared files:
- `src/App.tsx`
- `src/components/shell/AppDrawer.tsx`
- `src/components/shell/AppHeader.tsx`
- `src/components/shell/DevToolkitFlyout.tsx`

Core rules:
- App.tsx mostly routes.
- Pages compose.
- Logic modules think.
- Components display.
- Prefer focused changes over giant rewrites.
- Verify builds after source changes.
- Do not update large files from truncated connector output.
- Do not use compatibility projections as hidden new architecture.
