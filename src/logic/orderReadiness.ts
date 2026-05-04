import type { BlockedReason, MaterialStatus, OrderDependency, ProductionOrder } from '../types/productionOrder';

function normalizeText(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function getDependencyName(dependency: OrderDependency): string {
  return dependency.label ?? dependency.id ?? '';
}

function getOrderDependencies(order: ProductionOrder): OrderDependency[] {
  return Array.isArray(order.dependencies) ? order.dependencies : [];
}

function hasListedBlocker(order: ProductionOrder): boolean {
  return Array.isArray(order.blockers) && order.blockers.length > 0;
}

export function getAutomaticBlockReason(order: ProductionOrder): BlockedReason | null {
  const status = normalizeText(order.status);
  const flowStatus = normalizeText(order.flowStatus);
  const materialStatus = normalizeText(order.materialStatus);

  if (hasListedBlocker(order)) {
    return order.blockers[0]?.type === 'material' ? 'WAITING_ON_MATERIAL' : 'UNKNOWN';
  }

  if (flowStatus === 'blocked') {
    return 'UNKNOWN';
  }

  if (status !== 'done' && status !== 'complete') {
    if (materialStatus === 'not_received' || materialStatus === 'partial' || materialStatus === 'missing') {
      return 'WAITING_ON_MATERIAL';
    }
  }

  const downDependency = getOrderDependencies(order).find(
    (dependency) => dependency.required && normalizeText(dependency.status) === 'down',
  );

  if (!downDependency) return null;

  if (downDependency.blockedReason) return downDependency.blockedReason;

  const dependencyName = normalizeText(getDependencyName(downDependency));
  if (dependencyName.includes('laser')) return 'WAITING_ON_LASER';
  if (dependencyName.includes('press')) return 'WAITING_ON_PRESS';
  if (dependencyName.includes('machine')) return 'MACHINE_DOWN';

  return 'UNKNOWN';
}

export function getOrderBlockReason(order: ProductionOrder): BlockedReason | null {
  return getAutomaticBlockReason(order);
}

export function isOrderBlocked(order: ProductionOrder): boolean {
  return normalizeText(order.status) === 'blocked' || normalizeText(order.flowStatus) === 'blocked' || hasListedBlocker(order) || Boolean(getAutomaticBlockReason(order));
}

export function getOrderStatusLabel(order: ProductionOrder): string {
  const blockReason = getOrderBlockReason(order);
  if (isOrderBlocked(order)) {
    return `Blocked: ${formatBlockedReason(blockReason ?? 'UNKNOWN')}`;
  }

  return formatStatus(order.status);
}

export function formatStatus(status: string): string {
  return String(status ?? 'UNKNOWN')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatBlockedReason(reason: BlockedReason): string {
  return formatStatus(reason);
}

export function formatMaterialStatus(status: MaterialStatus): string {
  return formatStatus(status);
}
