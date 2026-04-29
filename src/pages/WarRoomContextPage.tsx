import type { CSSProperties } from 'react';
import {
  warRoomContextBlocks,
  warRoomContextSections,
} from '../data/warRoomContext';
import { darkTheme, lightTheme, type ThemeColors } from '../theme/theme';

type WarRoomContextPageProps = {
  theme: 'dark' | 'light';
};

export default function WarRoomContextPage({
  theme,
}: WarRoomContextPageProps) {
  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <main style={getPageStyle(colors)}>
      <section style={getHeaderStyle(colors)}>
        <p style={getEyebrowStyle(colors)}>Command Continuity</p>
        <h1 style={getTitleStyle(colors)}>War Room Context</h1>
        <p style={getSubtitleStyle(colors)}>
          Copy-ready mission context for moving cleanly between War Room and
          Code Tent without changing doctrine or duplicating project structure.
        </p>
      </section>

      <section style={gridStyle}>
        {warRoomContextSections.map((section) => (
          <article key={section.title} style={getCardStyle(colors)}>
            <h2 style={getCardTitleStyle(colors)}>{section.title}</h2>
            <ul style={listStyle}>
              {section.items.map((item) => (
                <li key={item} style={getListItemStyle(colors)}>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section style={blockStackStyle}>
        {warRoomContextBlocks.map((block) => (
          <article key={block.id} style={getCardStyle(colors)}>
            <h2 style={getCardTitleStyle(colors)}>{block.title}</h2>
            <pre style={getPreStyle(colors)}>{block.body}</pre>
          </article>
        ))}
      </section>
    </main>
  );
}

function getPageStyle(colors: ThemeColors): CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    color: colors.text,
  };
}

function getHeaderStyle(colors: ThemeColors): CSSProperties {
  return {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderLeft: `4px solid ${colors.accent}`,
    borderRadius: 8,
    padding: 18,
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
  };
}

function getEyebrowStyle(colors: ThemeColors): CSSProperties {
  return {
    margin: '0 0 8px',
    color: colors.accent,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
  };
}

function getTitleStyle(colors: ThemeColors): CSSProperties {
  return {
    margin: 0,
    color: colors.text,
    fontSize: 28,
    lineHeight: 1.1,
    fontWeight: 900,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  };
}

function getSubtitleStyle(colors: ThemeColors): CSSProperties {
  return {
    margin: '10px 0 0',
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 1.5,
    maxWidth: 820,
  };
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 14,
};

function getCardStyle(colors: ThemeColors): CSSProperties {
  return {
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
  };
}

function getCardTitleStyle(colors: ThemeColors): CSSProperties {
  return {
    margin: '0 0 12px',
    color: colors.text,
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
  };
}

const listStyle: CSSProperties = {
  margin: 0,
  paddingLeft: 18,
};

function getListItemStyle(colors: ThemeColors): CSSProperties {
  return {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 1.45,
    marginBottom: 8,
  };
}

const blockStackStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

function getPreStyle(colors: ThemeColors): CSSProperties {
  return {
    margin: 0,
    padding: 14,
    background: colors.surfaceAlt,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 1.45,
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  };
}
