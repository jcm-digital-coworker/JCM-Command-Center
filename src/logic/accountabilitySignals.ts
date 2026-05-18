import type { RoleView, AppTab } from '../types/app';
import type { Department } from '../types/machine';
import type { FlowBlocker, FlowBlockerType, ProductionOrder } from '../types/productionOrder';

export type AccountabilityAudience = 'OPERATOR' | 'DEPARTMENT_LEAD' | 'SUPPORT' | 'MANAGEMENT';
export type AccountabilityTone = 'red' | 'orange' | 'blue' | 'green';

export type AccountabilitySignal = {
  id: string;
  orderNumber: string;
  title: string;
  issue: string;
  blockedDepartment: Department;
  owningDepartment: Department | 'Management' | 'Engineering' | 'Unknown';
  neededNext: string;
  safeAction: string;
  targetTab: AppTab;
  ageLabel: string;
  priorityLabel: string;
  tone: AccountabilityTone;
  audience: AccountabilityAudience[];
  proofLine: string;
};

type AccountabilityInput = {
  blockedOrders: ProductionOrder[];
  materialIssues: ProductionOrder[];
  qaHolds: ProductionOrder[];
  dueSoonOrders: ProductionOrder[];
  roleView: RoleView;
};

export function getDashboardAccountabilitySignals({
  blockedOrders,
  materialIssues,
  qaHolds,
  dueSoonOrders,
  roleView,
}: AccountabilityInput): AccountabilitySignal[] {
  const roleAudience = getAudienceForRole(roleView);
  const seen = new Set<string>();
  const signals: AccountabilitySignal[] = [];

  blockedOrders.forEach((order) => addSignal(signals, seen, createBlockedSignal(order)));
  materialIssues.forEach((order) => addSignal(signals, seen, createMaterialSignal(order)));
  qaHolds.forEach((order) => addSignal(signals, seen, createQaSignal(order)));
  dueSoonOrders.forEach((order) => addSignal(signals, seen, createDueSoonSignal(order)));

  return signals
    .filter((signal) => signal.audience.includes(roleAudience) || signal.audience.includes('MANAGEMENT'))
    .sort((a, b) => getSignalSortScore(b) - getSignalSortScore(a))
    .slice(0, 6);
}

export function getAudienceForRole(roleView: RoleView): AccountabilityAudience {
  const normalized = String(roleView).trim().toLowerCase();
  if (normalized.includes('operator') || normalized === 'production') return 'OPERATOR';
  if (normalized.includes('maintenance') || normalized.includes('qa') || normalized.includes('support')) return 'SUPPORT';
  if (normalized.includes('lead') || normalized.includes('supervisor')) return 'DEPARTMENT_LEAD';
  return 'MANAGEMENT';
}

function addSignal(signals: AccountabilitySignal[], seen: Set<string>, signal: AccountabilitySignal) {
  if (seen.has(signal.id)) return;
  seen.add(signal.id);
  signals.push(signal);
}

function createBlockedSignal(order: ProductionOrder): AccountabilitySignal {
  const blocker = getPrimaryBlocker(order);
  const owner = getOwnerForBlocker(blocker?.type, order);
  return {
    id: `${order.orderNumber}-blocked-${blocker?.type ?? 'unknown'}`,
    orderNumber: order.orderNumber,
    title: `Order ${order.orderNumber} is blocked`,
    issue: blocker?.message ?? order.blockedReason ?? 'Blocked flow needs owner confirmation.',
    blockedDepartment: order.currentDepartment,
    owningDepartment: owner.department,
    neededNext: owner.neededNext,
    safeAction: owner.safeAction,
    targetTab: owner.targetTab,
    ageLabel: getAgeLabel(order),
    priorityLabel: formatPriority(order.priority),
    tone: owner.tone,
    audience: ['OPERATOR', 'DEPARTMENT_LEAD', 'MANAGEMENT'],
    proofLine: getProofLine(order),
  };
}

function createMaterialSignal(order: ProductionOrder): AccountabilitySignal {
  return {
    id: `${order.orderNumber}-material`,
    orderNumber: order.orderNumber,
    title: `Material action needed for ${order.orderNumber}`,
    issue: `Material status: ${formatToken(order.materialStatus ?? 'UNKNOWN')}`,
    blockedDepartment: order.currentDepartment,
    owningDepartment: 'Receiving',
    neededNext: 'Verify, stage, or report the material exception so the blocked department knows what changed.',
    safeAction: 'Open material issue',
    targetTab: 'receiving',
    ageLabel: getAgeLabel(order),
    priorityLabel: formatPriority(order.priority),
    tone: 'orange',
    audience: ['SUPPORT', 'DEPARTMENT_LEAD', 'MANAGEMENT'],
    proofLine: getProofLine(order),
  };
}

