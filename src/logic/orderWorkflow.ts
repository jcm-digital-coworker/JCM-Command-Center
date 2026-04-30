import type { ProductionOrder } from '../types/productionOrder';

export function hasMissingBlueprint(order: ProductionOrder) {
  return !order.blueprintId && !order.partNumber;
}

export function getWorkflowSignal(order: ProductionOrder) {
  if (hasMissingBlueprint(order)) {
    return { gate: 'ENGINEERING', message: 'Missing blueprint', action: 'Escalate Engineering' };
  }

  if (order.materialStatus === 'MISSING') {
    return { gate: 'RECEIVING', message: 'Material missing', action: 'Request material' };
  }

  return { gate: 'SHOP', message: 'Ready', action: 'Start work' };
}
