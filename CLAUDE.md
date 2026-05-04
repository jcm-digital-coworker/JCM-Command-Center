# Claude.md - JCM Command Center Development Guide

## ⚠ Contributor Protocol — Read Before Writing Any Code

**Every session must start with:**
```bash
git fetch origin main && git log HEAD..origin/main --oneline
```

If main is ahead of your branch, pull it before writing anything:
```bash
git pull origin main
npm run build   # verify clean before starting
```

**Why this matters:**
Main moves fast. It may already contain the component, logic file, or data field you are about to build. Do not duplicate work. Do not build on stale code. Check main first — every time, no exceptions.

**What to look for after fetching:**
- New files in `src/logic/` — workflow engine, selectors, evaluators, navigation contracts, plant signals
- New files in `src/components/dashboard/` — command cards, dept health tiles, plant signals panel
- New files in `src/components/common/` — accordion, smart empty state
- New fields on `ProductionOrder` — `workflowOrigin`, `engineeringRequired`, `salesReleasedAt`, `blueprintId`, `productLane`, `dependencies`, `qaStatus`
- New `Department` values — `Sales`, `Engineering` are live
- New work centers in `workCenters.ts`
- Changes to `AppDrawer.tsx` — new tabs may already be wired
- `CURRENT_BUILD_STATE.md` and `LATEST_ACTION_RUN.md` — GPT maintains these; read them for context on recent automated changes

**After checking main:**
1. Review the Phase 2 status section below to see what is done vs. queued
2. Review recently changed files before touching them
3. If a component already solves the problem — use it, don't rebuild it

---

## Project Overview

**Name:** JCM Digital Co-worker Command Center
**Company:** JCM Industries (pipe fitting manufacturer, Nash, Texas)
**Address:** 200 Old Boston Road, Nash TX 75569 | 903-832-2581
**Founded:** 1976 by James C. Morriss Jr.
**Purpose:** Plant-wide manufacturing operations dashboard and maintenance tracking system
**Status:** Phase 2 complete — workflow engine live, dashboard fully wired, fluidity done

---

## Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** CSS-in-JS (inline styles, no external UI libraries)
- **State:** React useState/useMemo hooks + custom event bus for runtime state
- **Data:** localStorage (demo/pilot phase) — Supabase queued for Phase 3
- **CI:** GitHub Actions (`.github/workflows/build.yml`) — runs on every push
- **Development:** GitHub Codespaces

---

## Core Laws

- Guidance > Control
- Structured selections > free text
- Selections drive logic; notes explain exceptions
- Global command = mission visibility
- Department views = local action
- App.tsx routes only
- Pages compose
- Modules think
- Components display

---

## System Model

- Plant-first Command Center
- Department-specific action pages: Receiving, Fab, Coating, Assembly, Shipping, QA, Material Handling, Sales, Engineering
- Flow-driven decisions: what can run vs blocked
- Crew Guidance integrated into departments: who is needed where
- Structured selection inputs tied to real plant data: workers, assets, orders
- Role-based views: Operator / Lead / Supervisor / Manager / Maintenance / QA / Forklift

---

## Execution Rules

- Keep changes surgical and stable
- No breaking working systems unless necessary
- Prefer patch-style updates over full rewrites
- Call out bad ideas or weak logic directly
- Maintain mobile-first simplicity
- Always tie UI to real plant behavior
- Do not create duplicate src folders
- Do not wrap the project in another folder

---

## File Structure

