import type { Department } from '../types/machine';
import type { ReceivingExceptionType, ReceivingGateStatus, ReceivingLaneType, ReceivingOrder, ReceivingPressureSummary } from '../types/receiving';

export function getReceivingPressureSummary(orders: ReceivingOrder[]): ReceivingPressureSummary {
  const summary: ReceivingPressureSummary = { total: orders.length, arriving: 0, ready: 0, claimed: 0, holds: 0, critical: 0 };
  for (const order of orders) {
    if (order.status === 'ARRIVING_TODAY' || order.status === 'ORDERED') summary.arriving += 1;
    if (order.status === 'CHECKED_IN') summary.ready += 1;
    if (order.status === 'CLAIMED_FOR_DELIVERY') summary.claimed += 1;
    if (order.status === 'PROBLEM_HOLD') summary.holds += 1;
    if (order.priority === 'CRITICAL') summary.critical += 1;
  }
  return summary;
}

export function getReceivingGateStatus(order: ReceivingOrder): ReceivingGateStatus {
  if (order.status === 'PROBLEM_HOLD') return 'HOLD';
  if (order.status === 'DELIVERED') return 'COMPLETE';
  if (order.status === 'CLAIMED_FOR_DELIVERY') return 'IN_TRANSIT';
  if (order.status === 'CHECKED_IN') return 'READY_FOR_CLAIM';
  if (order.status === 'ARRIVING_TODAY') return 'VERIFY_REQUIRED';
  return 'QUEUED';
}

export const getReceivingGateLabel = (status: ReceivingGateStatus) => status.replaceAll('_', ' ');
export function getReceivingGateTone(status: ReceivingGateStatus): string {
  if (status === 'HOLD') return '#ef4444';
  if (status === 'VERIFY_REQUIRED') return '#f59e0b';
  if (status === 'READY_FOR_CLAIM') return '#38bdf8';
  if (status === 'IN_TRANSIT') return '#a78bfa';
  if (status === 'COMPLETE') return '#10b981';
  return '#64748b';
}

export function getReceivingDestinationLane(destination: Department): string {
  return destination;
}

export function getReceivingLaneType(destination: Department): ReceivingLaneType {
  if (destination === 'Receiving' || destination === 'Shipping') return 'LOGISTICS';
  if (destination === 'Machine Shop' || destination === 'Coating' || destination === 'Assembly') return 'PRODUCTION';
  return 'SUPPORT';
}

export const getReceivingLaneLabel = (laneType: ReceivingLaneType) => laneType;

export function getReceivingOrderAgeHours(order: ReceivingOrder): number {
  const first = order.notificationLog[0]?.at;
  if (!first) return 0;
  const diff = Date.now() - new Date(first).getTime();
  return Math.max(0, Math.round(diff / 36e5));
}

export function getReceivingAgeLabel(hours: number): string {
  if (hours < 1) return '<1h';
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export function getReceivingGateAction(order: ReceivingOrder): 'VERIFY' | 'CLAIM' | 'DELIVER' | 'RESOLVE_HOLD' | 'NONE' {
  if (order.status === 'ARRIVING_TODAY' || order.status === 'ORDERED') return 'VERIFY';
  if (order.status === 'CHECKED_IN') return 'CLAIM';
  if (order.status === 'CLAIMED_FOR_DELIVERY') return 'DELIVER';
  if (order.status === 'PROBLEM_HOLD') return 'RESOLVE_HOLD';
  return 'NONE';
}

export function getExceptionLabel(type: ReceivingExceptionType): string {
  return type.replaceAll('_', ' ');
}
