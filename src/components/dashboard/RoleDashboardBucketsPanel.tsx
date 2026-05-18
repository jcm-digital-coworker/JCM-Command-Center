import type { CSSProperties } from 'react';
import type { AppTab, RoleView } from '../../types/app';
import type { DashboardTheme } from './dashboardStyles';
import type { RoleDashboardBucket } from '../../logic/roleDashboardBuckets';

type RoleDashboardBucketsPanelProps = {
  roleView: RoleView;
  buckets: RoleDashboardBucket[];
  theme?: DashboardTheme;
  onNavigate: (tab: AppTab) => void;
};

export default function RoleDashboardBucketsPanel({
  roleView,
  buckets,
  theme = 'dark',
  onNavigate,
}: RoleDashboardBucketsPanelProps) {
  const copy = getRoleCopy(roleView);

  return (
    <section style={panelStyle(theme)}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>ROLE TRIAGE BUCKETS</div>
          <h3 style={titleStyle(theme)}>{copy.title}</h3>
          <p style={subtitleStyle(theme)}>{copy.subtitle}</p>
        </div>
        <span style={rolePillStyle(theme)}>{String(roleView).toUpperCase()}</span>
      </div>

      <div style={gridStyle}>
        {buckets.map((bucket) => (
          <article key={bucket.id} style={cardStyle(theme, bucket.urgency)}>
            <div style={cardHeaderStyle}>
              <div>
                <strong style={cardTitleStyle(theme)}>{bucket.title}</strong>
                <p style={intentStyle(theme)}>{bucket.intent}</p>
              </div>
              <span style={countPillStyle(bucket.urgency)}>{bucket.count}</span>
            </div>

            <div style={proofStyle(theme)}>{bucket.proof}</div>

            {bucket.sampleOrders.length > 0 ? (
              <div style={sampleStyle(theme)}>
                <span style={sampleLabelStyle(theme)}>Sample orders</span>
                {bucket.sampleOrders.map((orderNumber) => (
                  <span key={orderNumber} style={samplePillStyle(theme)}>{orderNumber}</span>
                ))}
              </div>
            ) : (
              <div style={emptySampleStyle(theme)}>No current orders in this bucket.</div>
            )}

            <button type="button" style={actionButtonStyle(bucket.urgency)} onClick={() => onNavigate(bucket.targetTab)}>
              {bucket.actionLabel.toUpperCase()}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function getRoleCopy(roleView: RoleView) {
  const normalized = String(roleView).toLowerCase();
  if (normalized.includes('production') || normalized.includes('operator')) {
    return {
      title: 'Operator first-read',
      subtitle: 'Do now, blocked, waiting, and ask-lead work separated before the page gets noisy.',
    };
  }
  if (normalized.includes('lead') || normalized.includes('supervisor')) {
    return {
      title: 'Lead first-read',
      subtitle: 'Separate what we own, what waits on us, and what we are waiting on.',
    };
  }
  if (normalized.includes('support') || normalized.includes('maintenance')) {
    return {
      title: 'Support first-read',
      subtitle: 'Requests, missing information, and aging work where support truth matters first.',
    };
  }
  return {
    title: 'Management first-read',
    subtitle: 'Bottlenecks, aging holds, due-soon risk, and decisions before the long plant view.',
  };
}

function panelStyle(theme: DashboardTheme): CSSProperties {
  return {
    marginBottom: 16,
    padding: 14,
    borderRadius: 8,
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    background: theme === 'dark' ? 'rgba(15, 23, 42, 0.72)' : '#ffffff',
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
  color: '#38bdf8',
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
    border: '1px solid #38bdf8',
    background: theme === 'dark' ? 'rgba(56,189,248,0.12)' : '#f0f9ff',
    color: '#38bdf8',
    padding: '5px 8px',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 900,
    whiteSpace: 'nowrap',
  };
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 10,
};

function cardStyle(theme: DashboardTheme, urgency: RoleDashboardBucket['urgency']): CSSProperties {
  const color = getUrgencyColor(urgency);
  return {
    padding: 12,
    borderRadius: 7,
    border: `1px solid ${color}55`,
    borderLeft: `4px solid ${color}`,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    minHeight: 190,
    display: 'flex',
    flexDirection: 'column',
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

function intentStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#cbd5e1' : '#334155',
    fontSize: 12,
    fontWeight: 750,
    lineHeight: 1.35,
    margin: '6px 0 0',
  };
}

function proofStyle(theme: DashboardTheme): CSSProperties {
  return {
    marginTop: 10,
    padding: 8,
    borderRadius: 5,
    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.72)' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    color: theme === 'dark' ? '#94a3b8' : '#475569',
    fontSize: 11,
    lineHeight: 1.35,
    fontWeight: 750,
  };
}

function sampleStyle(theme: DashboardTheme): CSSProperties {
  return {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
  };
}

function sampleLabelStyle(theme: DashboardTheme): CSSProperties {
  return {
    width: '100%',
    color: theme === 'dark' ? '#64748b' : '#64748b',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.7px',
    textTransform: 'uppercase',
  };
}

function samplePillStyle(theme: DashboardTheme): CSSProperties {
  return {
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    background: theme === 'dark' ? '#111827' : '#ffffff',
    color: theme === 'dark' ? '#e2e8f0' : '#334155',
    borderRadius: 999,
    padding: '4px 7px',
    fontSize: 10,
    fontWeight: 900,
  };
}

function emptySampleStyle(theme: DashboardTheme): CSSProperties {
  return {
    marginTop: 10,
    color: theme === 'dark' ? '#64748b' : '#64748b',
    fontSize: 11,
    fontWeight: 750,
  };
}

function countPillStyle(urgency: RoleDashboardBucket['urgency']): CSSProperties {
  const color = getUrgencyColor(urgency);
  return {
    minWidth: 34,
    textAlign: 'center',
    border: `1px solid ${color}`,
    color,
    background: `${color}1f`,
    borderRadius: 999,
    padding: '5px 8px',
    fontSize: 13,
    fontWeight: 900,
  };
}

function actionButtonStyle(urgency: RoleDashboardBucket['urgency']): CSSProperties {
  const color = getUrgencyColor(urgency);
  return {
    marginTop: 'auto',
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

function getUrgencyColor(urgency: RoleDashboardBucket['urgency']): string {
  if (urgency === 'red') return '#ef4444';
  if (urgency === 'orange') return '#f97316';
  if (urgency === 'blue') return '#38bdf8';
  if (urgency === 'green') return '#10b981';
  return '#64748b';
}
