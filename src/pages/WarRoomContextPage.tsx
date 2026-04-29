import type { CSSProperties } from 'react';
import { warRoomContext } from '../data/warRoomContext';

type ThemeName = 'dark' | 'light';

interface WarRoomContextPageProps {
  theme?: ThemeName;
}

export default function WarRoomContextPage({ theme = 'dark' }: WarRoomContextPageProps) {
  const colors = getColors(theme);

  return (
    <main style={{ ...pageStyle, background: colors.background, color: colors.text }}>
      <section style={{ ...heroStyle, background: colors.card, borderColor: colors.border }}>
        <div>
          <p style={{ ...eyebrowStyle, color: colors.muted }}>WAR ROOM CONTEXT</p>
          <h1 style={titleStyle}>Mission Memory</h1>
          <p style={{ ...subtitleStyle, color: colors.muted }}>
            Compressed operating context for clean handoffs, fresh chats, and controlled Code Tent work.
          </p>
        </div>
        <div style={{ ...statusPillStyle, borderColor: colors.accent, color: colors.accent }}>
          {warRoomContext.status.toUpperCase()}
        </div>
      </section>

      <section style={summaryGridStyle}>
        <SummaryCard label="Current Mission" value={warRoomContext.currentMission} theme={theme} />
        <SummaryCard label="Last Completed" value={warRoomContext.lastCompleted} theme={theme} />
        <SummaryCard label="Next Target" value={warRoomContext.nextTarget} theme={theme} />
        <SummaryCard label="Updated" value={warRoomContext.updatedAt} theme={theme} />
      </section>

      <section style={twoColumnStyle}>
        <ListCard title="Core Doctrine" items={warRoomContext.doctrine} theme={theme} />
        <ListCard title="Known Failure Modes" items={warRoomContext.knownFailureModes} theme={theme} danger />
      </section>

      <section style={sectionGridStyle}>
        {warRoomContext.systemState.map((section) => (
          <ListCard key={section.title} title={section.title} items={section.items} theme={theme} />
        ))}
      </section>

      <section style={twoColumnStyle}>
        <ListCard title="Update Triggers" items={warRoomContext.updateTriggers} theme={theme} />
        <ListCard title="Code Tent Handoff Rules" items={warRoomContext.codeTentHandoffRules} theme={theme} />
      </section>

      <ListCard title="Active Risks" items={warRoomContext.activeRisks} theme={theme} danger />
    </main>
  );
}

function SummaryCard({ label, value, theme }: { label: string; value: string; theme: ThemeName }) {
  const colors = getColors(theme);
  return (
    <article style={{ ...cardStyle, background: colors.card, borderColor: colors.border }}>
      <p style={{ ...eyebrowStyle, color: colors.muted }}>{label}</p>
      <p style={{ ...summaryValueStyle, color: colors.text }}>{value}</p>
    </article>
  );
}

function ListCard({ title, items, theme, danger = false }: { title: string; items: string[]; theme: ThemeName; danger?: boolean }) {
  const colors = getColors(theme);
  return (
    <article style={{ ...cardStyle, background: colors.card, borderColor: colors.border }}>
      <h2 style={{ ...cardTitleStyle, color: danger ? colors.danger : colors.text }}>{title}</h2>
      <ul style={listStyle}>
        {items.map((item) => (
          <li key={item} style={{ ...listItemStyle, color: colors.text }}>
            <span style={{ ...bulletStyle, background: danger ? colors.danger : colors.accent }} />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function getColors(theme: ThemeName) {
  return {
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    card: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: theme === 'dark' ? '#334155' : '#e2e8f0',
    text: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    muted: theme === 'dark' ? '#94a3b8' : '#64748b',
    accent: '#f97316',
    danger: '#ef4444',
  };
}

const pageStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
};

const heroStyle: CSSProperties = {
  border: '1px solid',
  borderLeft: '4px solid #f97316',
  borderRadius: 8,
  padding: 20,
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 16,
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '1px',
  textTransform: 'uppercase',
};

const titleStyle: CSSProperties = {
  margin: '6px 0 8px',
  fontSize: 28,
  lineHeight: 1.1,
  letterSpacing: '0.5px',
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.5,
  maxWidth: 720,
};

const statusPillStyle: CSSProperties = {
  border: '1px solid',
  borderRadius: 999,
  padding: '8px 12px',
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '1px',
  whiteSpace: 'nowrap',
};

const summaryGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 14,
};

const twoColumnStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 14,
};

const sectionGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 14,
};

const cardStyle: CSSProperties = {
  border: '1px solid',
  borderRadius: 8,
  padding: 16,
  boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
};

const summaryValueStyle: CSSProperties = {
  margin: '8px 0 0',
  fontSize: 14,
  fontWeight: 800,
  lineHeight: 1.45,
};

const cardTitleStyle: CSSProperties = {
  margin: '0 0 12px',
  fontSize: 15,
  fontWeight: 900,
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
};

const listStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const listItemStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
  fontSize: 13,
  lineHeight: 1.45,
  fontWeight: 650,
};

const bulletStyle: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: 999,
  marginTop: 6,
  flex: '0 0 auto',
};
