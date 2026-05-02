# Active Band-Aids Log

Purpose: track temporary implementation bridges so they do not quietly become permanent architecture.

## Open Band-Aids

### 1. Embedded prompt mount adapter

- Status: OPEN
- Location: `src/logic/dashboardQuickActionRuntimeBridge.ts`
- Why it exists: `DashboardPage.tsx` has been difficult/risky to patch safely through the current connector because it is a large file. The old direct DOM prompt creation has been replaced by a real React component, but the component is still mounted through a small adapter.
- Current safer state: Prompt cards now live in `src/components/dashboard/EmbeddedPromptCards.tsx` and are rendered by React. The adapter only finds the Quick Actions section and mounts the component.
- Risk: The adapter still finds Quick Actions by section text. A future label change from `QUICK ACTIONS` could break prompt placement.
- Corrective action: Render `<EmbeddedPromptCards />` directly inside `DashboardPage.tsx` under `<QuickActionsPanel />`, then remove `dashboardQuickActionRuntimeBridge.ts` and the side-effect import from `src/main.tsx`.

### 2. First-order runtime targeting

- Status: OPEN
- Location: `src/logic/quickActionRuntimeTargets.ts`
- Why it exists: The first safe version targeted the first blocked order or first material issue.
- Risk: May act on a low-priority issue before a hot or critical order.
- Corrective action: Add priority-aware selectors using priority, projected ship date, hard blockers, and department/role relevance.

### 3. Inline dashboard styling

- Status: OPEN
- Location: dashboard pages/components
- Why it exists: Fast UI iteration used inline style objects.
- Risk: Styling is harder to standardize, reuse, and tune for mobile.
- Corrective action: Extract shared dashboard card/button/prompt styles or component primitives after behavior is stable.

## Recently Retired Band-Aids

### Dashboard order metrics not fully runtime-truth aligned

- Status: RETIRED
- Former location: `src/pages/DashboardPage.tsx`
- Retired by: `src/logic/dashboardRuntimeSelectors.ts`
- Notes: Dashboard metrics now consume runtime-adjusted order truth through `getDashboardRuntimeTruth(alerts.length)` instead of calculating directly from raw `productionOrders`.

### Direct DOM prompt cards

- Status: RETIRED
- Former location: `src/logic/dashboardQuickActionRuntimeBridge.ts`
- Retired by: `src/components/dashboard/EmbeddedPromptCards.tsx`
- Notes: Prompt card rendering is now owned by React. The remaining adapter is only a mount shim.

### Visible-label runtime intent matching

- Status: RETIRED
- Former behavior: bridge inferred runtime actions from visible button text.
- Retired by: stable runtime intent handling in prompt-card data flow.

### Prompt route label fallback

- Status: RETIRED
- Former behavior: prompt routing clicked a Quick Action button by visible text.
- Retired by: stable `jcm:navigate` event handled by `App.tsx`.
