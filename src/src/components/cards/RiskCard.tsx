import type { CSSProperties, ReactElement } from 'react';
import type { RiskItem } from '../../types/risk';
import type { RoleView } from '../../types/app';

interface RiskCardProps {
  risk: RiskItem;
  roleView: RoleView;
  theme?: 'dark' | 'light';
}

export default function RiskCard({
  risk,
  roleView,
  theme = 'dark',
}: RiskCardProps) {
  return (
    <div style={getCardStyle(theme)}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: 16,
              color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
              letterSpacing: '0.3px',
            }}
          >
            {risk.title}
          </span>
          {getSeverityBadge(risk.severity ?? risk.level)}
        </div>

        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
          {risk.department} • {risk.category ?? risk.source}
        </div>

        <div
          style={{
            fontSize: 14,
            color: theme === 'dark' ? '#cbd5e1' : '#475569',
            marginBottom: 8,
          }}
        >
          {risk.description}
        </div>

        {(risk.mitigation || risk.recommendedAction) && (
          <div
            style={{
              fontSize: 13,
              color: '#64748b',
              marginTop: 8,
              paddingTop: 8,
              borderTop:
                theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
            }}
          >
            <strong style={{ color: '#f97316' }}>MITIGATION:</strong>{' '}
            {risk.mitigation ?? risk.recommendedAction}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'right' }}>{getStatusBadge(risk.status ?? 'OPEN')}</div>
    </div>
  );
}

function getCardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    padding: 16,
    borderRadius: 6,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    display: 'flex',
    gap: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };
}

function getSeverityBadge(severity: string): ReactElement {
  const colors: Record<string, { bg: string; color: string; border: string }> =
    {
      CRITICAL: {
        bg: 'rgba(220, 38, 38, 0.2)',
        color: '#fca5a5',
        border: '#dc2626',
      },
      HIGH: {
        bg: 'rgba(239, 68, 68, 0.2)',
        color: '#fca5a5',
        border: '#ef4444',
      },
      MEDIUM: {
        bg: 'rgba(245, 158, 11, 0.2)',
        color: '#fcd34d',
        border: '#f59e0b',
      },
      LOW: {
        bg: 'rgba(59, 130, 246, 0.2)',
        color: '#93c5fd',
        border: '#3b82f6',
      },
    };

  const style = colors[severity] || colors.LOW;

  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 800,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}
    >
      {severity}
    </span>
  );
}

function getStatusBadge(status: string): ReactElement {
  const colors: Record<string, { bg: string; color: string; border: string }> =
    {
      OPEN: { bg: '#fee2e2', color: '#dc2626', border: '#ef4444' },
      IN_PROGRESS: { bg: '#fef3c7', color: '#d97706', border: '#f59e0b' },
      CLOSED: { bg: '#d1fae5', color: '#059669', border: '#10b981' },
      RESOLVED: { bg: '#d1fae5', color: '#059669', border: '#10b981' },
    };

  const style = colors[status] || colors.OPEN;

  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 800,
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  );
}
