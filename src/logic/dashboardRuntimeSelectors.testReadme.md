# Dashboard Runtime Selectors Verification

This file documents the expected behavior for `dashboardRuntimeSelectors.ts` until automated tests are added.

## Selector contract

`getDashboardRuntimeTruth(alertCount)` must be the dashboard's single order truth source.

It returns runtime-adjusted values for:

- `allOrders`
- `openOrders`
- `blockedOrders`
- `materialIssues`
- `qaHolds`
- `runnableOrders`
- `dueSoonOrders`
- `plantCriticals`

## Runtime alignment requirement

Dashboard metrics must not calculate directly from `productionOrders` after this selector is wired into `DashboardPage.tsx`.

Replace local calculations like:

```ts
const openOrders = productionOrders.filter((order) => order.status !== 'DONE');
```

with:

```ts
const {
  allOrders,
  openOrders,
  blockedOrders,
  materialIssues,
  qaHolds,
  runnableOrders,
  dueSoonOrders,
  plantCriticals,
} = getDashboardRuntimeTruth(alerts.length);
```

## Manual verification

1. Open dashboard.
2. Note blocked/material/QA counts.
3. Click embedded prompt card that applies a runtime action.
4. Confirm prompt card updates.
5. Confirm dashboard metric values use the same runtime-adjusted order state.

## Current band-aid status

The selector exists and is staged, but `DashboardPage.tsx` still needs to consume it directly.
