import type { ProductionOrder } from '../types/productionOrder';

export function normalizeOrderToken(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

export function isClosedProductionStatus(value: unknown): boolean {
  const status = normalizeOrderToken(value);
  return status === 'DONE' || status === 'COMPLETE' || status === 'COMPLETED';
}

export function isHoldProductionOrder(order: Pick<ProductionOrder, 'status'>): boolean {
  return normalizeOrderToken(order.status) === 'HOLD';
}

export function isBlockedProductionOrder(order: Pick<ProductionOrder, 'status' | 'flowStatus' | 'blockers'>): boolean {
  return normalizeOrderToken(order.status) === 'BLOCKED'
    || normalizeOrderToken(order.flowStatus) === 'BLOCKED'
    || (order.blockers ?? []).length > 0;
}

export function isRunnableProductionOrder(order: Pick<ProductionOrder, 'status' | 'flowStatus' | 'blockers'>): boolean {
  if (isBlockedProductionOrder(order)) return false;
  const status = normalizeOrderToken(order.status);
  const flowStatus = normalizeOrderToken(order.flowStatus);
  return status === 'READY' || status === 'IN_PROGRESS' || status === 'RUNNING' || flowStatus === 'RUNNABLE';
}

export function isMaterialIssueStatus(value: unknown): boolean {
  const materialStatus = normalizeOrderToken(value);
  return materialStatus !== ''
    && materialStatus !== 'RECEIVED'
    && materialStatus !== 'STAGED'
    && materialStatus !== 'UNKNOWN';
}

export function isMaterialActionNeeded(value: unknown): boolean {
  const materialStatus = normalizeOrderToken(value);
  return materialStatus === 'MISSING'
    || materialStatus === 'NOT_RECEIVED'
    || materialStatus === 'ORDER_REQUIRED';
}

export function isCriticalPriority(value: unknown): boolean {
  return normalizeOrderToken(value) === 'CRITICAL';
}

export function isHotPriority(value: unknown): boolean {
  return normalizeOrderToken(value) === 'HOT';
}
