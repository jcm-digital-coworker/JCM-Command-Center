import type { ProductionOrder } from '../types/productionOrder';
import type { PartBlueprint } from '../types/partBlueprint';

export function getBlueprintForOrder(order: ProductionOrder, blueprints: PartBlueprint[]) {
  return blueprints.find(
    (b) => b.id === order.blueprintId || b.partNumber === order.partNumber
  );
}

export function getStationPacket(order: ProductionOrder, blueprint?: PartBlueprint) {
  const blockers = order.blockers?.map((b) => b.message) ?? [];

  if (!blueprint) {
    return {
      orderNumber: order.orderNumber,
      status: 'MISSING_BLUEPRINT',
      message: 'Engineering must provide blueprint before work can begin.',
      blockers,
    };
  }

  const step = blueprint.routing.find(
    (r) => r.department === order.currentDepartment
  );

  return {
    orderNumber: order.orderNumber,
    status: blockers.length ? 'BLOCKED' : 'READY',
    operation: step?.operation,
    instructions: step?.instructions ?? [],
    blockers,
    next: step?.handoffTo,
  };
}
