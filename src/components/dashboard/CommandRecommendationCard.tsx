import type { CSSProperties } from 'react';
import type { CommandRecommendation, PlantStatusSeverity } from '../../logic/commandRecommendations';
import type { DashboardTheme } from './dashboardStyles';

type CommandRecommendationCardProps = {
  recommendation: CommandRecommendation;
  theme: DashboardTheme;
  onNavigate: () => void;
};

export default function CommandRecommendationCard({
  recommendation,
  theme,
  onNavigate,
}: CommandRecommendationCardProps) {
  const color = getSeverityColor(recommendation.severity);

  return (
    <section style={getCardStyle(theme, color)}>
      <div style={contentStyle}>
        <div>
          <div style={getEyebrowStyle(color)}>{getSeverityLabel(recommendation.severity)} / RECOMMENDED NEXT ACTION</div>
          <h3 style={getTitleStyle(theme)}>{recommendation.title}</h3>
          <p style={detailStyle}>{recommendation.detail}</p>
          <p style={reasonStyle}>Reason: {recommendation.reason}</p>
        </div>

        <button type="button" onClick={onNavigate} style={getButtonStyle(color)}>
          {recommendation.actionLabel}
        </button>
      </div>
    </section>
  );
}

function getSeverityColor(severity: PlantStatusSeverity): string {
  if (severity === 'critical') return '#dc2626';
  if (severity === 'blocked') return '#f97316';
  if (severity === 'watch') return '#f59e0b';
  return '#10b981';
}

function getSeverityLabel(severity: PlantStatusSeverity): string {
  if (severity === 'critical') return 'CRITICAL';
  if (severity === 'blocked') return 'BLOCKED';
  if (severity === 'watch') return 'WATCH';
  return 'STABLE';
}

function getCardStyle(theme: DashboardTheme, color: string): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: `1px solid ${color}66`,
    borderLeft: `4px solid ${color}`,
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };
}

const contentStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 16,
  flexWrap: 'wrap',
};

function getEyebrowStyle(color: string): CSSProperties {
  return {
    color,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.9px',
    textTransform: 'uppercase',
    marginBottom: 6,
  };
}

function getTitleStyle(theme: DashboardTheme): CSSProperties {
  return {
    margin: 0,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    fontSize: 17,
    fontWeight: 900,
    letterSpacing: '0.4px',
  };
}

const detailStyle: CSSProperties = {
  margin: '7px 0 0',
  color: '#94a3b8',
  fontSize: 13,
  lineHeight: 1.45,
};

const reasonStyle: CSSProperties = {
  margin: '8px 0 0',
  color: '#64748b',
  fontSize: 12,
  lineHeight: 1.4,
};

function getButtonStyle(color: string): CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 4,
    border: `1px solid ${color}`,
    background: `${color}22`,
    color,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  };
}
