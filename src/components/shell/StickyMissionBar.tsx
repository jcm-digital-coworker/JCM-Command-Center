import type { CSSProperties } from 'react';
import type { AppTab, RoleView } from '../../types/app';
import type { Department } from '../../types/machine';
import type { WorkCenter } from '../../types/plant';

type ThemeMode = 'dark' | 'light';

type StickyMissionBarProps = {
  roleView: RoleView;
  activeTab: AppTab;
  currentLabel: string;
  departmentFilter: Department | 'All';
  selectedWorkCenter?: WorkCenter | null;
  canGoBack: boolean;
  theme?: ThemeMode;
  onCommandCenter: () => void;
  onOrders: () => void;
  onBack: () => void;
  onOpenMenu: () => void;
};

export default function StickyMissionBar({
  roleView,
  activeTab,
  currentLabel,
  departmentFilter,
  selectedWorkCenter,
  canGoBack,
  theme = 'dark',
  onCommandCenter,
  onOrders,
  onBack,
  onOpenMenu,
}: StickyMissionBarProps) {
  const locationLabel = selectedWorkCenter?.name ?? (departmentFilter === 'All' ? currentLabel : `${departmentFilter} / ${currentLabel}`);
  const mission = getMissionCopy(roleView, activeTab, Boolean(selectedWorkCenter));

  return (
    <div style={barStyle(theme)}>
      <div style={identityStyle}>
        <span style={rolePillStyle(theme)}>{String(roleView).toUpperCase()}</span>
        <div style={missionTextWrapStyle}>
          <div style={locationStyle(theme)}>{locationLabel}</div>
          <div style={missionStyle(theme)}>{mission}</div>
        </div>
      </div>
      <div style={actionsStyle}>
        <button type="button" style={buttonStyle(theme, 'primary')} onClick={onCommandCenter}>COMMAND</button>
        <button type="button" style={buttonStyle(theme, 'default')} onClick={onOrders}>ORDERS</button>
        <button type="button" style={buttonStyle(theme, 'default')} onClick={onOpenMenu}>MENU</button>
        <button type="button" style={buttonStyle(theme, canGoBack ? 'default' : 'disabled')} onClick={onBack} disabled={!canGoBack}>BACK</button>
      </div>
    </div>
  );
}

function getMissionCopy(roleView: RoleView, activeTab: AppTab, hasWorkCenter: boolean): string {
  if (hasWorkCenter) return 'Focused work center. Check owner, blocker, and next safe action before changing anything.';
  const normalizedRole = String(roleView).toLowerCase();
  if (normalizedRole.includes('maintenance')) return 'Maintenance view. Find requests, equipment risk, and what needs safe service next.';
  if (normalizedRole.includes('support') || normalizedRole.includes('qa')) return 'Support view. See who needs help, what is waiting, and what needs more information.';
  if (normalizedRole.includes('lead') || normalizedRole.includes('supervisor')) return 'Lead view. Separate what we own, what waits on us, and what we are waiting on.';
  if (normalizedRole.includes('production') || normalizedRole.includes('operator')) return 'Production view. Find what is safe to run, blocked, or needs a lead.';
  if (activeTab === 'dashboard') return 'Management view. Start with ownership, aging blockers, and safe next action.';
  return 'Keep context while moving. Use Command, Orders, Menu, or Back without scrolling.';
}

function barStyle(theme: ThemeMode): CSSProperties {
  return {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    margin: '0 0 14px',
    padding: '9px 10px',
    borderRadius: 8,
    border: theme === 'dark' ? '1px solid rgba(249,115,22,0.45)' : '1px solid rgba(249,115,22,0.4)',
    borderLeft: '5px solid #f97316',
    background: theme === 'dark' ? 'rgba(15,23,42,0.96)' : 'rgba(255,255,255,0.96)',
    boxShadow: theme === 'dark' ? '0 10px 24px rgba(0,0,0,0.28)' : '0 8px 18px rgba(15,23,42,0.12)',
    backdropFilter: 'blur(8px)',
  };
}

const identityStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minWidth: 0,
};

function rolePillStyle(theme: ThemeMode): CSSProperties {
  return {
    flexShrink: 0,
    padding: '5px 8px',
    borderRadius: 999,
    border: '1px solid #f97316',
    background: theme === 'dark' ? 'rgba(249,115,22,0.14)' : '#fff7ed',
    color: '#f97316',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.7px',
  };
}

const missionTextWrapStyle: CSSProperties = {
  minWidth: 0,
};

function locationStyle(theme: ThemeMode): CSSProperties {
  return {
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
}

function missionStyle(theme: ThemeMode): CSSProperties {
  return {
    color: theme === 'dark' ? '#94a3b8' : '#475569',
    fontSize: 11,
    fontWeight: 750,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 660,
  };
}

const actionsStyle: CSSProperties = {
  display: 'flex',
  gap: 6,
  alignItems: 'center',
  flexShrink: 0,
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
};

function buttonStyle(theme: ThemeMode, variant: 'primary' | 'default' | 'disabled'): CSSProperties {
  const disabled = variant === 'disabled';
  const primary = variant === 'primary';
  return {
    padding: '6px 9px',
    borderRadius: 5,
    border: primary ? '1px solid #f97316' : theme === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
    background: disabled
      ? theme === 'dark' ? 'rgba(71,85,105,0.2)' : '#f1f5f9'
      : primary
        ? 'rgba(249,115,22,0.16)'
        : theme === 'dark' ? 'rgba(30,41,59,0.9)' : '#ffffff',
    color: disabled ? '#64748b' : primary ? '#f97316' : theme === 'dark' ? '#cbd5e1' : '#334155',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.6px',
    whiteSpace: 'nowrap',
  };
}
