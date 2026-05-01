import type { ProductionOrder } from '../types/productionOrder';
import type { PartBlueprint } from '../types/partBlueprint';

export function getBlueprintForOrder(order: ProductionOrder, blueprints: PartBlueprint[]) {
  return blueprints.find(
    (b) => b.id === order.blueprintId || b.partNumber === order.partNumber
  );
}

export function orderRequiresBlueprintPacket(order: ProductionOrder): boolean {
  return order.engineeringRequired === true || Boolean(order.blueprintId) || Boolean(order.partNumber);
}

export function getStationPacket(order: ProductionOrder, blueprint?: PartBlueprint) {
  const blockers = order.blockers?.map((b) => b.message) ?? [];

  if (!blueprint && orderRequiresBlueprintPacket(order)) {
    return {
      orderNumber: order.orderNumber,
      status: 'MISSING_BLUEPRINT',
      message: 'Engineering must provide blueprint before work can begin.',
      blockers,
      operation: undefined,
      instructions: [],
      next: undefined,
    };
  }

  if (!blueprint) {
    return {
      orderNumber: order.orderNumber,
      status: blockers.length ? 'BLOCKED' : 'READY',
      message: 'No blueprint packet attached. Using legacy shop-floor order data.',
      blockers,
      operation: order.productFamily,
      instructions: [],
      next: order.nextDepartment,
    };
  }

  const step = blueprint.routing.find(
    (r) => r.department === order.currentDepartment
  );

  return {
    orderNumber: order.orderNumber,
    status: blockers.length ? 'BLOCKED' : 'READY',
    message: step?.operation ?? 'Blueprint packet attached.',
    operation: step?.operation,
    instructions: step?.instructions ?? [],
    blockers,
    next: step?.handoffTo,
  };
}