```
src/
├── components/
│   ├── cards/
│   │   ├── MachineCard.tsx
│   │   ├── MaintenanceTaskCard.tsx
│   │   ├── RiskCard.tsx
│   │   └── SimulationCard.tsx
│   ├── common/
│   │   ├── AccordionSection.tsx     ← collapsible section with count badge + color
│   │   └── SmartEmptyState.tsx      ← contextual empty state component
│   ├── dashboard/
│   │   ├── ClassificationReviewQueue.tsx ← order classification review UI
│   │   ├── CommandRecommendationCard.tsx  ← plant status severity card
│   │   ├── DashboardOverviewPanels.tsx    ← overview panel row on Dashboard
│   │   ├── DashboardWorkCenterCard.tsx    ← work center card on Dashboard
│   │   ├── DeptHealthTilesPanel.tsx       ← 8-dept live health tiles (orders, crew, blocked)
│   │   ├── PlantSignalsPanel.tsx          ← live plant signals (QA holds, material issues, etc.)
│   │   └── dashboardStyles.ts             ← shared DashboardTheme + color helpers
│   ├── orders/
│   │   └── OrderDetailModal.tsx     ← order detail modal (close + go-to-orders)
│   ├── shell/
│   │   ├── AppHeader.tsx            ← back button + menu button
│   │   ├── AppDrawer.tsx            ← nav drawer + Dev Tools section
│   │   ├── CommandNavigationBar.tsx ← command navigation bar (role-aware)
│   │   └── DepartmentCards.tsx      ← (dead — not imported; safe to delete)
│   ├── EngineeringBacklogPanel.tsx  ← engineering order backlog
│   ├── LiveCoveragePanel.tsx        ← crew sign-in shortcuts (supervisor only)
│   ├── MachineDetail.tsx
│   ├── ReceivingClosurePanel.tsx    ← receiving material closure loop
│   ├── ReceivingWorkflowPanel.tsx
│   ├── StatusBadge.tsx
│   ├── PriorityBadge.tsx
│   ├── WorkCenterWorkflowPanel.tsx  ← v1 (order signals, static)
│   ├── WorkCenterWorkflowPanelV2.tsx ← v2 (grouped by operator responsibility, runtime-aware, crew strip)
│   ├── Lv4500JcmSimulator.tsx
│   ├── TabButton.tsx                ← shared tab button primitive
│   └── travelers/
│       ├── ClassificationReviewCapture.tsx ← classification review questionnaire UI
│       ├── DynamicTravelerCard.tsx   ← order traveler card (route, status, actions)
│       ├── PlantTravelerDetailModal.tsx ← full plant traveler modal
│       └── TravelerDetailModal.tsx   ← action buttons; MARK_READY_FOR_HANDOFF + REPORT_ISSUE are notify-only
├── data/
│   ├── classificationReviewChecklist.ts ← checklist items for order classification review
│   ├── coWorkers.ts         ← CoWorker type + getAvailableCoWorkersForDepartment()
│   ├── coverage.ts          ← 28+ named workers, full shift coverage
│   ├── departmentOperatingProfiles.ts ← DepartmentOperatingProfile (STRONG/PARTIAL/PLACEHOLDER)
│   ├── departmentResources.ts ← TravelerResource seed data (docks, cells, stations)
│   ├── documents.ts         ← NSF 61, AWWA, WPS, Powercron SOP, torque specs
│   ├── lv4500JcmSuite.ts   ← LV4500 fixture limits, boss/casting/tap code data
│   ├── machine.ts
│   ├── maintenanceRequests.ts
│   ├── maintenance.ts
│   ├── materialCatalog.ts
│   ├── partBlueprints.ts    ← simulated part blueprint data
│   ├── plantAssets.ts       ← PlantAsset[] (physical plant assets with IDs)
│   ├── productClassificationRules.ts ← model-signal rules for classifyProductionOrder
│   ├── productFamilies.ts
│   ├── productFlows.ts      ← ProductFlow[] per product lane (SERVICE_SADDLE, etc.)
│   ├── productionOrders.ts  ← 24 orders: 8 SALES origin + 16 LEGACY_SHOP_FLOOR
│   ├── receivingOrders.ts   ← seedReceivingOrders: ReceivingOrder[]
│   ├── risk.ts              ← 14 real JCM manufacturing risks
│   ├── structuredSelections.ts ← form selection helpers (assets, orders, roles, co-workers)
│   ├── workCenterAssets.ts
│   ├── workCenterResources.ts
│   ├── workCenters.ts       ← includes Sales and Engineering work centers
│   ├── workers.ts           ← 28 named workers with real JCM job titles
│   ├── workRoles.ts
│   └── warRoomContext.ts    ← includes JCM company profile block
├── logic/
│   ├── blockerAge.ts            ← getOrderLastTouchedHours, getBlockerAgeLabel, getBlockerAgeTone
│   ├── classificationReviewConfirmations.ts ← classification review confirmation storage
│   ├── classifyProductionOrder.ts           ← product classification via rules engine
│   ├── commandRecommendations.ts            ← PlantStatusSeverity + CommandRecommendation array
│   ├── coverage.ts
│   ├── crewGuidance.ts          ← (moved from modules/) crew guidance logic
│   ├── dashboardQuickActions.ts ← quick action items keyed by role + NavigationIntent
│   ├── dashboardRuntimeSelectors.ts ← DashboardRuntimeTruth (blocked, material, QA, runnable)
│   ├── dynamicTraveler.ts       ← generateDynamicTravelers()
│   ├── flowLogic.ts             ← getOrderLane(), getProductFlow() resolution
│   ├── lv4500JcmCycleTime.ts   ← LV4500 cycle time estimates (totalMinutes, confidence)
│   ├── lv4500JcmSimulator.ts   ← LV4500 tap code simulation
│   ├── machineSimulators.ts
│   ├── maintenanceRepeatOffenders.ts ← flags assets with 3+ requests in 30 days
│   ├── navigationAccess.ts      ← NavigationGroupId + role-based NavigationItem visibility
│   ├── navigationContracts.ts   ← NavigationIntent union + getNavigationTab() resolver
│   ├── operatorNextBestActions.ts ← OperatorNextBestActionModel for station tablets
│   ├── orderBlueprints.ts       ← blueprint resolution + missing-blueprint kickback
│   ├── orderReadiness.ts        ← getAutomaticBlockReason() for automatic blocker detection
│   ├── orderWorkflow.ts         ← workflow signal generation
│   ├── plantSignals.ts          ← getPlantSignals() → PlantSignal[] (QA holds, material, etc.)
│   ├── receivingWorkflow.ts     ← receiving order CRUD + RECEIVING_STORAGE_KEY
│   ├── skillGapAlerts.ts        ← maps WorkerSkill→skillTags, surfaces coverage gaps
│   ├── warnings.ts
│   ├── workflowActions.ts       ← action logging helpers
│   ├── workflowEvaluation.ts    ← checkpoint-based workflow evaluator
│   ├── workflowPanelSelectors.ts ← groups orders by operator responsibility
│   └── workflowRuntimeState.ts  ← runtime reducer + custom event bus
├── modules/
│   └── crewGuidance.ts          ← (legacy location; logic/ version is canonical)
├── pages/
│   ├── WorkflowMobilePage.tsx   ← role-based: Operator / Lead / Manager views (imported as WorkflowPage in App.tsx)
│   ├── DashboardPage.tsx        ← Plant Pressure Score + DeptHealthTiles + live timestamp
│   ├── MachinesPage.tsx
│   ├── MaintenancePage.tsx
│   ├── MaintenanceRequestsPage.tsx ← embeds MaintenanceSubmitPage
│   ├── MaintenanceSubmitPage.tsx   ← submission form (embedded, not a route)
│   ├── MaintenanceAnalyticsPage.tsx
│   ├── DocumentsPage.tsx
│   ├── RiskPage.tsx
│   ├── OrdersPage.tsx           ← live orders, blocker age, urgency score, dept link buttons
│   ├── CoveragePage.tsx
│   ├── PlantMapPage.tsx
│   ├── ReceivingPage.tsx
│   ├── ShiftHandoffPage.tsx     ← end-of-shift snapshot; 5 section toggles; text report copy
│   ├── SimulationPage.tsx       ← machine simulation (LV4500 tap codes)
│   ├── WorkCenterDetailPage.tsx ← station tablet, WorkCenterWorkflowPanelV2, QR deep-link
│   ├── WarRoomContextPage.tsx   ← dev/internal only
│   └── departments/
│       ├── DepartmentPageTools.tsx      ← PageShell, Section, OrderCard, LiveCrewSection (+ skill gap alerts + onGoToTab), CardGrid, helpers
│       ├── SalesDepartmentPage.tsx
│       ├── EngineeringDepartmentPage.tsx
│       ├── MaterialHandlingDepartmentPage.tsx
│       ├── FabDepartmentPage.tsx
│       ├── CoatingDepartmentPage.tsx
│       ├── AssemblyDepartmentPage.tsx
│       ├── ShippingDepartmentPage.tsx
│       ├── SaddlesDepartmentPage.tsx    ← Saddles cell — LV4500 service saddle production
│       └── QADepartmentPage.tsx
├── types/
│   ├── app.ts                   ← AppTab (includes saddles, shiftHandoff), RoleView, DepartmentFilter
│   ├── classificationReview.ts  ← ClassificationReviewQuestion/Answer/Confirmation
│   ├── coverage.ts              ← CoveragePerson type
│   ├── documents.ts             ← Document type
│   ├── dynamicTraveler.ts       ← DynamicTraveler, TravelerAction, TravelerActionType (incl. COMPLETE_ORDER)
│   ├── lv4500Jcm.ts             ← BossType, CastingData, TapCodeData for LV4500 simulation
│   ├── machine.ts               ← Department type (includes Sales, Engineering, Saddles Dept)
│   ├── maintenance.ts
│   ├── maintenanceRequest.ts
│   ├── partBlueprint.ts         ← blueprint packet types
│   ├── plant.ts                 ← WorkCenter and Plant types
│   ├── plantAsset.ts            ← PlantAsset (physical hardware distinct from machines)
│   ├── productClassification.ts ← ProductClassification, ProductClassificationRule
│   ├── productFlow.ts           ← ProductFlow (per-lane routing)
│   ├── productionOrder.ts       ← includes workflowOrigin, engineeringRequired, salesReleasedAt
│   ├── receiving.ts             ← ReceivingOrder, ReceivingOrderDraft, ReceivingOrderStatus
│   ├── resourceModel.ts         ← TravelerResource type (docks, cells, stations)
│   ├── risk.ts                  ← RiskItem type
│   ├── workCenterAsset.ts       ← WorkCenterAsset type
│   ├── workRole.ts              ← WorkRole type
│   └── worker.ts                ← Worker type with skills[]
├── utils/
│   └── export.ts
├── App.tsx       ← routing only, tabHistory back navigation
├── index.css
└── main.tsx
```