function createQaSignal(order: ProductionOrder): AccountabilitySignal {
  return {
    id: `${order.orderNumber}-qa`,
    orderNumber: order.orderNumber,
    title: `QA decision needed for ${order.orderNumber}`,
    issue: `QA status: ${formatToken(order.qaStatus ?? 'UNKNOWN')}`,
    blockedDepartment: order.currentDepartment,
    owningDepartment: 'QA',
    neededNext: 'Inspect, release, fail with reason, or request missing information.',
    safeAction: 'Open QA hold',
    targetTab: 'qa',
    ageLabel: getAgeLabel(order),
    priorityLabel: formatPriority(order.priority),
    tone: 'red',
    audience: ['SUPPORT', 'DEPARTMENT_LEAD', 'MANAGEMENT'],
    proofLine: getProofLine(order),
  };
}

function createDueSoonSignal(order: ProductionOrder): AccountabilitySignal {
  return {
    id: `${order.orderNumber}-due-soon`,
    orderNumber: order.orderNumber,
    title: `Due-soon order ${order.orderNumber}`,
    issue: `Ship target: ${order.projectedShipDate ?? 'not set'}`,
    blockedDepartment: order.currentDepartment,
    owningDepartment: order.currentDepartment,
    neededNext: 'Confirm whether the current department can run or needs help before the ship window is missed.',
    safeAction: 'Open order list',
    targetTab: 'orders',
    ageLabel: getAgeLabel(order),
    priorityLabel: formatPriority(order.priority),
    tone: 'blue',
    audience: ['DEPARTMENT_LEAD', 'MANAGEMENT'],
    proofLine: getProofLine(order),
  };
}

function getOwnerForBlocker(type: FlowBlockerType | undefined, order: ProductionOrder): {
  department: AccountabilitySignal['owningDepartment'];
  neededNext: string;
  safeAction: string;
  targetTab: AppTab;
  tone: AccountabilityTone;
} {
  if (type === 'material') {
    return {
      department: 'Receiving',
      neededNext: 'Verify, stage, or report the material exception. Do not start blocked work until material truth changes.',
      safeAction: 'Open material issue',
      targetTab: 'receiving',
      tone: 'orange',
    };
  }
  if (type === 'quality' || order.qaStatus === 'HOLD' || order.qaStatus === 'FAILED') {
    return {
      department: 'QA',
      neededNext: 'Inspect, release, fail with reason, or request missing information.',
      safeAction: 'Open QA hold',
      targetTab: 'qa',
      tone: 'red',
    };
  }
  if (type === 'machine') {
    return {
      department: 'Maintenance',
      neededNext: 'Confirm equipment status and log whether the machine can safely run.',
      safeAction: 'Open equipment alert',
      targetTab: 'maintenance',
      tone: 'red',
    };
  }
  if (type === 'labor') {
    return {
      department: order.currentDepartment,
      neededNext: 'Assign coverage or escalate the crew gap before promising the next handoff.',
      safeAction: 'Open coverage gap',
      targetTab: 'coverage',
      tone: 'orange',
    };
  }
  if (type === 'process' && order.engineeringRequired) {
    return {
      department: 'Engineering',
      neededNext: 'Confirm the released process, drawing, or route question before production treats it as clear.',
      safeAction: 'Open engineering review',
      targetTab: 'engineering',
      tone: 'orange',
    };
  }
  return {
    department: order.currentDepartment,
    neededNext: 'Department lead needs to confirm the owner before anyone treats this as cleared.',
    safeAction: 'Show why blocked',
    targetTab: 'orders',
    tone: 'red',
  };
}

function getPrimaryBlocker(order: ProductionOrder): FlowBlocker | null {
  if (order.blockers?.length) return order.blockers[0];
  if (order.materialStatus && !['RECEIVED', 'STAGED'].includes(order.materialStatus)) {
    return { type: 'material', message: `Material status is ${formatToken(order.materialStatus)}.` };
  }
  if (order.qaStatus === 'HOLD' || order.qaStatus === 'FAILED') {
    return { type: 'quality', message: `QA status is ${formatToken(order.qaStatus)}.` };
  }
  if (order.engineeringRequired && order.engineeringStatus === 'PENDING') {
    return { type: 'process', message: 'Engineering review is still pending.' };
  }
  return null;
}

function getSignalSortScore(signal: AccountabilitySignal): number {
  const priorityScore = signal.priorityLabel === 'CRITICAL' ? 50 : signal.priorityLabel === 'HOT' ? 30 : 10;
  const toneScore = signal.tone === 'red' ? 40 : signal.tone === 'orange' ? 25 : signal.tone === 'blue' ? 10 : 0;
  return priorityScore + toneScore;
}

function getAgeLabel(order: ProductionOrder): string {
  const timestamp = order.lastActionAt ?? order.salesReleasedAt;
  if (!timestamp) return 'No recent touch logged';
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return 'No recent touch logged';
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (minutes < 60) return `${minutes}m since last touch`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h since last touch`;
  return `${Math.round(hours / 24)}d since last touch`;
}

function getProofLine(order: ProductionOrder): string {
  if (order.lastAction) return `Last action: ${order.lastAction}`;
  if (order.salesReleasedAt) return `Sales released: ${new Date(order.salesReleasedAt).toLocaleString()}`;
  return 'No action trail logged yet.';
}

function formatPriority(priority: ProductionOrder['priority']): string {
  return String(priority ?? 'normal').trim().toUpperCase();
}

function formatToken(value: string): string {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
