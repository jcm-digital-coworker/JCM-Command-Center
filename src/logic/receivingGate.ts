import type { PlantTraveler } from '../types/dynamicTraveler';
import type {
  ReceivingExceptionType,
  ReceivingGateStatus,
  ReceivingLaneType,
  ReceivingOrder,
  ReceivingPressureSummary,
} from '../types/receiving';

const OPEN_GATE_STATUSES: ReceivingGateStatus[] = [
  'NOT_ARRIVED',
  'ARRIVING_TODAY',
  'INSPECTION_NEEDED',
  'READY_TO_STAGE',
  'CLAIMED_FOR_DELIVERY',
  'EXCEPTION_HOLD',
];

export function getReceivingGateStatus(order: ReceivingOrder): ReceivingGateStatus {
  if (order.status === 'PROBLEM_HOLD') return 'EXCEPTION_HOLD';
  if (order.status === 'DELIVERED') return 'STAGED_OR_DELIVERED';
  if (order.status === 'CLAIMED_FOR_DELIVERY') return 'CLAIMED_FOR_DELIVERY';
  if (order.status === 'CHECKED_IN') return 'READY_TO_STAGE';
  if (order.status === 'ARRIVING_TODAY') return 'ARRIVING_TODAY';
  return isExpectedPastDue(order.expectedDate) ? 'INSPECTION_NEEDED' : 'NOT_ARRIVED';
}

export function getReceivingGateLabel(status: ReceivingGateStatus): string {
  return status.replace(/_/g, ' ');
}

export function getReceivingGateTone(status: ReceivingGateStatus): 'OK' | 'INFO' | 'WARN' | 'DANGER' | 'SLATE' {
  if (status === 'STAGED_OR_DELIVERED') return 'OK';
  if (status === 'READY_TO_STAGE' || status === 'CLAIMED_FOR_DELIVERY') return 'INFO';
  if (status === 'ARRIVING_TODAY' || status === 'INSPECTION_NEEDED') return 'WARN';
  if (status === 'EXCEPTION_HOLD') return 'DANGER';
  return 'SLATE';
}

export function getReceivingLaneType(order: ReceivingOrder): ReceivingLaneType {
  const text = `${order.itemName} ${order.description} ${order.destinationDetail} ${order.orderedBy}`.toLowerCase();
  if (text.includes('maintenance') || text.includes('pm ') || text.includes('hydraulic oil')) return 'MAINTENANCE_PART';
  if (text.includes('tool') || text.includes('insert') || text.includes('fixture')) return 'TOOLING';
  if (text.includes('consumable') || text.includes('glove') || text.includes('tape')) return 'CONSUMABLE';
  if (order.poOrReceiver || order.destinationDepartment) return 'PRODUCTION_ORDER_MATERIAL';
  return 'UNKNOWN_REVIEW';
}

export function getReceivingLaneLabel(lane: ReceivingLaneType): string {
  if (lane === 'PRODUCTION_ORDER_MATERIAL') return 'Production material';
  if (lane === 'MAINTENANCE_PART') return 'Maintenance part';
  if (lane === 'TOOLING') return 'Tooling';
  if (lane === 'CONSUMABLE') return 'Consumable';
  return 'Needs review';
}

export function getReceivingDestinationLane(order: ReceivingOrder, traveler?: PlantTraveler): string {
  const destination = traveler?.nextDepartment ?? traveler?.activeDepartment ?? order.destinationDepartment;
  const detail = order.destinationDetail ? ` / ${order.destinationDetail}` : '';
  return `${destination}${detail}`;
}

export function getReceivingOrderAgeHours(order: ReceivingOrder): number | null {
  const timestamp = order.receiverCheckedAt ?? order.claimedAt ?? firstNotificationAt(order) ?? order.expectedDate;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 36_000) / 100);
}

export function getReceivingAgeLabel(ageHours: number | null): string {
  if (ageHours === null) return 'unknown age';
  if (ageHours < 1) return 'under 1h';
  if (ageHours < 24) return `${Math.round(ageHours)}h`;
  return `${Math.round(ageHours / 24)}d`;
}

