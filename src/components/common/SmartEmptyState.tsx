import type { CSSProperties } from 'react';

export type SmartEmptyStateTheme = 'dark' | 'light';

export type SmartEmptyStateProps = {
  title: string;
  detail: string;
  actionLabel?: string;
  onAction?: () => void;
  theme?: SmartEmptyStateTheme;
};

export default function SmartEmptyState({
  title,
  detail,
  actionLabel,
  onAction,
  theme = 'dark',
}: SmartEmptyStateProps) {
  return (
    <div style={getShellStyle(theme)}>
      <div>
        <div style={getTitleStyle(theme)}>{title}</div>
        <div style={detailStyle}>{detail}</div>
      </div>
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction} style={actionButtonStyle}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function getShellStyle(theme: SmartEmptyStateTheme): CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    padding: 14,
    borderRadius: 5,
    background: theme === 'dark' ? 'rgba(15, 23, 42, 0.52)' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderLeft: '4px solid #10b981',
  };
}

function getTitleStyle(theme: SmartEmptyStateTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };
}

const detailStyle: CSSProperties = {
  color: '#64748b',
  fontSize: 12,
  lineHeight: 1.45,
  marginTop: 5,
};

const actionButtonStyle: CSSProperties = {
  padding: '8px 10px',
  borderRadius: 4,
  border: '1px solid #10b981',
  background: 'rgba(16, 185, 129, 0.12)',
  color: '#10b981',
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
  cursor: 'pointer',
};
