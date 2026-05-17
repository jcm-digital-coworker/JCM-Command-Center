import type { CSSProperties } from 'react';
import {
  progressChecklistItems,
  progressChecklistStatusLabel,
  type ProgressChecklistStatus,
} from '../../data/progressChecklist';
import { getThemeColors } from '../../theme/theme';

interface ProgressChecklistDrawerSectionProps {
  theme: 'dark' | 'light';
}

export default function ProgressChecklistDrawerSection({ theme }: ProgressChecklistDrawerSectionProps) {
  const colors = getThemeColors(theme);

  return (
    <section style={sectionStyle(theme)}>
      <div style={headerStyle(colors.textMuted)}>PROGRESS / VALIDATION</div>
      <p style={introStyle(colors.textMuted)}>
        Small reminder list for work that is planned, needs smoke testing, or is intentionally held for plant-truth validation.
      </p>
      <div style={listStyle}>
        {progressChecklistItems.map((item) => (
          <div key={item.id} style={itemStyle(theme)}>
            <div style={itemHeaderStyle}>
              <strong style={itemTitleStyle(colors.text)}>{item.title}</strong>
              <span style={statusStyle(item.status, theme)}>{progressChecklistStatusLabel(item.status)}</span>
            </div>
            <div style={detailStyle(colors.textMuted)}>{item.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function sectionStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    borderTop: `1px solid ${colors.border}`,
    padding: '16px 20px',
  };
}

function headerStyle(color: string): CSSProperties {
  return {
    color,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '1px',
    marginBottom: 8,
  };
}

function introStyle(color: string): CSSProperties {
  return {
    color,
    fontSize: 11,
    lineHeight: 1.35,
    margin: '0 0 10px',
  };
}

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

function itemStyle(theme: 'dark' | 'light'): CSSProperties {
  const colors = getThemeColors(theme);
  return {
    border: `1px solid ${colors.border}`,
    background: colors.cardAlt,
    borderRadius: 5,
    padding: 10,
  };
}

const itemHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
  alignItems: 'flex-start',
};

function itemTitleStyle(color: string): CSSProperties {
  return {
    color,
    fontSize: 12,
    lineHeight: 1.25,
  };
}

function detailStyle(color: string): CSSProperties {
  return {
    color,
    fontSize: 11,
    lineHeight: 1.35,
    marginTop: 6,
  };
}

function statusStyle(status: ProgressChecklistStatus, theme: 'dark' | 'light'): CSSProperties {
  const color =
    status === 'needs-smoke-test'
      ? '#f59e0b'
      : status === 'plant-truth-review'
        ? '#38bdf8'
        : status === 'cleanup'
          ? '#a78bfa'
          : '#10b981';

  return {
    border: `1px solid ${color}66`,
    background: theme === 'dark' ? `${color}18` : '#ffffff',
    color,
    borderRadius: 999,
    padding: '3px 6px',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.4px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };
}
