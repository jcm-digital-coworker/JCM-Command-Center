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
  const packetStatus = getStationPacketStatus(order, blockers);

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
      status: packetStatus,
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
    status: packetStatus,
    message: step?.operation ?? 'Blueprint packet attached.',
    operation: step?.operation,
    instructions: step?.instructions ?? [],
    blockers,
    next: step?.handoffTo,
  };
}

function getStationPacketStatus(order: ProductionOrder, blockers: string[]): 'READY' | 'BLOCKED' {
  const status = normalizeToken(order.status);
  const flowStatus = normalizeToken(order.flowStatus);
  if (blockers.length > 0 || status === 'BLOCKED' || flowStatus === 'BLOCKED') return 'BLOCKED';
  return 'READY';
}

function normalizeToken(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}
