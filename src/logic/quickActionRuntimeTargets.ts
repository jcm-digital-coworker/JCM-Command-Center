import type { ProductionOrder } from '../types/productionOrder';

export function getFirstBlockedOrderNumber(orders: ProductionOrder[]): string | undefined {
  return orders.find((order) =>
    order.status === 'BLOCKED' ||
    order.flowStatus === 'blocked' ||
    order.blockers.length > 0,
  )?.orderNumber;
}

export function getFirstMaterialIssueOrderNumber(orders: ProductionOrder[]): string | undefined {
  return orders.find((order) => order.materialStatus !== 'RECEIVED')?.orderNumber;
}
