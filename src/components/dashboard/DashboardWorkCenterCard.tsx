import type { CSSProperties } from 'react';
import type { WorkCenter } from '../../types/plant';
import type { DashboardTheme } from './dashboardStyles';
import { dashboardWorkCenterBodyStyle } from './dashboardStyles';

type DashboardWorkCenterCardProps = {
  workCenter: WorkCenter;
  theme: DashboardTheme;
  onOpen: (workCenter: WorkCenter) => void;
};

export default function DashboardWorkCenterCard({
  workCenter,
  theme,
  onOpen,
}: DashboardWorkCenterCardProps) {
  return (
    <button
      type="button"
      style={getWorkCenterCardStyle(theme, workCenter.status)}
      onClick={() => onOpen(workCenter)}
    >
      <div style={workCenterContentStyle}>
        <div style={{ textAlign: 'left' }}>
          <div style={getWorkCenterTitleStyle(theme)}>{workCenter.name}</div>
          <div style={getResourceTypeStyle(workCenter.department)}>
            {getDepartmentResourceLabel(workCenter.department)}
          </div>
          <div style={dashboardWorkCenterBodyStyle}>{workCenter.dailyFocus[0]}</div>
        </div>
        <span style={getWorkCenterStatusBadge(workCenter.status)}>
          {workCenter.status.replace('_', ' ')}
        </span>
      </div>
    </button>
  );
}

function getDepartmentResourceLabel(department: string) {
  const labels: Record<string, string> = {
    Sales: 'Order release / customer signal',
    Engineering: 'Blueprints / routing release',
    Receiving: 'Material intake / staging',
    'Machine Shop': 'Machining cells / equipment',
    'Material Handling': 'Equipment / cut-form flow',
    Fab: 'Weld cells / skill lanes',
    Coating: 'Process zones / finish flow',
    Assembly: 'Assembly cells / kit readiness',
    'Saddles Dept': 'Product lane',
    'Patch Clamps': 'Product lane',
    Clamps: 'Product lane',
    QA: 'Validation layer',
    Shipping: 'Outbound lanes / ship readiness',
    Maintenance: 'Plant support / repair flow',
    Office: 'Admin / purchasing / planning',
  };
  return labels[department] ?? 'Work center';
}

function getWorkCenterCardStyle(theme: DashboardTheme, status: WorkCenter['status']): CSSProperties {
  const color = getWorkCenterStatusColor(status);
  return {
    padding: 16,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    borderRadius: 4,
    cursor: 'pointer',
    border: `1px solid ${color}66`,
    borderLeft: `4px solid ${color}`,
    textAlign: 'left',
  };
}

function getWorkCenterTitleStyle(theme: DashboardTheme): CSSProperties {
  return {
    fontWeight: 900,
    fontSize: 15,
    marginBottom: 6,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
  };
}

function getResourceTypeStyle(department: string): CSSProperties {
  const color = department === 'Machine Shop' ? '#64748b' : '#f97316';
  return {
    display: 'inline-block',
    padding: '3px 7px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 900,
    color,
    background: `${color}18`,
    border: `1px solid ${color}44`,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  };
}

function getWorkCenterStatusBadge(status: WorkCenter['status']): CSSProperties {
  const color = getWorkCenterStatusColor(status);
  return {
    padding: '4px 8px',
    borderRadius: 4,
    color,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.6px',
    whiteSpace: 'nowrap',
  };
}

function getWorkCenterStatusColor(status: WorkCenter['status']) {
  if (status === 'READY') return '#10b981';
  if (status === 'WATCH') return '#f59e0b';
  if (status === 'NEEDS_ATTENTION') return '#dc2626';
  return '#64748b';
}

const workCenterContentStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  alignItems: 'flex-start',
};