---

## Navigation Architecture

- **Tab routing** lives entirely in `App.tsx` via `tab` state
- **Back navigation** uses `tabHistory` stack — `navigateTo()` pushes, `goBack()` pops
- **AppHeader** shows `← BACK` when history exists, `☰ MENU` when at root
- **AppDrawer** contains all nav links + Dev Tools at the bottom
- `WorkflowPage` is the default landing tab for all roles

### Dev Tools (drawer, bottom section)
- Role switcher — for testing role views until login is implemented
- Department switcher — for testing dept-filtered views
- War Room Context — internal architecture reference

---

## Role Views

| Role | Default Landing | View Tier |
|------|----------------|-----------|
| Operator | WorkflowPage | Minimal: my orders, machines, submit request |
| Lead / Supervisor | WorkflowPage | + crew on shift, all dept orders, quick nav |
| Manager | WorkflowPage | + plant-wide dept health, priority orders, crew summary |
| Maintenance | Maintenance tab | Maintenance requests |
| Forklift / Receiving | Receiving tab | Ready queue |
| QA | WorkflowPage | Manager-tier view |

---

## Workflow Engine (Phase 2 — Live)

The workflow engine drives what operators see on station tablets. Key files:

| File | Purpose |
|------|---------|
| `logic/workflowEvaluation.ts` | Checkpoint evaluator — determines what gate blocks an order |
| `logic/workflowRuntimeState.ts` | In-memory runtime reducer — holds operator actions, fires `WORKFLOW_RUNTIME_UPDATED_EVENT` |
| `logic/workflowPanelSelectors.ts` | Groups orders into DO_NOW / BLOCKED_HERE / UPSTREAM_ACTION / INCOMING / WATCH_ONLY |
| `logic/orderWorkflow.ts` | Generates the workflow signal (gate, message, action, pressure score) |
| `logic/orderBlueprints.ts` | Resolves part blueprints and detects missing-blueprint kickback |
| `logic/workflowActions.ts` | Logs operator actions to localStorage |

