# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

Current build state:
- Latest recorded Action is RED.
- Run ID 25404384057
- Source commit 6a64e4531d78968cd8b025574733b2854d810fc0
- Failure file: src/pages/departments/DepartmentPageTools.tsx
- Failure: PlantTraveler is being used as if it has an actions property.
- TypeScript errors:
  - Property actions does not exist on type PlantTraveler.
  - Parameter action implicitly has an any type.

Last known green app checkpoint:
- Run ID 25390936365
- Commit e9c0cb2bbe7795036e644d1406857c72aa34e5be
- Status SUCCESS

Stable completed work:
- DEV toolkit is one bottom-right floating DEV button.
- DEV floater includes feature flags, role selector, department selector, and context/status access if present.
- Receiving gate page is active through a shim.
- src/pages/ReceivingPage.ts exports ./ReceivingGatePage.
- src/pages/ReceivingGatePage.tsx contains the real gate-driven Receiving page.

Current broken change:
- Department order cards were moved toward plant traveler truth.
- The direction is correct, but the code reaches for traveler.actions on a PlantTraveler.
- Actions belong to the active department step inside traveler.departmentSteps, not to the PlantTraveler wrapper.

Immediate repair target:
- src/pages/departments/DepartmentPageTools.tsx

Suggested fix:
- In OrderCard, after generating the plant traveler, derive the active step from traveler.departmentSteps.
- Use activeStep.actions to find REQUEST_MATERIAL.
- Do not use traveler.actions.

Example shape:

const activeStep = traveler.departmentSteps.find((step) => step.department === traveler.activeDepartment) ?? traveler.departmentSteps.find((step) => step.stepStatus === 'READY' || step.stepStatus === 'ACTIVE' || step.stepStatus === 'BLOCKED' || step.stepStatus === 'HOLD');
const materialAction = activeStep?.actions.find((action) => action.type === 'REQUEST_MATERIAL');
const hasMaterialIssue = Boolean(materialAction?.enabled);

Do not touch unless requested:
- DEV toolkit work.
- Receiving shim cleanup.
- Giant App.tsx rewrites.

Current mission:
- Repair DepartmentPageTools.tsx build failure.
- Then continue dynamic traveler integration and department card consistency.

Likely related files:
- src/pages/departments/DepartmentPageTools.tsx
- src/logic/dynamicTraveler.ts
- src/logic/orderStatusTruth.ts
- src/pages/KanbanPage.tsx
- src/pages/OrdersPage.tsx
- src/components/NextHandoffBanner.tsx
- src/components/ReceivingClosurePanel.tsx

Protected shared files:
- src/App.tsx
- src/components/shell/AppDrawer.tsx
- src/components/shell/AppHeader.tsx
- src/components/shell/DevToolkitFlyout.tsx

Core rules:
- App.tsx mostly routes.
- Pages compose.
- Logic modules think.
- Components display.
- Prefer focused changes over giant rewrites.
- Verify builds after source changes.
