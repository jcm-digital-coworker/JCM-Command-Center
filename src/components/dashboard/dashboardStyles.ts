import type { CSSProperties } from 'react';

export type DashboardTone = 'red' | 'orange' | 'blue' | 'green' | 'slate';

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
