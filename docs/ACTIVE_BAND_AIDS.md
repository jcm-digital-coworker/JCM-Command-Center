# Active Band-Aids Log

Purpose: track temporary implementation bridges so they do not quietly become permanent architecture.

## Repo Operation Protocols

### Large-file update protocol: use Git tree path, not contents update

- Status: ACTIVE PROTOCOL
- Applies to: large/high-churn files such as `src/pages/DashboardPage.tsx` and `src/App.tsx`.
- Problem discovered: GitHub contents updates require the exact target file blob SHA. For large files, connector output can be truncated or expose misleading SHA-looking values, causing `409: SHA does not match` failures.
- Corrective protocol: bypass the contents API for large-file replacements and use Git data operations instead:
  1. Find the latest known main commit SHA.
  2. Use `create_tree` with `base_tree_sha` set to the latest main commit SHA and `tree_elements` containing the replacement file content.
  3. Use `create_commit` with the new tree SHA and parent set to the latest main commit SHA.
  4. Use `update_ref` to move `main` to the new commit SHA with `force: false`.
  5. Verify GitHub Actions before stacking more changes.
- Proven working example: commit `68160453ad41d5fe831621a872331106ae8034ae` used this path to update `src/pages/DashboardPage.tsx` and retire dashboard runtime-truth drift.
- Rule: use `update_file` for small files when the blob SHA is available. Use the Git tree path for large files or any file where the contents API SHA becomes unreliable.

## Open Band-Aids

### 1. Inline dashboard styling

- Status: STAGED
- Location: dashboard pages/components
- Why it exists: Fast UI iteration used inline style objects.
- Current safer state: `src/components/dashboard/dashboardStyles.ts` now contains shared dashboard prompt/card/metric/section/list style helpers. `EmbeddedPromptCards.tsx` consumes those helpers, and `DashboardPage.tsx` now consumes shared dashboard style primitives for its major reusable structures.
- Risk: `DashboardPage.tsx` still has a few local style helpers for work-center-specific badges/cards and small one-off composed layout styles.
- Corrective action: Extract remaining work-center-specific dashboard styles into shared helpers or a dedicated `DashboardWorkCenterCard` component.

## Recently Retired Band-Aids

### Embedded prompt mount adapter

- Status: RETIRED
- Former location: `src/logic/dashboardQuickActionRuntimeBridge.ts`
- Retired by: direct `<EmbeddedPromptCards onNavigate={onGoToTab} />` render inside `src/pages/DashboardPage.tsx`.
- Notes: Prompt cards are now owned by DashboardPage. The global bridge side-effect import in `src/main.tsx` should remain removed.

### First-order runtime targeting

- Status: RETIRED
- Former location: `src/logic/quickActionRuntimeTargets.ts`
- Retired by: priority-aware runtime target scoring.
- Notes: Quick actions now rank blocked/material targets by order priority, projected ship date urgency, blocker severity, material condition, QA state, and flow status instead of selecting the first matching order.

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
