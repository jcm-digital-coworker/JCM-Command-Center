import type { CSSProperties } from 'react';
import type { Machine } from '../types/machine';

interface StatusBadgeProps {
  state: Machine['state'];
  priority: Machine['alarmPriority'];
}

export default function StatusBadge({ state, priority }: StatusBadgeProps) {
  const style = getStatusStyle(state, priority);
  const label = getStatusLabel(state, priority);

  return <span style={style}>{label}</span>;
}

function getStatusStyle(
  state: Machine['state'],
  priority: Machine['alarmPriority']
): CSSProperties {
  const baseStyle: CSSProperties = {
    padding: '6px 12px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    display: 'inline-block',
    background: '#1e293b',
    color: '#e2e8f0',
    borderLeft: '4px solid',
  };

  if (priority === 'ESTOP') {
    return { ...baseStyle, borderLeftColor: '#dc2626', color: '#fca5a5' };
  }

  if (priority === 'ALARM' || state === 'ALARM') {
    return { ...baseStyle, borderLeftColor: '#ef4444', color: '#fca5a5' };
  }

  if (state === 'OFFLINE') {
    return { ...baseStyle, borderLeftColor: '#64748b', color: '#94a3b8' };
  }

  if (state === 'IDLE') {
    return { ...baseStyle, borderLeftColor: '#f59e0b', color: '#fcd34d' };
  }

  // RUNNING
  return { ...baseStyle, borderLeftColor: '#10b981', color: '#6ee7b7' };
}

function getStatusLabel(
  state: Machine['state'],
  priority: Machine['alarmPriority']
): string {
  if (priority === 'ESTOP') return 'E-STOP';
  if (priority === 'ALARM') return 'ALARM';
  if (priority === 'RESET') return 'RESET';
  return state;
}
