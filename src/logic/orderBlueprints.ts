import type { ProductionOrder } from '../types/productionOrder';
import type { PartBlueprint, StationPacket } from '../types/partBlueprint';

export function getBlueprintForOrder(
  order: ProductionOrder,
  blueprints: PartBlueprint[]
): PartBlueprint | undefined {
  return blueprints.find(
    (blueprint) =>
      blueprint.id === order.blueprintId ||
      blueprint.partNumber === order.partNumber ||
      blueprint.partNumber === order.assemblyPartNumber
  );
}

export function getStationPacket(
  order: ProductionOrder,
  blueprint: PartBlueprint | undefined
): StationPacket {
  const orderBlockers = order.blockers ?? [];

  if (!blueprint) {
    return {
      orderNumber: order.orderNumber,
      partNumber: order.partNumber || order.assemblyPartNumber || 'UNKNOWN',
      revision: order.drawingRevision || 'UNKNOWN',
      description: order.productFamily,
      department: order.currentDepartment,
      status: 'MISSING_BLUEPRINT',
      priority: String(order.priority),
      rightNow: 'Missing blueprint data',
      instructions: [],
      requiredChecks: [],
      blockers: orderBlockers.map((blocker) => blocker.message),
      materials: [],
      qaRequirements: [],
      safetyNotes: [],
      nextAction: 'Resolve missing blueprint',
    };
  }

  const operation = blueprint.routing.find(
    (routeStep) => routeStep.department === order.currentDepartment
  );
  const blockers = orderBlockers.map((blocker) => blocker.message);

  return {
    orderNumber: order.orderNumber,
    partNumber: blueprint.partNumber,
    revision: order.drawingRevision || blueprint.revision,
    description: blueprint.description,
    department: order.currentDepartment,
    status: blockers.length ? 'BLOCKED' : 'READY',
    priority: String(order.priority),
    rightNow: blockers.length ? 'Order is blocked' : 'Ready for operation',
    operation: operation?.operation,
    instructions: operation?.instructions || [],
    requiredChecks: operation?.requiredChecks || [],
    blockers,
    materials: blueprint.materials,
    qaRequirements: blueprint.qaRequirements,
    safetyNotes: blueprint.safetyNotes,
    nextHandoff: operation?.handoffTo,
    nextAction: blockers.length
      ? 'Resolve blockers'
      : `Complete ${operation?.operation || 'task'}`,
  };
}
