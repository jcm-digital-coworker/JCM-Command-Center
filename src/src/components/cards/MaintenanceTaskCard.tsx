import type { CSSProperties } from 'react';
import type { Machine } from '../../types/machine';
import type { MaintenanceStatus, MaintenanceTask } from '../../types/maintenance';

interface MaintenanceTaskCardProps {
  task: MaintenanceTask;
  machine?: Machine;
  theme?: 'dark' | 'light';
  compact?: boolean;
}

export default function MaintenanceTaskCard({
  task,
  machine,
  theme = 'dark',
  compact = false,
}: MaintenanceTaskCardProps) {
  const statusMeta = getStatusMeta(task.status);

  return (
    <article
      style={{
        ...getCardStyle(theme),
        borderLeft: `5px solid ${statusMeta.color}`,
        padding: compact ? 14 : 18,
      }}
    >
      <div style={topRowStyle}>
        <div style={{ minWidth: 0 }}>
          <div style={getMachineNameStyle(theme)}>
            {machine?.name || 'Unassigned Machine'}
          </div>
          <div style={getMetaLineStyle(theme)}>
            {machine?.department || 'General'} • {task.category} • {task.interval}
          </div>
        </div>

        <span style={getStatusBadgeStyle(task.status)}>{statusMeta.label}</span>
      </div>

      <h3 style={getTitleStyle(theme, compact)}>{task.title}</h3>

      {!compact && task.notes && <p style={getNotesStyle(theme)}>{task.notes}</p>}

      <div style={getFooterStyle(theme)}>
        <div>
          <span style={footerLabelStyle}>Last done</span>
          <strong style={getFooterValueStyle(theme)}>{task.lastCompleted}</strong>
        </div>
        <div>
          <span style={footerLabelStyle}>Next due</span>
          <strong style={getFooterValueStyle(theme)}>{task.nextDue}</strong>
        </div>
      </div>
    </article>
  );
}

function getStatusMeta(status: MaintenanceStatus) {
  if (status === 'OVERDUE') {
    return { label: 'Overdue', color: '#dc2626' };
  }
  if (status === 'DUE_SOON') {
    return { label: 'Due Soon', color: '#f59e0b' };
  }
  if (status === 'WATCH') {
    return { label: 'Watch', color: '#8b5cf6' };
  }
  return { label: 'OK', color: '#10b981' };
}

function getCardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderRadius: 8,
    boxShadow:
      theme === 'dark'
        ? '0 8px 20px rgba(0,0,0,0.22)'
        : '0 6px 16px rgba(15,23,42,0.08)',
  };
}

const topRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
};

function getMachineNameStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: '0.3px',
    lineHeight: 1.2,
  };
}

function getMetaLineStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: 12,
    marginTop: 5,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };
}

function getStatusBadgeStyle(status: MaintenanceStatus): CSSProperties {
  const meta = getStatusMeta(status);

  return {
    flexShrink: 0,
    padding: '5px 9px',
    borderRadius: 999,
    background: `${meta.color}20`,
    color: meta.color,
    border: `1px solid ${meta.color}66`,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };
}

function getTitleStyle(theme: 'dark' | 'light', compact: boolean): CSSProperties {
  return {
    color: theme === 'dark' ? '#cbd5e1' : '#1e293b',
    fontSize: compact ? 14 : 16,
    lineHeight: 1.35,
    margin: compact ? '10px 0 0 0' : '14px 0 10px 0',
    fontWeight: 800,
  };
}

function getNotesStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#94a3b8' : '#475569',
    fontSize: 13,
    lineHeight: 1.45,
    margin: '0 0 14px 0',
  };
}

function getFooterStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
    paddingTop: 12,
    borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
  };
}

const footerLabelStyle: CSSProperties = {
  display: 'block',
  color: '#64748b',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
  marginBottom: 4,
};

function getFooterValueStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'block',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    fontSize: 13,
    fontWeight: 800,
  };
}
