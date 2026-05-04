import type { ProductionOrder } from '../types/productionOrder';
import { productionOrders } from '../data/productionOrders';
import {
  isBlockedProductionOrder,
  isClosedProductionStatus,
  isMaterialIssueStatus,
  isRunnableProductionOrder,
  normalizeOrderToken,
} from './orderStatusTruth';
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
  const openOrders = orders.filter((order) => !isClosedProductionStatus(order.status));
  const blockedOrders = openOrders.filter(isDashboardBlockedOrder);
  const materialIssues = openOrders.filter(isDashboardMaterialIssue);
  const qaHolds = openOrders.filter((order) => normalizeOrderToken(order.qaStatus) === 'HOLD' || normalizeOrderToken(order.qaStatus) === 'FAILED');
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
  return isBlockedProductionOrder(order);
}

export function isDashboardRunnableOrder(order: ProductionOrder): boolean {
  return isRunnableProductionOrder(order);
}

export function isDashboardMaterialIssue(order: ProductionOrder): boolean {
  return isMaterialIssueStatus(order.materialStatus);
}
