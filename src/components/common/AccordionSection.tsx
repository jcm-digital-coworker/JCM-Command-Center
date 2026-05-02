import type { CSSProperties, ReactNode } from 'react';

export type AccordionTheme = 'dark' | 'light';

export type AccordionSectionProps = {
  title: string;
  count?: number;
  color: string;
  expanded: boolean;
  onToggle: () => void;
  onViewAll?: () => void;
  viewAllLabel?: string;
  collapsedHint?: string;
  children: ReactNode;
  theme?: AccordionTheme;
};

export default function AccordionSection({
  title,
  count,
  color,
  expanded,
  onToggle,
  onViewAll,
  viewAllLabel = 'VIEW ALL',
  collapsedHint = 'Tap section title to expand. Use View All to open the full page.',
  children,
  theme = 'dark',
}: AccordionSectionProps) {
  return (
    <section style={getSectionStyle(theme)}>
      <div style={sectionHeaderStyle}>
        <button type="button" style={getSectionToggleStyle(theme)} onClick={onToggle}>
          <h3 style={getSectionTitleStyle(color)}>
            {title}{typeof count === 'number' ? ` (${count})` : ''}
          </h3>
          <span style={chevronStyle}>{expanded ? 'v' : '>'}</span>
        </button>

        {onViewAll ? (
          <button type="button" onClick={onViewAll} style={viewAllButtonStyle}>
            {viewAllLabel}
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div style={sectionBodyStyle}>{children}</div>
      ) : (
        <div style={getCollapsedHintStyle(theme)}>{collapsedHint}</div>
      )}
    </section>
  );
}

function getSectionStyle(theme: AccordionTheme): CSSProperties {
  return {
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  };
}

const sectionHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};

function getSectionToggleStyle(theme: AccordionTheme): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    padding: 0,
    textAlign: 'left',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
  };
}

function getSectionTitleStyle(color: string): CSSProperties {
  return {
    margin: 0,
    fontSize: 16,
    color,
    letterSpacing: '0.5px',
    fontWeight: 800,
  };
}

const chevronStyle: CSSProperties = {
  fontSize: 16,
  color: '#475569',
};

const viewAllButtonStyle: CSSProperties = {
  background: 'transparent',
  border: '1px solid #475569',
  color: '#94a3b8',
  padding: '6px 10px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 800,
  cursor: 'pointer',
  letterSpacing: '0.5px',
};

const sectionBodyStyle: CSSProperties = {
  marginTop: 12,
};

function getCollapsedHintStyle(theme: AccordionTheme): CSSProperties {
  return {
    marginTop: 10,
    padding: '10px 12px',
    borderRadius: 4,
    background: theme === 'dark' ? 'rgba(15, 23, 42, 0.45)' : '#f8fafc',
    color: '#64748b',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.2px',
  };
}
