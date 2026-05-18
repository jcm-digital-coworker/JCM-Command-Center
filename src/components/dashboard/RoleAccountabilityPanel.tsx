import type { CSSProperties } from 'react';
import type { AppTab, RoleView } from '../../types/app';
import type { DashboardTheme } from './dashboardStyles';
import {
  getAudienceForRole,
  type AccountabilitySignal,
} from '../../logic/accountabilitySignals';

type RoleAccountabilityPanelProps = {
  roleView: RoleView;
  signals: AccountabilitySignal[];
  theme?: DashboardTheme;
  onNavigate: (tab: AppTab) => void;
};

export default function RoleAccountabilityPanel({
  roleView,
  signals,
  theme = 'dark',
  onNavigate,
}: RoleAccountabilityPanelProps) {
  const audience = getAudienceForRole(roleView);
  const copy = getAudienceCopy(audience);
  const topSignals = signals.slice(0, 4);

  return (
    <section style={panelStyle(theme)}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>ACCOUNTABILITY TRIAGE</div>
          <h3 style={titleStyle(theme)}>{copy.title}</h3>
          <p style={subtitleStyle(theme)}>{copy.subtitle}</p>
        </div>
        <span style={rolePillStyle(theme)}>{copy.roleLabel}</span>
      </div>

      {topSignals.length > 0 ? (
        <div style={gridStyle}>
          {topSignals.map((signal) => (
            <article key={signal.id} style={cardStyle(theme, signal.tone)}>
              <div style={cardHeaderStyle}>
                <div>
                  <strong style={cardTitleStyle(theme)}>{signal.title}</strong>
                  <div style={issueStyle(theme)}>{signal.issue}</div>
                </div>
                <span style={priorityPillStyle(signal.tone)}>{signal.priorityLabel}</span>
              </div>

              <div style={ownerGridStyle}>
                <Fact label="Blocked dept" value={signal.blockedDepartment} theme={theme} />
                <Fact label="Next owner" value={signal.owningDepartment} theme={theme} />
                <Fact label="Age" value={signal.ageLabel} theme={theme} />
              </div>

              <div style={neededStyle(theme)}>
                <span style={labelStyle(theme)}>Needed next</span>
                {signal.neededNext}
              </div>

              <div style={proofStyle(theme)}>{signal.proofLine}</div>

              <button type="button" style={actionButtonStyle(signal.tone)} onClick={() => onNavigate(signal.targetTab)}>
                {signal.safeAction.toUpperCase()}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div style={emptyStyle(theme)}>
          No role-specific accountability signal is leading right now. Check ready work or the detailed sections below.
        </div>
      )}
    </section>
  );
}

function Fact({ label, value, theme }: { label: string; value: string; theme: DashboardTheme }) {
  return (
    <div style={factStyle(theme)}>
      <div style={labelStyle(theme)}>{label}</div>
      <div style={factValueStyle(theme)}>{value}</div>
    </div>
  );
}

function getAudienceCopy(audience: ReturnType<typeof getAudienceForRole>) {
  if (audience === 'OPERATOR') {
    return {
      roleLabel: 'Operator view',
      title: 'What can I safely do next?',
      subtitle: 'Shows blocked work, who owns the next move, and what not to treat as cleared.',
    };
  }
  if (audience === 'DEPARTMENT_LEAD') {
    return {
      roleLabel: 'Lead view',
      title: 'What do we own, and who are we waiting on?',
      subtitle: 'Triage ownership, waiting points, aging work, and safe follow-up without blame fog.',
    };
  }
  if (audience === 'SUPPORT') {
    return {
      roleLabel: 'Support view',
      title: 'Who needs us right now?',
      subtitle: 'Requests and holds where support can acknowledge, inspect, stage, or clarify the next move.',
    };
  }
  return {
    roleLabel: 'Management view',
    title: 'Where is the plant stuck?',
    subtitle: 'Top ownership signals: blocked department, next owner, age, and the safest action path.',
  };
}

function panelStyle(theme: DashboardTheme): CSSProperties {
  return {
    marginBottom: 16,
    padding: 14,
    borderRadius: 8,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    borderLeft: '5px solid #f97316',
    background: theme === 'dark' ? 'rgba(15, 23, 42, 0.88)' : '#ffffff',
    boxShadow: theme === 'dark' ? '0 10px 24px rgba(0,0,0,0.22)' : '0 8px 18px rgba(15,23,42,0.08)',
  };
}

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
  marginBottom: 12,
};

const eyebrowStyle: CSSProperties = {
  color: '#f97316',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '1px',
  textTransform: 'uppercase',
};

function titleStyle(theme: DashboardTheme): CSSProperties {
  return {
    margin: '4px 0',
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    fontSize: 18,
  };
}

function subtitleStyle(theme: DashboardTheme): CSSProperties {
  return {
    margin: 0,
    color: theme === 'dark' ? '#94a3b8' : '#475569',
    fontSize: 12,
    lineHeight: 1.45,
    fontWeight: 750,
  };
}

function rolePillStyle(theme: DashboardTheme): CSSProperties {
  return {
    border: '1px solid #f97316',
    background: theme === 'dark' ? 'rgba(249,115,22,0.12)' : '#fff7ed',
    color: '#f97316',
    padding: '5px 8px',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 900,
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
  };
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 10,
};

function cardStyle(theme: DashboardTheme, tone: AccountabilitySignal['tone']): CSSProperties {
  const color = getToneColor(tone);
  return {
    padding: 12,
    borderRadius: 7,
    border: `1px solid ${color}66`,
    borderLeft: `4px solid ${color}`,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
  };
}

const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  alignItems: 'flex-start',
};

function cardTitleStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    fontSize: 13,
    lineHeight: 1.25,
  };
}

function issueStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#cbd5e1' : '#334155',
    fontSize: 12,
    fontWeight: 750,
    lineHeight: 1.35,
    marginTop: 5,
  };
}

const ownerGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 6,
  marginTop: 10,
};

function factStyle(theme: DashboardTheme): CSSProperties {
  return {
    padding: 7,
    borderRadius: 5,
    background: theme === 'dark' ? '#111827' : '#ffffff',
    border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
    minWidth: 0,
  };
}

function labelStyle(theme: DashboardTheme): CSSProperties {
  return {
    display: 'block',
    color: theme === 'dark' ? '#64748b' : '#64748b',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.7px',
    textTransform: 'uppercase',
    marginBottom: 3,
  };
}

function factValueStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    fontSize: 11,
    fontWeight: 900,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
}

function neededStyle(theme: DashboardTheme): CSSProperties {
  return {
    marginTop: 10,
    padding: 8,
    borderRadius: 5,
    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.72)' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    color: theme === 'dark' ? '#e2e8f0' : '#334155',
    fontSize: 12,
    lineHeight: 1.4,
    fontWeight: 750,
  };
}

function proofStyle(theme: DashboardTheme): CSSProperties {
  return {
    marginTop: 8,
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: 11,
    fontWeight: 750,
  };
}

function actionButtonStyle(tone: AccountabilitySignal['tone']): CSSProperties {
  const color = getToneColor(tone);
  return {
    marginTop: 10,
    padding: '7px 10px',
    borderRadius: 4,
    border: `1px solid ${color}`,
    background: `${color}1f`,
    color,
    cursor: 'pointer',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.7px',
    textTransform: 'uppercase',
  };
}

function priorityPillStyle(tone: AccountabilitySignal['tone']): CSSProperties {
  const color = getToneColor(tone);
  return {
    border: `1px solid ${color}`,
    color,
    background: `${color}1f`,
    borderRadius: 999,
    padding: '4px 7px',
    fontSize: 10,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  };
}

function emptyStyle(theme: DashboardTheme): CSSProperties {
  return {
    border: theme === 'dark' ? '1px dashed #475569' : '1px dashed #cbd5e1',
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    padding: 12,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 750,
  };
}

function getToneColor(tone: AccountabilitySignal['tone']): string {
  if (tone === 'red') return '#ef4444';
  if (tone === 'orange') return '#f97316';
  if (tone === 'blue') return '#38bdf8';
  return '#10b981';
}
