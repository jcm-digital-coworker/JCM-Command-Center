import type { BlockedReason, FlowBlocker, MaterialStatus, ProductionOrder } from '../types/productionOrder';

export function normalizeOrderToken(value: unknown): string {
  return String(value ?? '').trim().toUpperCase();
}

function normalizeSearchText(value: unknown): string {
  return normalizeOrderToken(value).replaceAll('_', ' ');
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

export function getOperatorSafeStatusLabel(value: unknown): string {
  const status = normalizeOrderToken(value);
  if (!status || status === 'UNKNOWN') return 'Needs review';
  return status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getOperatorSafeBlockedReasonLabel(reason: BlockedReason | null | undefined): string {
  const status = normalizeOrderToken(reason);
  if (!status || status === 'UNKNOWN') return 'Needs blocker review';
  return getOperatorSafeStatusLabel(status);
}

export function getBlockReasonFromBlocker(blocker: FlowBlocker | undefined): BlockedReason | null {
  if (!blocker) return null;

  const message = normalizeSearchText(blocker.message);

  if (blocker.type === 'material') return 'WAITING_ON_MATERIAL';
  if (blocker.type === 'quality') return 'QUALITY_HOLD';
  if (blocker.type === 'labor') return 'LABOR_SHORTAGE';
  if (blocker.type === 'machine') return 'MACHINE_DOWN';

  if (message.includes('material')) return 'WAITING_ON_MATERIAL';
  if (message.includes('laser')) return 'WAITING_ON_LASER';
  if (message.includes('press')) return 'WAITING_ON_PRESS';
  if (message.includes('machine shop')) return 'WAITING_ON_MACHINE_SHOP';
  if (message.includes('fab')) return 'WAITING_ON_FAB';
  if (message.includes('coat')) return 'WAITING_ON_COATING';
  if (message.includes('assembl')) return 'WAITING_ON_ASSEMBLY';
  if (message.includes('qa') || message.includes('quality')) return 'QUALITY_HOLD';
  if (message.includes('engineer')) return 'ENGINEERING_HOLD';
  if (message.includes('labor') || message.includes('staff')) return 'LABOR_SHORTAGE';
  if (message.includes('machine') || message.includes('down')) return 'MACHINE_DOWN';

  return null;
}

export function getPrimaryOrderBlockReason(order: Pick<ProductionOrder, 'blockers' | 'blockedReason'>): BlockedReason | null {
  if (order.blockedReason && normalizeOrderToken(order.blockedReason) !== 'UNKNOWN') return order.blockedReason;
  return getBlockReasonFromBlocker(order.blockers?.[0]);
}

export function getOperatorOrderStatusLabel(order: ProductionOrder): string {
  if (isBlockedProductionOrder(order)) {
    return `Blocked: ${getOperatorSafeBlockedReasonLabel(getPrimaryOrderBlockReason(order))}`;
  }

  return getOperatorSafeStatusLabel(order.status);
}

export function getOperatorMaterialStatusLabel(status: MaterialStatus): string {
  return getOperatorSafeStatusLabel(status);
}
