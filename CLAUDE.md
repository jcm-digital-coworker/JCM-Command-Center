# Claude.md - JCM Command Center Development Guide

## Project Overview

**Name:** JCM Digital Co-worker Command Center  
**Company:** JCM Industries (pipe fitting manufacturer, Nash, Texas)  
**Purpose:** Plant-wide manufacturing operations dashboard and maintenance tracking system  
**Status:** Production-ready for Phase 1 pilot (3-5 operators)

---

## Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** CSS-in-JS (inline styles, no external UI libraries)
- **State:** React useState/useMemo hooks
- **Data:** localStorage (demo/pilot phase)
- **Development:** GitHub Codespaces (previously StackBlitz mobile)

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
- Department-specific action pages: Receiving, Fab, Coating, Assembly, Shipping, QA, Material Handling
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
│   ├── shell/
│   │   ├── AppHeader.tsx       ← back button + menu button
│   │   └── AppDrawer.tsx       ← nav drawer + Dev Tools section
│   ├── MachineDetail.tsx
│   ├── StatusBadge.tsx
│   ├── PriorityBadge.tsx
│   └── Lv4500JcmSimulator.tsx
├── data/
│   ├── machine.ts
│   ├── maintenanceRequests.ts
│   ├── maintenance.ts
│   ├── coverage.ts
│   ├── workers.ts
│   ├── productionOrders.ts
│   ├── workCenters.ts
│   ├── documents.ts
│   ├── risk.ts
│   └── [more data files]
├── logic/
│   ├── warnings.ts
│   ├── machineSimulators.ts
│   └── [simulator logic files]
├── modules/
│   └── crewGuidance.ts
├── pages/
│   ├── WorkflowPage.tsx        ← role-based: Operator / Lead / Manager views
│   ├── DashboardPage.tsx
│   ├── MachinesPage.tsx
│   ├── MaintenancePage.tsx
│   ├── MaintenanceRequestsPage.tsx
│   ├── MaintenanceAnalyticsPage.tsx
│   ├── DocumentsPage.tsx
│   ├── RiskPage.tsx
│   ├── OrdersPage.tsx
│   ├── CoveragePage.tsx
│   ├── PlantMapPage.tsx
│   ├── ReceivingPage.tsx
│   ├── WarRoomContextPage.tsx  ← dev/internal only
│   └── [department pages]
├── theme/
│   └── theme.ts
├── types/
│   ├── app.ts                  ← AppTab, RoleView, DepartmentFilter
│   ├── machine.ts
│   ├── maintenanceRequest.ts
│   ├── maintenance.ts
│   └── [more type definitions]
├── utils/
│   └── export.ts
├── App.tsx                     ← routing only, tabHistory back navigation
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

## Current Features

### Complete & Working

1. **Workflow Page** — role-based view (Operator / Lead / Manager)
2. **Back Navigation** — full tab history stack, `← BACK` in header
3. **Dashboard** — overview of machine status, alerts, maintenance
4. **Maintenance System** — request submission, workflow, scheduled tasks, analytics, CSV export
5. **Machine Monitoring** — grid view, alert filtering, CNC diagnostics, simulators
6. **Production** — orders tracking, coverage/crew management, receiving workflow, plant mapping
7. **Safety** — risk tracking
8. **Documents** — categorized plant docs
9. **Dark/Light Theme** — full app support
10. **Mobile-Friendly** — touch-optimized

---

## localStorage Schema

- `jcm_theme` — 'dark' | 'light'
- `jcm_maintenance_requests` — MaintenanceRequest[]

---

## Phase Status

### Phase 1 — Complete
- Maintenance request submission + tracking
- Analytics to show value
- CSV export for management review
- Mobile-friendly interface
- Target: 3-5 Machine Shop operators

### Phase 2 — In Progress
**Done:**
- Role-based WorkflowPage
- Back navigation (tabHistory stack)
- Dev Tools in drawer (role/dept switchers, War Room)

**Queued:**
- App fluidity (rough spots, incomplete pages)
- Supabase backend (replace localStorage) — after app is solid
- Multi-user real-time sync
- Photo attachments on maintenance requests
- Email notifications

### Phase 3 (Future)
- ERP/MES integration
- Historical trend analysis
- Login / authenticated role assignment

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
npm run dev          # start dev server
npm run build        # type-check + build
git status
git add src/...
git commit -m "message"
git push -u origin claude/pull-repo-gl8xw
```

---

**Last Updated:** April 30, 2026  
**Version:** v1.1 (Phase 2 in progress)  
**Developer:** Manufacturing Engineering Technician, JCM Industries, Nash, Texas
