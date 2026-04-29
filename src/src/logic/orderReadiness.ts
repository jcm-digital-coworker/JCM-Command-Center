import type { BlockedReason, MaterialStatus, ProductionOrder } from '../types/productionOrder';

export function isOrderBlocked(order: ProductionOrder) {
  return order.status === 'BLOCKED' || Boolean(getAutomaticBlockReason(order));
}

export function getAutomaticBlockReason(order: ProductionOrder): BlockedReason | null {
  if (order.materialStatus === 'NOT_RECEIVED' || order.materialStatus === 'PARTIAL') {
    if (order.status !== 'DONE') return 'WAITING_ON_MATERIAL';
  }

  const downDependency = order.dependencies.find(
    (dependency) => dependency.required && dependency.status === 'DOWN',
  );

  if (!downDependency) return null;

  if (downDependency.name.toLowerCase().includes('laser')) return 'WAITING_ON_LASER';
  if (downDependency.name.toLowerCase().includes('press')) return 'WAITING_ON_PRESS';

  return 'MACHINE_DOWN';
}

export function getOrderBlockReason(order: ProductionOrder): BlockedReason | null {
  return order.blockedReason ?? getAutomaticBlockReason(order);
}

export function getOrderStatusLabel(order: ProductionOrder) {
  const blockReason = getOrderBlockReason(order);
  if (order.status === 'BLOCKED' || blockReason) return `Blocked: ${formatBlockedReason(blockReason ?? 'UNKNOWN')}`;
  return formatStatus(order.status);
}

export function formatStatus(status: string) {
  return status.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatBlockedReason(reason: BlockedReason) {
  return formatStatus(reason);
}

export function formatMaterialStatus(status: MaterialStatus) {
  return formatStatus(status);
}
