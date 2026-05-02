import type { CSSProperties } from 'react';
import type { AppTab, RoleView } from '../../types/app';
import type { NavigationGroupId } from '../../logic/navigationAccess';
import { getVisibleNavigationGroups } from '../../logic/navigationAccess';

type CommandNavigationBarProps = {
  tab: AppTab;
  roleView: RoleView;
  currentLabel: string;
  alertCount: number;
  theme: 'dark' | 'light';
  onNavigate: (tab: AppTab) => void;
};

export default function CommandNavigationBar({
  tab,
  roleView,
  currentLabel,
  alertCount,
  theme,
  onNavigate,
}: CommandNavigationBarProps) {
  const groups = getVisibleNavigationGroups(roleView);

  return (
    <section style={getBarStyle(theme)}>
      <div style={statusBlockStyle}>
        <span style={statusLabelStyle}>Command Navigation</span>
        <strong style={getCurrentLabelStyle(theme)}>{currentLabel}</strong>
      </div>

      <div style={groupButtonGridStyle}>
        {groups.map((group) => {
          const active = group.items.some((item) => item.id === tab);
          const target = group.items[0]?.id ?? 'dashboard';
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => onNavigate(target)}
              style={getGroupButtonStyle(active, theme, group.id)}
              title={group.description}
            >
              <span style={groupLabelStyle}>{group.label}</span>
              <span style={groupDetailStyle}>{getGroupShortDescription(group.id)}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onNavigate('alerts')}
        style={getAlertsButtonStyle(alertCount, theme)}
      >
        {alertCount} {alertCount === 1 ? 'Alert' : 'Alerts'}
      </button>
    </section>
  );
}

function getGroupShortDescription(groupId: NavigationGroupId): string {
  if (groupId === 'command') return 'status + decisions';
  if (groupId === 'production') return 'orders + departments';
  if (groupId === 'workflow') return 'movement + crew';
  return 'clears problems';
}

function getBarStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 14,
    borderRadius: 0,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderLeft: '4px solid #f97316',
    display: 'grid',
    gridTemplateColumns: 'minmax(150px, 220px) 1fr auto',
    gap: 12,
    marginBottom: 20,
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };
}

const statusBlockStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
};

const statusLabelStyle: CSSProperties = {
  color: '#94a3b8',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '1px',
  textTransform: 'uppercase',
};

function getCurrentLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    fontSize: 14,
    letterSpacing: '0.7px',
    textTransform: 'uppercase',
  };
}

const groupButtonGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(105px, 1fr))',
  gap: 8,
};

function getGroupButtonStyle(active: boolean, theme: 'dark' | 'light', groupId: NavigationGroupId): CSSProperties {
  const color = getGroupColor(groupId);
  return {
    padding: '10px 12px',
    borderRadius: 4,
    border: active ? `1px solid ${color}` : theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    borderLeft: `4px solid ${active ? color : '#475569'}`,
    background: active ? `${color}22` : theme === 'dark' ? '#0f172a' : '#f8fafc',
    color: active ? color : theme === 'dark' ? '#cbd5e1' : '#475569',
    cursor: 'pointer',
    textAlign: 'left',
    minHeight: 58,
  };
}

const groupLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
};

const groupDetailStyle: CSSProperties = {
  display: 'block',
  marginTop: 4,
  fontSize: 10,
  color: '#64748b',
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
};

function getGroupColor(groupId: NavigationGroupId): string {
  if (groupId === 'command') return '#f97316';
  if (groupId === 'production') return '#3b82f6';
  if (groupId === 'workflow') return '#10b981';
  return '#8b5cf6';
}

function getAlertsButtonStyle(alertCount: number, theme: 'dark' | 'light'): CSSProperties {
  const hot = alertCount > 0;
  return {
    padding: '12px 16px',
    borderRadius: 4,
    border: hot ? '2px solid #dc2626' : '2px solid #10b981',
    background: hot
      ? theme === 'dark'
        ? 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)'
        : '#fee2e2'
      : theme === 'dark'
        ? 'linear-gradient(135deg, #065f46 0%, #047857 100%)'
        : '#d1fae5',
    color: theme === 'dark' ? 'white' : hot ? '#991b1b' : '#065f46',
    fontWeight: 900,
    fontSize: 12,
    cursor: 'pointer',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    whiteSpace: 'nowrap',
  };
}
