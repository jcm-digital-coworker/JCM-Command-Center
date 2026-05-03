import { getWorkflowRuntimeState } from './workflowRuntimeState';

export type BlockerAgeTone = 'fresh' | 'aging' | 'stale';

export function getOrderLastTouchedHours(orderNumber: string): number | null {
  const override = getWorkflowRuntimeState()[orderNumber];
  if (!override?.lastActionAt) return null;
  const ms = Date.now() - new Date(override.lastActionAt).getTime();
  return ms / (1000 * 60 * 60);
}

export function getBlockerAgeLabel(hours: number): string {
  if (hours < 0.02) return 'just now';
  if (hours < 1) return `${Math.round(hours * 60)}m ago`;
  if (hours < 2) return '~1h ago';
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function getBlockerAgeTone(hours: number): BlockerAgeTone {
  if (hours < 1) return 'fresh';
  if (hours < 6) return 'aging';
  return 'stale';
}

export function getBlockerAgeToneColor(tone: BlockerAgeTone): string {
  if (tone === 'fresh') return '#10b981';
  if (tone === 'aging') return '#f59e0b';
  return '#ef4444';
}
