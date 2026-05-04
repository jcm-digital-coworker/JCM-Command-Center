import { getWorkflowRuntimeState } from './workflowRuntimeState';

export type BlockerAgeTone = 'fresh' | 'aging' | 'stale';

export function getOrderLastTouchedHours(orderNumber: string): number | null {
  const override = getWorkflowRuntimeState()[orderNumber];
  if (!override?.lastActionAt) return null;
  const touchedAt = new Date(override.lastActionAt).getTime();
  if (Number.isNaN(touchedAt)) return null;
  const ms = Date.now() - touchedAt;
  return Math.max(0, ms / (1000 * 60 * 60));
}

export function getBlockerAgeLabel(hours: number): string {
  const safeHours = Math.max(0, hours);
  if (safeHours < 0.02) return 'just now';
  if (safeHours < 1) return `${Math.round(safeHours * 60)}m ago`;
  if (safeHours < 2) return '~1h ago';
  if (safeHours < 24) return `${Math.floor(safeHours)}h ago`;
  return `${Math.floor(safeHours / 24)}d ago`;
}

export function getBlockerAgeTone(hours: number): BlockerAgeTone {
  const safeHours = Math.max(0, hours);
  if (safeHours < 1) return 'fresh';
  if (safeHours < 6) return 'aging';
  return 'stale';
}

export function getBlockerAgeToneColor(tone: BlockerAgeTone): string {
  if (tone === 'fresh') return '#10b981';
  if (tone === 'aging') return '#f59e0b';
  return '#ef4444';
}
