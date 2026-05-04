import type { ProductionOrder } from '../types/productionOrder';
import { productionOrders } from '../data/productionOrders';
import { getRuntimeProductionOrders } from './workflowRuntimeState';

export type DashboardRuntimeTruth = {
  allOrders: ProductionOrder[];
  openOrders: ProductionOrder[];
  blockedOrders: ProductionOrder[];
  materialIssues: ProductionOrder[];
  qaHolds: ProductionOrder[];
  runnableOrders: ProductionOrder[];
  dueSoonOrders: ProductionOrder[];
  plantCriticals: number;
};

export function getDashboardRuntimeTruth(alertCount = 0): DashboardRuntimeTruth {
  return selectDashboardRuntimeTruth(getRuntimeProductionOrders(productionOrders), alertCount);
}

export function selectDashboardRuntimeTruth(
  orders: ProductionOrder[],
  alertCount = 0,
): DashboardRuntimeTruth {
  const openOrders = orders.filter((order) => !isClosedOrder(order));
  const blockedOrders = openOrders.filter(isDashboardBlockedOrder);
  const materialIssues = openOrders.filter((order) => order.materialStatus !== 'RECEIVED');
  const qaHolds = openOrders.filter((order) => order.qaStatus === 'HOLD' || order.qaStatus === 'FAILED');
  const runnableOrders = openOrders.filter(isDashboardRunnableOrder);
  const dueSoonOrders = [...openOrders]
    .sort((a, b) => (a.projectedShipDate ?? '').localeCompare(b.projectedShipDate ?? ''))
    .slice(0, 4);

  return {
    allOrders: orders,
    openOrders,
    blockedOrders,
    materialIssues,
    qaHolds,
    runnableOrders,
    dueSoonOrders,
    plantCriticals: blockedOrders.length + materialIssues.length + qaHolds.length + alertCount,
  };
}

export function isDashboardBlockedOrder(order: ProductionOrder): boolean {
  return normalizeStatus(order.status) === 'BLOCKED' || normalizeStatus(order.flowStatus) === 'BLOCKED' || order.blockers.length > 0;
}

export function isDashboardRunnableOrder(order: ProductionOrder): boolean {
  const status = normalizeStatus(order.status);
  const flowStatus = normalizeStatus(order.flowStatus);
  return status === 'READY' || status === 'IN_PROGRESS' || flowStatus === 'RUNNABLE';
}

function isClosedOrder(order: ProductionOrder): boolean {
  const status = normalizeStatus(order.status);
  return status === 'DONE' || status === 'COMPLETE';
}

function normalizeStatus(value: string | undefined): string {
  return String(value ?? '').toUpperCase();
}