export function getReceivingPressureSummary(orders: ReceivingOrder[]): ReceivingPressureSummary {
  const gates = orders.map(getReceivingGateStatus);
  const openOrders = orders.filter((order) => OPEN_GATE_STATUSES.includes(getReceivingGateStatus(order)));
  const openAges = openOrders
    .map(getReceivingOrderAgeHours)
    .filter((age): age is number => age !== null);

  return {
    open: openOrders.length,
    notArrived: gates.filter((status) => status === 'NOT_ARRIVED').length,
    arrivingToday: gates.filter((status) => status === 'ARRIVING_TODAY').length,
    inspectionNeeded: gates.filter((status) => status === 'INSPECTION_NEEDED').length,
    readyToStage: gates.filter((status) => status === 'READY_TO_STAGE').length,
    claimedForDelivery: gates.filter((status) => status === 'CLAIMED_FOR_DELIVERY').length,
    stagedOrDelivered: gates.filter((status) => status === 'STAGED_OR_DELIVERED').length,
    exceptionHolds: gates.filter((status) => status === 'EXCEPTION_HOLD').length,
    hotOrCritical: orders.filter((order) => order.priority === 'HOT' || order.priority === 'CRITICAL').length,
    oldestOpenAgeHours: openAges.length ? Math.max(...openAges) : null,
  };
}

export function getReceivingExceptionMessage(type: ReceivingExceptionType, order: ReceivingOrder, note?: string): string {
  const base = note?.trim() ? ` ${note.trim()}` : '';
  if (type === 'SHORTAGE') return `Shortage reported for ${order.itemName}.${base}`;
  if (type === 'DAMAGE') return `Damage reported for ${order.itemName}.${base}`;
  if (type === 'WRONG_MATERIAL') return `Wrong material reported for ${order.itemName}.${base}`;
  if (type === 'MISSING_PAPERWORK') return `Missing paperwork or certs for ${order.itemName}.${base}`;
  if (type === 'VENDOR_ISSUE') return `Vendor issue reported for ${order.itemName}.${base}`;
  return `Engineering review requested for ${order.itemName}.${base}`;
}

export function getReceivingExceptionAudience(type: ReceivingExceptionType, order: ReceivingOrder): string {
  if (type === 'ENGINEERING_REVIEW') return `Engineering + ${order.destinationDepartment} Supervisor + Receiving Supervisor`;
  if (type === 'VENDOR_ISSUE') return `${order.orderedBy} + Purchasing + Receiving Supervisor`;
  return `${order.orderedBy} + ${order.destinationDepartment} Supervisor + Receiving Supervisor`;
}

export function getReceivingGateAction(order: ReceivingOrder): string {
  const gate = getReceivingGateStatus(order);
  if (gate === 'NOT_ARRIVED') return `Waiting for arrival from ${order.supplier || 'supplier'}.`;
  if (gate === 'ARRIVING_TODAY') return 'Verify quantity, condition, paperwork, and destination before check-in.';
  if (gate === 'INSPECTION_NEEDED') return 'Inspect arrival status and either check in or report an exception.';
  if (gate === 'READY_TO_STAGE') return 'Ready for driver or direct staging handoff.';
  if (gate === 'CLAIMED_FOR_DELIVERY') return 'Driver should complete delivery and record the handoff.';
  if (gate === 'EXCEPTION_HOLD') return 'Resolve the exception before material moves.';
  return 'Delivered/staged. Handoff trail is complete.';
}

function firstNotificationAt(order: ReceivingOrder): string | undefined {
  return order.notificationLog[0]?.at;
}

function isExpectedPastDue(expectedDate: string): boolean {
  if (!expectedDate) return false;
  const expected = new Date(`${expectedDate}T23:59:59`);
  return !Number.isNaN(expected.getTime()) && expected.getTime() < Date.now();
}
