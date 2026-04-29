import type { CSSProperties } from 'react';
import type { MaintenanceRequestPriority } from '../types/maintenanceRequest';

interface PriorityBadgeProps {
  priority: MaintenanceRequestPriority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const style = getPriorityStyle(priority);
  const label = getPriorityLabel(priority);

  return <span style={style}>{label}</span>;
}

function getPriorityStyle(priority: MaintenanceRequestPriority): CSSProperties {
  const baseStyle: CSSProperties = {
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 700,
    display: 'inline-block',
  };

  if (priority === 'SAFETY') return { ...baseStyle, background: '#7f1d1d', color: '#fecaca' };
  if (priority === 'LINE_DOWN' || priority === 'MACHINE_DOWN') return { ...baseStyle, background: '#dc2626', color: 'white' };
  if (priority === 'URGENT') return { ...baseStyle, background: '#f59e0b', color: 'white' };
  return { ...baseStyle, background: '#10b981', color: 'white' };
}

function getPriorityLabel(priority: MaintenanceRequestPriority): string {
  if (priority === 'SAFETY') return '🛑 SAFETY';
  if (priority === 'LINE_DOWN') return '🔴 LINE DOWN';
  if (priority === 'MACHINE_DOWN') return '🔴 MACHINE DOWN';
  if (priority === 'URGENT') return '🟡 URGENT';
  return '🟢 NORMAL';
}
