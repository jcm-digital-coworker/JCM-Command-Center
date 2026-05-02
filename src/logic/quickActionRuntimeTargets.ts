import type { FlowBlocker, ProductionOrder } from '../types/productionOrder';

export function getFirstBlockedOrderNumber(orders: ProductionOrder[]): string | undefined {
  return getHighestPriorityBlockedOrder(orders)?.orderNumber;
}

export function getFirstMaterialIssueOrderNumber(orders: ProductionOrder[]): string | undefined {
  return getHighestPriorityMaterialIssueOrder(orders)?.orderNumber;
}

export function getHighestPriorityBlockedOrder(orders: ProductionOrder[]): ProductionOrder | undefined {
  return getRankedOrders(orders.filter(isBlockedOrder))[0];
}

export function getHighestPriorityMaterialIssueOrder(orders: ProductionOrder[]): ProductionOrder | undefined {
  return getRankedOrders(orders.filter(hasMaterialIssue))[0];
}

function getRankedOrders(orders: ProductionOrder[]): ProductionOrder[] {
  return [...orders].sort((a, b) => getOrderUrgencyScore(b) - getOrderUrgencyScore(a));
}

function isBlockedOrder(order: ProductionOrder): boolean {
  return order.status === 'BLOCKED' ||
    order.status === 'blocked' ||
    order.flowStatus === 'blocked' ||
    order.flowStatus === 'BLOCKED' ||
    order.blockers.length > 0;
}

function hasMaterialIssue(order: ProductionOrder): boolean {
  return order.materialStatus !== 'RECEIVED';
}

function getOrderUrgencyScore(order: ProductionOrder): number {
  return getPriorityScore(order.priority) +
    getShipDateScore(order.projectedShipDate) +
    getBlockerScore(order.blockers) +
    getMaterialScore(order.materialStatus) +
    getQaScore(order.qaStatus) +
    getStatusScore(order.status, order.flowStatus);
}

function getPriorityScore(priority: ProductionOrder['priority']): number {
  const normalized = priority.toUpperCase();
  if (normalized === 'CRITICAL') return 10_000;
  if (normalized === 'HOT') return 5_000;
  return 1_000;
}

function getShipDateScore(projectedShipDate?: string): number {
  if (!projectedShipDate) return 0;

  const shipTime = new Date(`${projectedShipDate}T00:00:00`).getTime();
  if (Number.isNaN(shipTime)) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilShip = Math.ceil((shipTime - today.getTime()) / 86_400_000);

  if (daysUntilShip < 0) return 4_000;
  if (daysUntilShip === 0) return 3_500;
  if (daysUntilShip === 1) return 3_000;
  if (daysUntilShip <= 3) return 2_500;
  if (daysUntilShip <= 7) return 1_500;
  return 500;
}

function getBlockerScore(blockers: FlowBlocker[]): number {
  return blockers.reduce((score, blocker) => score + getSingleBlockerScore(blocker), 0);
}

function getSingleBlockerScore(blocker: FlowBlocker): number {
  if (blocker.type === 'quality') return 1_800;
  if (blocker.type === 'machine') return 1_600;
  if (blocker.type === 'material') return 1_400;
  if (blocker.type === 'labor') return 1_100;
  if (blocker.type === 'process') return 900;
  if (blocker.type === 'upstream') return 700;
  return 300;
}

function getMaterialScore(materialStatus: ProductionOrder['materialStatus']): number {
  if (materialStatus === 'MISSING' || materialStatus === 'NOT_RECEIVED') return 1_500;
  if (materialStatus === 'ORDER_REQUIRED') return 1_300;
  if (materialStatus === 'PARTIAL') return 1_000;
  if (materialStatus === 'UNKNOWN') return 700;
  if (materialStatus === 'STAGED') return 250;
  return 0;
}

function getQaScore(qaStatus: ProductionOrder['qaStatus']): number {
  if (qaStatus === 'FAILED') return 1_600;
  if (qaStatus === 'HOLD') return 1_400;
  if (qaStatus === 'PENDING') return 600;
  return 0;
}

function getStatusScore(status: ProductionOrder['status'], flowStatus: ProductionOrder['flowStatus']): number {
  if (status === 'BLOCKED' || status === 'blocked') return 900;
  if (status === 'HOLD' || status === 'hold') return 800;
  if (flowStatus === 'blocked' || flowStatus === 'BLOCKED') return 700;
  return 0;
}