**WorkCenterWorkflowPanelV2** is the primary station tablet card. It:
- Listens to `WORKFLOW_RUNTIME_UPDATED_EVENT` and `storage` to re-render on action
- Groups orders by operator responsibility
- Shows crew on shift for this work center
- Routes action buttons to Receiving, Engineering, or Maintenance

**TravelerDetailModal** action buttons — "Guidance > Control" enforced:
- `REQUEST_MATERIAL` → `applyWorkflowRuntimeAction(order, 'REQUEST_MATERIAL')`
- `MARK_READY_FOR_HANDOFF` → `addWorkflowAction()` only (notify/log — does NOT mutate order state)
- `SEND_TO_NEXT_DEPARTMENT` → `applyWorkflowRuntimeAction(order, 'ADVANCE_DEPARTMENT', note, { currentDepartment: next })`
- `COMPLETE_ORDER` → `applyWorkflowRuntimeAction(order, 'COMPLETE_ORDER')` then closes modal
- `REPORT_ISSUE` → `addWorkflowAction()` only (notify/log — does NOT clear blockers)

**Station tablets (WorkCenterWorkflowPanelV2)** are a direct action surface and may call `applyWorkflowRuntimeAction` for `START_WORK`, `ESCALATE_ENGINEERING`, `REQUEST_MATERIAL`.

