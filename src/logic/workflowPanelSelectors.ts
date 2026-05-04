import type { WorkCenter } from '../types/plant';
import type { ProductionOrder } from '../types/productionOrder';
import { productionOrders } from '../data/productionOrders';
import { partBlueprints } from '../data/partBlueprints';
import { getBlueprintForOrder, getStationPacket } from './orderBlueprints';
import { getWorkflowSignal } from './orderWorkflow';
import { getRuntimeProductionOrders, getRuntimeOrder } from './workflowRuntimeState';

export type WorkflowCardGroupKey = 'DO_NOW' | 'BLOCKED_HERE' | 'UPSTREAM_ACTION' | 'INCOMING' | 'WATCH_ONLY';

export type WorkflowCardGroup = {
  key: WorkflowCardGroupKey;
  title: string;
  description: string;
  cards: WorkflowTabletCard[];
};

export type WorkflowTabletCard = {
  order: ProductionOrder;
  packet: ReturnType<typeof getStationPacket>;
  signal: ReturnType<typeof getWorkflowSignal>;
  groupKey: WorkflowCardGroupKey;
  relationshipLabel: string;
  relationshipReason: string;
  operatorConstraint: string;
  urgency: { label: string; color: string };
  due: { label: string; color: string; score: number };
  buttons: { primary: string; secondary: string };
};

const GROUP_META: Record<WorkflowCardGroupKey, Omit<WorkflowCardGroup, 'cards'>> = {
  DO_NOW: { key: 'DO_NOW', title: 'Do now', description: 'This work center owns the next action.' },
  BLOCKED_HERE: { key: 'BLOCKED_HERE', title: 'Blocked here', description: 'This order is physically or operationally stuck at this work center.' },
  UPSTREAM_ACTION: { key: 'UPSTREAM_ACTION', title: 'Upstream action', description: 'Another owner must act before this work center should touch it.' },
  INCOMING: { key: 'INCOMING', title: 'Incoming', description: 'This order is heading here. Prepare, but do not claim unless instructed.' },
  WATCH_ONLY: { key: 'WATCH_ONLY', title: 'Watch only', description: 'Visibility only. Do not act from this tablet yet.' },
};

const GROUP_ORDER: WorkflowCardGroupKey[] = ['DO_NOW', 'BLOCKED_HERE', 'UPSTREAM_ACTION', 'INCOMING', 'WATCH_ONLY'];

export function getWorkCenterWorkflowGroups(workCenter: WorkCenter, orders: ProductionOrder[] = productionOrders): WorkflowCardGroup[] {
  const runtimeOrders = getRuntimeProductionOrders(orders);
  const cards = runtimeOrders
    .map((order) => getWorkflowTabletCard(order, workCenter))
    .filter((card): card is WorkflowTabletCard => Boolean(card))
    .sort((a, b) => b.signal.pressureScore - a.signal.pressureScore);

  return GROUP_ORDER.map((groupKey) => ({
    ...GROUP_META[groupKey],
    cards: cards.filter((card) => card.groupKey === groupKey),
  })).filter((group) => group.cards.length > 0);
}

export function getWorkflowTabletCard(order: ProductionOrder, workCenter: WorkCenter): WorkflowTabletCard | undefined {
  const runtimeOrder = getRuntimeOrder(order);
  const blueprint = getBlueprintForOrder(runtimeOrder, partBlueprints);
  const packet = getStationPacket(runtimeOrder, blueprint);
  const signal = getWorkflowSignal(runtimeOrder);
  const department = workCenter.department;

  const ownsPrimary = signal.gate === department;
  const ownsParallel = signal.parallelActions.some((action) => action.owner === department);
  const isCurrentDepartment = runtimeOrder.currentDepartment === department;
  const isNextDepartment = runtimeOrder.nextDepartment === department;
  const isWatcher = signal.watchers.some((watcher) => watcher.owner === department);

  if (!ownsPrimary && !ownsParallel && !isCurrentDepartment && !isNextDepartment && !isWatcher) {
    return undefined;
  }

  const groupKey = getGroupKey({ ownsPrimary, ownsParallel, isCurrentDepartment, isNextDepartment, isWatcher, canProceed: signal.canProceed, strength: signal.strength });

  return {
    order: runtimeOrder,
    packet,
    signal,
    groupKey,
    relationshipLabel: getRelationshipLabel(groupKey),
    relationshipReason: getRelationshipReason({ groupKey, signal, department, ownsPrimary, ownsParallel, isNextDepartment }),
    operatorConstraint: getOperatorConstraint(groupKey, signal.canProceed),
    urgency: getUrgency(signal.urgency, signal.strength, signal.canProceed),
    due: getDueLabel(runtimeOrder.projectedShipDate),
    buttons: getButtons(String(signal.gate), String(signal.checkpoint), String(packet.status), groupKey),
  };
}

