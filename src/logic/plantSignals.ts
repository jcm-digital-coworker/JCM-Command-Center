import type { AppTab } from '../types/app';
import type { ProductionOrder } from '../types/productionOrder';
import type { DashboardTone } from '../components/dashboard/dashboardStyles';

export type PlantSignal = {
  title: string;
  detail: string;
  actionLabel: string;
  priority: number;
  routeTarget: AppTab;
  tone: DashboardTone;
};

export function getPlantSignals(orders: ProductionOrder[]): PlantSignal[] {
  const openOrders = orders.filter((order) => order.status !== 'DONE' && order.status !== 'COMPLETE' && order.status !== 'complete');
  const signals: PlantSignal[] = [];

  openOrders.forEach((order) => {
    if (order.qaStatus === 'HOLD' || order.qaStatus === 'FAILED') {
      signals.push({
        title: `QA hold ${order.orderNumber}`,
        detail: `Priority ${formatOrderPriority(order)} quality signal. Review release risk before this order moves downstream.`,
        actionLabel: 'Review QA / Safety',
        priority: 100 + getOrderPriorityScore(order),
        routeTarget: 'risk',
        tone: 'red',
      });
    }

    if (isBlockedOrder(order)) {
      signals.push({
        title: `Blocked order ${order.orderNumber}`,
        detail: `Priority ${formatOrderPriority(order)} blocked flow. Open workflow blocker context before labor is assigned.`,
        actionLabel: 'Review blocker',
        priority: 80 + getOrderPriorityScore(order),
        routeTarget: 'workflow',
        tone: 'red',
      });
    }

    if (isMaterialIssue(order)) {
      signals.push({
        title: `Material issue ${order.orderNumber}`,
        detail: `Priority ${formatOrderPriority(order)} material gap. Open Receiving/material context before pushing work forward.`,
        actionLabel: 'Open material issue',
        priority: 60 + getOrderPriorityScore(order),
        routeTarget: 'receiving',
        tone: 'orange',
      });
    }
  });

  if (signals.length === 0) {
    signals.push({
      title: 'No plant signals active',
      detail: 'No blocked order, material issue, or QA hold is currently driving dashboard action.',
      actionLabel: 'Review workflow',
      priority: 0,
      routeTarget: 'workflow',
      tone: 'green',
    });
  }

  return signals
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
}

function isBlockedOrder(order: ProductionOrder): boolean {
  return order.status === 'BLOCKED' || order.status === 'blocked' || order.flowStatus === 'blocked' || order.flowStatus === 'BLOCKED' || (order.blockers?.length ?? 0) > 0;
}

function isMaterialIssue(order: ProductionOrder): boolean {
  return order.materialStatus !== undefined && order.materialStatus !== 'RECEIVED' && order.materialStatus !== 'STAGED';
}

function getOrderPriorityScore(order: ProductionOrder): number {
  if (order.priority === 'critical' || order.priority === 'CRITICAL') return 30;
  if (order.priority === 'hot' || order.priority === 'HOT') return 20;
  return 10;
}

function formatOrderPriority(order: ProductionOrder): string {
  if (order.priority === 'critical' || order.priority === 'CRITICAL') return 'critical';
  if (order.priority === 'hot' || order.priority === 'HOT') return 'hot';
  return 'normal';
}
