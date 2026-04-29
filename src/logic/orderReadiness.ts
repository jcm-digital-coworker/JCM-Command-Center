import type { BlockedReason, MaterialStatus, ProductionOrder } from '../types/productionOrder';

function normalizeStatus(value: string | undefined) {
  return (value ?? '').toUpperCase();
}

export function isOrderBlocked(order: ProductionOrder) {
  return normalizeStatus(order.status) === 'BLOCKED' || Boolean(getAutomaticBlockReason(order));
}

export function getAutomaticBlockReason(order: ProductionOrder): BlockedReason | null {
  const status = normalizeStatus(order.status);
  const materialStatus = normalizeStatus(order.materialStatus);

  if (
    (materialStatus === 'NOT_RECEIVED' || materialStatus === 'PARTIAL' || materialStatus === 'MISSING') &&
    status !== 'DONE' &&
    status !== 'COMPLETE'
  ) {
    return 'WAITING_ON_MATERIAL';
  }

  const downDependency = (order.dependencies ?? []).find(
    (dependency) => dependency.required && normalizeStatus(dependency.status) === 'DOWN',
  );

  if (!downDependency) return null;

  const dependencyName = (downDependency.label ?? downDependency.id ?? '').toLowerCase();

  if (dependencyName.includes('laser')) return 'WAITING_ON_LASER';
  if (dependencyName.includes('press')) return 'WAITING_ON_PRESS';
  if (dependencyName.includes('machine')) return 'WAITING_ON_MACHINE_SHOP';
  if (dependencyName.includes('fab')) return 'WAITING_ON_FAB';
  if (dependencyName.includes('coating')) return 'WAITING_ON_COATING';
  if (dependencyName.includes('assembly')) return 'WAITING_ON_ASSEMBLY';
  if (dependencyName.includes('qa')) return 'WAITING_ON_QA';
  if (dependencyName.includes('shipping')) return 'WAITING_ON_SHIPPING';

  return 'MACHINE_DOWN';
}

export function getOrderBlockReason(order: ProductionOrder): BlockedReason | null {
  return getAutomaticBlockReason(order);
}

export function getOrderStatusLabel(order: ProductionOrder) {
  const blockReason = getOrderBlockReason(order);
  if (normalizeStatus(order.status) === 'BLOCKED' || blockReason) {
    return `Blocked: ${formatBlockedReason(blockReason ?? 'UNKNOWN')}`;
  }

  return formatStatus(order.status);
}

export function formatStatus(status: string | undefined) {
  return (status ?? 'UNKNOWN')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatBlockedReason(reason: BlockedReason | 'UNKNOWN') {
  return formatStatus(reason);
}

export function formatMaterialStatus(status: MaterialStatus | undefined) {
  return formatStatus(status);
}