function getGroupKey(args: { ownsPrimary: boolean; ownsParallel: boolean; isCurrentDepartment: boolean; isNextDepartment: boolean; isWatcher: boolean; canProceed: boolean; strength: string }): WorkflowCardGroupKey {
  if (args.ownsPrimary || args.ownsParallel) return 'DO_NOW';
  if (args.isCurrentDepartment && (!args.canProceed || args.strength === 'HARD_STOP')) return 'BLOCKED_HERE';
  if (args.isCurrentDepartment && !args.ownsPrimary) return 'UPSTREAM_ACTION';
  if (args.isNextDepartment) return 'INCOMING';
  if (args.isWatcher) return 'WATCH_ONLY';
  return 'WATCH_ONLY';
}

function getRelationshipLabel(groupKey: WorkflowCardGroupKey): string {
  if (groupKey === 'DO_NOW') return 'Your action';
  if (groupKey === 'BLOCKED_HERE') return 'Blocked at this station';
  if (groupKey === 'UPSTREAM_ACTION') return 'Waiting on another owner';
  if (groupKey === 'INCOMING') return 'Incoming work';
  return 'Watch only';
}

function getRelationshipReason(args: { groupKey: WorkflowCardGroupKey; signal: ReturnType<typeof getWorkflowSignal>; department: WorkCenter['department']; ownsPrimary: boolean; ownsParallel: boolean; isNextDepartment: boolean }): string {
  if (args.ownsPrimary) return `${args.department} owns the primary action: ${args.signal.action}`;
  if (args.ownsParallel) {
    const action = args.signal.parallelActions.find((item) => item.owner === args.department);
    return `${args.department} owns a parallel action: ${action?.action ?? args.signal.action}`;
  }
  if (args.groupKey === 'BLOCKED_HERE') return `The order is here, but ${args.signal.gate} owns the unblock action.`;
  if (args.groupKey === 'UPSTREAM_ACTION') return `The order is here, but the primary owner is ${args.signal.gate}.`;
  if (args.isNextDepartment) return `This order is expected to hand off into ${args.department}.`;
  return `${args.department} is watching this order for visibility only.`;
}

function getOperatorConstraint(groupKey: WorkflowCardGroupKey, canProceed: boolean): string {
  if (groupKey === 'DO_NOW') return canProceed ? 'Act now. This station is allowed to move the order.' : 'Act on the assigned issue. Do not run production until hard stops clear.';
  if (groupKey === 'BLOCKED_HERE') return 'Do not proceed. The card is visible because the order is blocked here.';
  if (groupKey === 'UPSTREAM_ACTION') return 'Do not proceed. Wait for the listed owner to clear the upstream action.';
  if (groupKey === 'INCOMING') return 'Prepare only. Do not claim until the order becomes current work.';
  return 'Visibility only. No station action required.';
}

function getUrgency(urgency: string, strength: string, canProceed: boolean) {
  if (strength === 'HARD_STOP') return { label: 'HARD STOP', color: '#dc2626' };
  if (!canProceed) return { label: 'BLOCKED', color: '#dc2626' };
  if (urgency === 'critical') return { label: 'CRITICAL', color: '#dc2626' };
  if (urgency === 'action') return { label: 'ACTION', color: '#f59e0b' };
  if (urgency === 'watch') return { label: 'WATCH', color: '#f59e0b' };
  return { label: 'READY', color: '#10b981' };
}

function getDueLabel(date?: string) {
  if (!date) return { label: 'NO DATE', color: '#64748b', score: 0 };
  const due = new Date(`${date}T00:00:00`);
  if (Number.isNaN(due.getTime())) return { label: 'BAD DATE', color: '#64748b', score: 0 };
  const days = Math.ceil((due.getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: 'OVERDUE', color: '#dc2626', score: 100 };
  if (days === 0) return { label: 'DUE TODAY', color: '#dc2626', score: 90 };
  if (days <= 2) return { label: `DUE IN ${days} DAY${days === 1 ? '' : 'S'}`, color: '#f59e0b', score: 60 };
  return { label: `DUE IN ${days} DAYS`, color: '#10b981', score: 0 };
}

function getButtons(owner: string, checkpoint: string, status: string, groupKey: WorkflowCardGroupKey) {
  if (groupKey === 'WATCH_ONLY' || groupKey === 'INCOMING') return { primary: 'View Packet', secondary: 'No Action' };
  if (owner === 'Engineering' || checkpoint === 'ENGINEERING_REVIEW') return { primary: 'Escalate Engineering', secondary: 'Hold Station' };
  if (owner === 'Receiving' || owner === 'Purchasing' || checkpoint === 'MATERIAL_READINESS') return { primary: 'Request Material', secondary: 'Notify Receiving' };
  if (owner === 'Maintenance') return { primary: 'Open Maintenance', secondary: 'Notify Lead' };
  if (status === 'BLOCKED') return { primary: 'Review blocker', secondary: 'Notify Lead' };
  return { primary: 'Start Work', secondary: 'View Packet' };
}
