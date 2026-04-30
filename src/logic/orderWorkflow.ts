import type { Department } from '../types/machine';
import type { ProductionOrder } from '../types/productionOrder';

export type OrderGate = 'SALES_RELEASE' | 'ENGINEERING' | 'PRODUCTION_SUPERVISOR' | 'RECEIVING' | 'SHOP_FLOOR';

export type NotificationTarget = {
  department: Department | 'Engineering' | 'Production Supervisor';
  reason: string;
  urgency: 'info' | 'watch' | 'action';
};

export type ReceivingMaterialQueueItem = {
  orderNumber: string;
  partNumber: string;
  department: Department;
  priorityScore: number;
  priority: string;
  projectedShipDate?: string;
  materialStatus: string;
  action: string;
  notifyDepartments: NotificationTarget[];
};

export type OrderWorkflowSignal = {
  orderNumber: string;
  currentGate: OrderGate;
  globalPriorityScore: number;
  localPriorityScore: number;
  notificationTargets: NotificationTarget[];
  nextAction: string;
};

export function getCurrentOrderGate(order: ProductionOrder): OrderGate {
  if (!order.salesReleasedAt) return 'SALES_RELEASE';

  if (order.engineeringRequired && order.engineeringStatus !== 'RELEASED') {
    return 'ENGINEERING';
  }

  if (!order.productionSupervisorAcknowledged) {
    return 'PRODUCTION_SUPERVISOR';
  }

  if (hasMaterialIssue(order)) {
    return 'RECEIVING';
  }

  return 'SHOP_FLOOR';
}

export function hasMaterialIssue(order: ProductionOrder): boolean {
  const materialStatus = String(order.materialStatus ?? 'UNKNOWN').toUpperCase();
  return (
    materialStatus === 'MISSING' ||
    materialStatus === 'NOT_RECEIVED' ||
    materialStatus === 'ORDER_REQUIRED' ||
    order.blockers.some((blocker) => blocker.type === 'material')
  );
}

export function getGlobalPriorityScore(order: ProductionOrder, today = new Date()): number {
  const priority = String(order.priority).toLowerCase();
  const priorityScore = priority === 'critical' ? 100 : priority === 'hot' ? 70 : 30;
  const dueScore = getDueDateScore(order.projectedShipDate, today);
  const materialScore = hasMaterialIssue(order) ? 25 : 0;
  const engineeringScore = order.engineeringRequired && order.engineeringStatus !== 'RELEASED' ? 20 : 0;
  const blockedScore = String(order.flowStatus).toLowerCase() === 'blocked' ? 15 : 0;

  return priorityScore + dueScore + materialScore + engineeringScore + blockedScore;
}

export function getLocalPriorityScore(order: ProductionOrder, department: Department, today = new Date()): number {
  const touchesDepartment =
    order.currentDepartment === department ||
    order.nextDepartment === department ||
    order.requiredDepartments?.includes(department) ||
    order.dependencies?.some((dependency) => dependency.department === department);

  if (!touchesDepartment) return 0;

  const ownershipScore = order.currentDepartment === department ? 40 : 15;
  return ownershipScore + getGlobalPriorityScore(order, today);
}

export function getReceivingMaterialQueue(
  orders: ProductionOrder[],
  today = new Date()
): ReceivingMaterialQueueItem[] {
  return orders
    .filter(hasMaterialIssue)
    .map((order) => ({
      orderNumber: order.orderNumber,
      partNumber: order.partNumber ?? order.assemblyPartNumber ?? 'UNKNOWN',
      department: order.currentDepartment,
      priorityScore: getGlobalPriorityScore(order, today),
      priority: String(order.priority),
      projectedShipDate: order.projectedShipDate,
      materialStatus: order.materialStatus ?? 'UNKNOWN',
      action: getReceivingAction(order),
      notifyDepartments: getNotificationTargets(order),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getNotificationTargets(order: ProductionOrder): NotificationTarget[] {
  const targets: NotificationTarget[] = [];
  const gate = getCurrentOrderGate(order);

  if (order.engineeringRequired && order.engineeringStatus !== 'RELEASED') {
    targets.push({
      department: 'Engineering',
      reason: 'Engineering release is required before production can proceed.',
      urgency: 'action',
    });
  }

  if (!order.productionSupervisorAcknowledged && order.salesReleasedAt) {
    targets.push({
      department: 'Production Supervisor',
      reason: 'New released order needs production review and priority placement.',
      urgency: 'action',
    });
  }

  if (hasMaterialIssue(order)) {
    targets.push({
      department: 'Receiving',
      reason: getReceivingAction(order),
      urgency: 'action',
    });

    targets.push({
      department: order.currentDepartment,
      reason: 'Order is blocked or at risk because material is not ready.',
      urgency: 'watch',
    });

    if (order.nextDepartment) {
      targets.push({
        department: order.nextDepartment,
        reason: 'Incoming order may be delayed by material readiness.',
        urgency: 'info',
      });
    }
  }

  if (gate === 'SHOP_FLOOR' && !hasMaterialIssue(order)) {
    targets.push({
      department: order.currentDepartment,
      reason: 'Order is ready for current station action.',
      urgency: 'action',
    });
  }

  return dedupeTargets(targets);
}

export function getOrderWorkflowSignal(order: ProductionOrder, today = new Date()): OrderWorkflowSignal {
  const currentGate = getCurrentOrderGate(order);

  return {
    orderNumber: order.orderNumber,
    currentGate,
    globalPriorityScore: getGlobalPriorityScore(order, today),
    localPriorityScore: getLocalPriorityScore(order, order.currentDepartment, today),
    notificationTargets: getNotificationTargets(order),
    nextAction: getNextWorkflowAction(order, currentGate),
  };
}

function getReceivingAction(order: ProductionOrder): string {
  const materialStatus = String(order.materialStatus ?? 'UNKNOWN').toUpperCase();

  if (materialStatus === 'ORDER_REQUIRED') {
    return 'Order required material, then update expected availability date.';
  }

  if (materialStatus === 'NOT_RECEIVED') {
    return 'Confirm purchase/arrival status and flag delay risk to affected departments.';
  }

  if (materialStatus === 'MISSING') {
    return 'Find or order missing material and notify affected upstream work centers.';
  }

  return 'Verify material and stage it for the current work center.';
}

function getNextWorkflowAction(order: ProductionOrder, gate: OrderGate): string {
  if (gate === 'SALES_RELEASE') return 'Release order from Sales before routing.';
  if (gate === 'ENGINEERING') return 'Complete Engineering release before production routing.';
  if (gate === 'PRODUCTION_SUPERVISOR') return 'Production Supervisor should acknowledge and place priority.';
  if (gate === 'RECEIVING') return getReceivingAction(order);
  return `Work order in ${order.currentDepartment}.`;
}

function getDueDateScore(projectedShipDate: string | undefined, today: Date): number {
  if (!projectedShipDate) return 0;

  const due = new Date(`${projectedShipDate}T00:00:00`);
  if (Number.isNaN(due.getTime())) return 0;

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / msPerDay);

  if (daysUntilDue < 0) return 50;
  if (daysUntilDue <= 1) return 45;
  if (daysUntilDue <= 3) return 35;
  if (daysUntilDue <= 7) return 20;
  return 5;
}

function dedupeTargets(targets: NotificationTarget[]): NotificationTarget[] {
  const seen = new Set<string>();
  return targets.filter((target) => {
    const key = `${target.department}-${target.reason}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
