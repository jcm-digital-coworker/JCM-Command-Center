import type { ProductionOrder } from '../types/productionOrder';

export function hasMissingBlueprint(order: ProductionOrder): boolean {
  return !order.blueprintId && !order.partNumber;
}

export function getCurrentOrderGate(order: ProductionOrder) {
  if (!order.salesReleasedAt) return 'SALES';

  if (hasMissingBlueprint(order)) return 'ENGINEERING';

  if (order.engineeringRequired && order.engineeringStatus !== 'RELEASED') {
    return 'ENGINEERING';
  }

  if (!order.productionSupervisorAcknowledged) return 'SUPERVISOR';

  if (order.materialStatus === 'MISSING' || order.materialStatus === 'NOT_RECEIVED') {
    return 'RECEIVING';
  }

  return 'SHOP';
}

export function getWorkflowSignal(order: ProductionOrder) {
  const gate = getCurrentOrderGate(order);

  if (hasMissingBlueprint(order)) {
    return {
      orderNumber: order.orderNumber,
      gate,
      message: 'Missing blueprint — Engineering must create and release drawing.',
      action: 'Route to Engineering',
    };
  }

  if (gate === 'RECEIVING') {
    return {
      orderNumber: order.orderNumber,
      gate,
      message: 'Material not ready',
      action: 'Receiving must stage or order material',
    };
  }

  return {
    orderNumber: order.orderNumber,
    gate,
    message: 'Ready for work center',
    action: `Work in ${order.currentDepartment}`,
  };
}