**WorkflowRuntimeState** action kinds:
`REQUEST_MATERIAL | MARK_MATERIAL_STAGED | ESCALATE_ENGINEERING | ACKNOWLEDGE_ORDER | START_WORK | RESOLVE_BLOCKER | ADVANCE_DEPARTMENT | COMPLETE_ORDER`

`applyWorkflowRuntimeAction(orderNumber, actionKind, note?, extraOverrides?)` — `extraOverrides` allows patching additional fields (e.g., `currentDepartment`) beyond what the reducer produces.

**QR deep-link**: `WorkCenterDetailPage` on mount checks `?wc=<workCenterId>` URL param and navigates directly to that station tablet. "Copy Station Link" button writes the URL to clipboard.

---

## Production Order Fields (key additions)

```typescript
workflowOrigin: 'SALES' | 'LEGACY_SHOP_FLOOR'
engineeringRequired: boolean
engineeringStatus: 'PENDING' | 'RELEASED' | 'NOT_REQUIRED'
productionSupervisorAcknowledged: boolean
salesReleasedAt: string         // ISO timestamp
blueprintId: string             // links to partBlueprints
partNumber: string
drawingRevision: string
materialStatus: MaterialStatus
```

---

## Code Patterns & Conventions

### Theme System

```typescript
interface PageProps {
  theme?: 'dark' | 'light';
}

export default function Page({ theme = 'dark' }: PageProps) {
  // Use theme-aware style functions at bottom of file
}
```

