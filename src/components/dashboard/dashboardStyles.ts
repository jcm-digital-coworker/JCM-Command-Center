import type { CSSProperties } from 'react';

export type DashboardTone = 'red' | 'orange' | 'blue' | 'green' | 'slate';
export type DashboardTheme = 'dark' | 'light';

export function getDashboardToneColor(tone: DashboardTone): string {
  if (tone === 'red') return '#dc2626';
  if (tone === 'orange') return '#f97316';
  if (tone === 'blue') return '#3b82f6';
  if (tone === 'green') return '#10b981';
  return '#64748b';
}

export const dashboardPromptGridStyle: CSSProperties = {
  marginTop: 14,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 10,
};

export const dashboardPromptDetailStyle: CSSProperties = {
  color: '#64748b',
  fontSize: 12,
  lineHeight: 1.35,
  marginTop: 6,
};

export function getDashboardPromptCardStyle(color: string): CSSProperties {
  return {
    padding: 12,
    borderRadius: 5,
    border: `1px solid ${color}55`,
    borderLeft: `4px solid ${color}`,
    background: '#0f172a',
  };
}

export function getDashboardPromptTitleStyle(color: string): CSSProperties {
  return {
    color,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.7px',
  };
}

export function getDashboardPromptButtonStyle(color: string): CSSProperties {
  return {
    marginTop: 10,
    padding: '7px 9px',
    borderRadius: 4,
    border: `1px solid ${color}`,
    background: `${color}22`,
    color,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.6px',
    cursor: 'pointer',
  };
}

export const dashboardHeaderStyle: CSSProperties = { marginBottom: 20 };

export const dashboardSubtitleStyle: CSSProperties = {
  margin: '4px 0 0 0',
  fontSize: 13,
  color: '#64748b',
  letterSpacing: '1px',
  textTransform: 'uppercase',
};

export const dashboardMetricLabelStyle: CSSProperties = {
  fontSize: 10,
  color: '#94a3b8',
  fontWeight: 800,
  marginBottom: 4,
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
};

export const dashboardSectionHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
};

export const dashboardListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

export const dashboardGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
  gap: 12,
};

export const dashboardMutedTextStyle: CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  lineHeight: 1.4,
};

export const dashboardWorkCenterBodyStyle: CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  lineHeight: 1.4,
  marginTop: 8,
};

export const dashboardQuickActionsHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  marginBottom: 12,
};

export const dashboardQuickActionsSubtitleStyle: CSSProperties = {
  margin: '4px 0 0',
  fontSize: 12,
  color: '#64748b',
  letterSpacing: '0.7px',
  textTransform: 'uppercase',
};

export const dashboardQuickActionsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: 10,
};

export const dashboardQuickActionDetailStyle: CSSProperties = {
  display: 'block',
  marginTop: 6,
  color: '#64748b',
  fontSize: 12,
  lineHeight: 1.35,
};

export const dashboardOverviewBarStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
  gap: 10,
  marginBottom: 12,
};

export const dashboardMissionGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(172px, 1fr))',
  gap: 10,
  marginBottom: 14,
};

export const dashboardViewAllButtonStyle: CSSProperties = {
  padding: '8px 14px',
  background: 'rgba(249, 115, 22, 0.1)',
  border: '1px solid #f97316',
  borderRadius: 4,
  fontSize: 12,
  fontWeight: 800,
  cursor: 'pointer',
  color: '#f97316',
  letterSpacing: '0.5px',
};

export function getDashboardTitleStyle(theme: DashboardTheme): CSSProperties {
  return {
    margin: 0,
    fontSize: 24,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    letterSpacing: '0.5px',
  };
}

export function getDashboardQuickActionsPanelStyle(theme: DashboardTheme): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderLeft: '4px solid #f97316',
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };
}

export function getDashboardQuickActionsTitleStyle(theme: DashboardTheme): CSSProperties {
  return {
    margin: 0,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    fontSize: 16,
    fontWeight: 900,
    letterSpacing: '0.8px',
  };
}

export function getDashboardQuickActionButtonStyle(theme: DashboardTheme, tone: DashboardTone): CSSProperties {
  const color = getDashboardToneColor(tone);
  return {
    textAlign: 'left',
    borderRadius: 5,
    border: `1px solid ${color}55`,
    borderLeft: `4px solid ${color}`,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    padding: 12,
    cursor: 'pointer',
  };
}

export function getDashboardQuickActionLabelStyle(tone: DashboardTone): CSSProperties {
  return {
    display: 'block',
    color: getDashboardToneColor(tone),
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.7px',
    textTransform: 'uppercase',
  };
}

export function getDashboardMetricStyle(theme: DashboardTheme): CSSProperties {
  return {
    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.72)' : '#ffffff',
    padding: '12px 14px',
    borderRadius: 5,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.14)',
  };
}

export function getDashboardMissionCardStyle(theme: DashboardTheme, color: string): CSSProperties {
  return {
    textAlign: 'left',
    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.76)' : '#ffffff',
    padding: 13,
    borderRadius: 5,
    border: `1px solid ${color}40`,
    borderLeft: `3px solid ${color}`,
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.14)',
  };
}

export function getDashboardMissionValueStyle(theme: DashboardTheme): CSSProperties {
  return {
    marginTop: 6,
    marginBottom: 5,
    fontSize: 16,
    fontWeight: 900,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
  };
}

export function getDashboardSectionStyle(theme: DashboardTheme): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 20,
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    marginBottom: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };
}

function getDashboardItemBaseStyle(theme: DashboardTheme): CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    borderRadius: 4,
    border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
  };
}

export function getDashboardItemStyle(theme: DashboardTheme): CSSProperties {
  return getDashboardItemBaseStyle(theme);
}

export function getDashboardActionItemStyle(theme: DashboardTheme): CSSProperties {
  return {
    ...getDashboardItemBaseStyle(theme),
    cursor: 'pointer',
  };
}

export function getDashboardItemTitleStyle(theme: DashboardTheme): CSSProperties {
  return {
    fontWeight: 800,
    fontSize: 14,
    marginBottom: 4,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
  };
}

export function getDashboardPlantNoteStyle(theme: DashboardTheme): CSSProperties {
  return {
    padding: 14,
    borderRadius: 4,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    color: '#64748b',
    fontSize: 13,
    lineHeight: 1.45,
  };
}
