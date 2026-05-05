# JCM Command Center Current Context

Repo: jcm-digital-coworker/JCM-Command-Center
Branch: main
Framework: React, TypeScript, Vite
Build: npm run build

Latest green build:
Run ID 25390936365
Commit e9c0cb2bbe7795036e644d1406857c72aa34e5be
Status SUCCESS

Stable state:
- DEV toolkit is one bottom-right floating DEV button.
- DEV floater includes feature flags, role selector, department selector, and context/status access if present.
- Receiving gate page is active through a shim.
- src/pages/ReceivingPage.ts exports ./ReceivingGatePage.
- src/pages/ReceivingGatePage.tsx contains the real gate-driven Receiving page.

Parked cleanup:
- Receiving entrypoint cleanup can happen later.
- The cleanup would move the gate page into ReceivingPage.tsx, remove the shim, and remove ReceivingGatePage.tsx if unused.

Current next mission:
- Dynamic traveler integration.
- Department order card consistency.
- Start with src/pages/departments/DepartmentPageTools.tsx.

Likely related files:
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