**Theme Colors:**
```typescript
// Dark Mode
backgrounds: '#0f172a', '#1e293b'
text: '#e2e8f0', '#cbd5e1', '#64748b'
borders: '#334155', '#475569'
accent: '#f97316' (safety orange)

// Light Mode
backgrounds: '#ffffff', '#f8fafc', '#f1f5f9'
text: '#0f172a', '#475569', '#64748b'
borders: '#cbd5e1', '#e2e8f0'
accent: '#f97316' (safety orange)
```

### Industrial Aesthetic

- **Typography:** Uppercase headers, 800 weight, letter-spacing
- **Colors:** Dark slate with safety orange accents
- **Spacing:** Information density over whitespace
- **Status Badges:** Colored left borders (4px solid)
- **No emojis** in navigation (okay in content cards)

---

## localStorage Schema

- `jcm_theme` — 'dark' | 'light'
- `jcm_maintenance_requests` — MaintenanceRequest[]
- `jcm_live_coverage_v1` — CoveragePerson[] (falls back to seedCoverage; includes Sales + Engineering crew)
- `jcm_workflow_actions` — WorkflowAction[] (action log)
- `jcm_workflow_runtime_state` — WorkflowRuntimeState (order overrides keyed by orderNumber)
- `jcm_receiving_orders_v1` — ReceivingOrder[]
- `jcm-classification-review-confirmations-v1` — ClassificationReviewConfirmation[]
- `jcm_role_view` — RoleView (persisted role selection from dev tools switcher)
- `jcm-classification-review-target-v1` — orderNumber string (order queued for classification review; written by WorkCenterWorkflowPanelV2, read by ClassificationReviewQueue)

---

## Phase Status

### Phase 1 — Complete
- Maintenance request submission + tracking
- Analytics to show value
- CSV export for management review
- Mobile-friendly interface

### Phase 2 — Complete

**Done:**
- Role-based WorkflowPage (Operator / Lead / Manager)
- Back navigation (tabHistory stack)
- Dev Tools in drawer (role/dept switchers, War Room)
- Real JCM data: workers, coverage, documents, risk, productionOrders (all files)
- WorkCenterWorkflowPanelV2 — station tablet grouped by operator responsibility, crew strip
- Checkpoint-based workflow evaluator
- Runtime state reducer with custom event bus
- Panel selectors (DO_NOW / BLOCKED_HERE / UPSTREAM_ACTION / INCOMING / WATCH_ONLY)
- Sales + Engineering departments, work centers, and department pages
- GitHub Actions CI pipeline
- Crew data (LiveCrewSection) wired into all department pages
- onOpenEngineering wired WorkCenterDetailPage → App.tsx → orders tab
- OrderCard rewritten to show real data (priority, flowStatus, blockers, route)
- Photo attachments on maintenance requests (base64, max 3, 2MB each)
- All 5 maintenance priorities surfaced in submit form (NORMAL / URGENT / LINE_DOWN / MACHINE_DOWN / SAFETY)
- Live order mutations: TravelerDetailModal ADVANCE_DEPARTMENT, COMPLETE_ORDER, REQUEST_MATERIAL wired to applyWorkflowRuntimeAction
- Saddles department page (SaddlesDepartmentPage) — crew, assets, active/blocked orders
- Maintenance repeat offender detection — `getRepeatOffenders()` flags 3+ requests in 30 days, surfaced on MaintenancePage
- Skill gap alerts — `getSkillGapAlerts()` compares required WorkerSkill vs coverage skillTags; shown as amber banner in LiveCrewSection
- Shift Handoff page — uses `getRuntimeProductionOrders()` for live order state; text report copy button; 5 section toggles
- QR deep-link — `?wc=<id>` URL param jumps directly to station tablet; "Copy Station Link" button on WorkCenterDetailPage
- Deleted orphaned pages: FlowPage.tsx (old flow visualizer — replaced by flowLogic.ts + dept pages)
- Blocker age tracking — `blockerAge.ts` surfaced on OrdersPage (fresh/aging/stale color coding)
- Department Health Tiles — `DeptHealthTilesPanel.tsx` on Dashboard: 8 dept live tiles, click-to-navigate
- Plant Pressure Score — 0–100 metric on Dashboard (blocked × 15, alerts × 8, overdue × 10, material × 5)
- Order activity timeline — `OrderActivitySection` in TravelerDetailModal merges action log + runtime lastAction
- `onGoToTab` prop threading — all 9 dept pages + OrdersPage accept `onGoToTab?: (tab: AppTab) => void`
- Crew gap action bridge — "→ OPEN COVERAGE" button in LiveCrewSection skill gap alert banner
- PlantMapPage cleanup — theme-aware closeButtonStyle, no more void theme
- `navigationContracts.ts` — NavigationIntent union (14 intents) + `getNavigationTab()` resolver
- `operatorNextBestActions.ts` — OperatorNextBestActionModel for station tablet next-best-action lanes
- `plantSignals.ts` + `PlantSignalsPanel.tsx` — live plant signals (QA holds, material issues, blockers)
- `dashboardRuntimeSelectors.ts` — `getDashboardRuntimeTruth()` unified selector for Dashboard
- `commandRecommendations.ts` + `CommandRecommendationCard.tsx` — plant severity → action recommendation
- `classifyProductionOrder.ts` + `ClassificationReviewQueue.tsx` — product classification review flow
- `receivingWorkflow.ts` — receiving order CRUD with `jcm_receiving_orders_v1` storage
- `flowLogic.ts` — `getOrderLane()` + `getProductFlow()` product lane resolution
- `orderReadiness.ts` — `getAutomaticBlockReason()` automatic blocker detection
- `navigationAccess.ts` — role-based navigation item visibility
- `AccordionSection.tsx`, `SmartEmptyState.tsx`, `OrderDetailModal.tsx` — shared UI components
- DashboardPage live timestamp — green "Updated HH:MM:SS" on WORKFLOW_RUNTIME_UPDATED_EVENT

