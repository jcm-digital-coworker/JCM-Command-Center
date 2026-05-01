import type { ProductionOrder } from '../types/productionOrder';

export function isSalesOriginOrder(order: ProductionOrder): boolean {
  return order.workflowOrigin === 'SALES';
}

export function hasMissingBlueprint(order: ProductionOrder): boolean {
  return order.engineeringRequired === true && !order.blueprintId && !order.partNumber;
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

export function getCurrentOrderGate(order: ProductionOrder) {
  if (isSalesOriginOrder(order) && !order.salesReleasedAt) return 'SALES';

  if (hasMissingBlueprint(order)) return 'ENGINEERING';

  if (order.engineeringRequired && order.engineeringStatus !== 'RELEASED') {
    return 'ENGINEERING';
  }

  if (isSalesOriginOrder(order) && !order.productionSupervisorAcknowledged) {
    return 'SUPERVISOR';
  }

  if (hasMaterialIssue(order)) return 'RECEIVING';

  return 'SHOP';
}

export function getWorkflowSignal(order: ProductionOrder) {
  const gate = getCurrentOrderGate(order);

  if (hasMissingBlueprint(order)) {
    return {
      orderNumber: order.orderNumber,
      gate,
      message: 'Missing blueprint - Engineering must create and release drawing.',
      action: 'Route to Engineering',
    };
  }

  if (gate === 'SALES') {
    return {
      orderNumber: order.orderNumber,
      gate,
      message: 'Sales has not released this order into production yet.',
      action: 'Wait for Sales release',
    };
  }

  if (gate === 'ENGINEERING') {
    return {
      orderNumber: order.orderNumber,
      gate,
      message: 'Engineering release is required before production can proceed.',
      action: 'Complete Engineering release',
    };
  }

  if (gate === 'SUPERVISOR') {
    return {
      orderNumber: order.orderNumber,
      gate,
      message: 'Production supervisor review is needed before shop-floor release.',
      action: 'Acknowledge and prioritize order',
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