**Queued for Phase 3:**
- Supabase backend (replace localStorage)
- Multi-user real-time sync
- Email / push notifications
- Login / authenticated role assignment

**Dead code / known gaps:**
- `DepartmentCards.tsx` in `components/shell/` is not imported anywhere. Safe to delete.
- Skill systems are split: `workers.ts` has typed `skills: WorkerSkill[]`, but `skillGapAlerts.ts` reads `coverage.ts` free-text `skillTags`. Not unified — fuzzy keyword matching bridges them for now.
- No Office department page — 1 order with `currentDepartment: 'Office'` exists but it's admin-only, no dept page needed.

**Important: production order status values in seed data**
Orders use lowercase/mixed values: `'ready'`, `'blocked'`, `'hold'` — NOT `'IN_PROGRESS'`, `'DONE'`, `'COMPLETE'`.
Runtime overrides may write uppercase (e.g., `'DONE'`). Always normalize when filtering.

### Phase 3 (Future)
- ERP/MES integration
- Historical trend analysis
- Login / authenticated role assignment (see Queued above)
- Supabase backend + multi-user real-time sync

---

## Architecture Direction

Moving toward modular structure:
```
src/modules/
  command/
  orders/
  flow/
  crew/
  departments/
  maintenance/
  plant/
```
Currently `src/modules/crewGuidance.ts` exists. Full migration after Phase 2 stabilizes.

---

## Quick Reference

```bash
# Always do this first
git fetch origin main && git log HEAD..origin/main --oneline

npm run dev          # start dev server
npm run build        # type-check + build
git status
git add src/...
git commit -m "message"
git push -u origin <your-branch>
```

---

**Last Updated:** May 4, 2026
**Version:** v1.5 (Phase 2 complete — dashboard fully wired, blocker age, dept health tiles, plant pressure score, navigation contracts, operator next-best-actions, classification review, fluidity done)
**Developer:** Manufacturing Engineering Technician, JCM Industries, Nash, Texas
