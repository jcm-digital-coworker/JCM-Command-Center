import type { CSSProperties } from 'react';
import type { WorkCenter } from '../../types/plant';
import type { DashboardTheme } from './dashboardStyles';

type DashboardWorkCenterCardProps = {
  workCenter: WorkCenter;
  theme: DashboardTheme;
  onOpen: (workCenter: WorkCenter) => void;
};

type TruthStrength = 'STRONG' | 'PARTIAL' | 'PLACEHOLDER';

export default function DashboardWorkCenterCard({
  workCenter,
  theme,
  onOpen,
}: DashboardWorkCenterCardProps) {
  const truthStrength = getDepartmentTruthStrength(workCenter.department);
  const focusItems = workCenter.dailyFocus.slice(0, 2);
  const nextModule = workCenter.nextBuildModules[0] ?? 'Needs module plan';

  return (
    <button
      type="button"
      style={getWorkCenterCardStyle(theme, workCenter.status)}
      onClick={() => onOpen(workCenter)}
    >
      <div style={workCenterContentStyle}>
        <div style={{ textAlign: 'left', minWidth: 0 }}>
          <div style={getWorkCenterTitleStyle(theme)}>{workCenter.name}</div>
          <div style={chipRowStyle}>
            <span style={getResourceTypeStyle(workCenter.department)}>
              {getDepartmentResourceLabel(workCenter.department)}
            </span>
            <span style={getTruthBadgeStyle(truthStrength)}>
              TRUTH: {truthStrength}
            </span>
          </div>
        </div>
        <span style={getWorkCenterStatusBadge(workCenter.status)}>
          {workCenter.status.replace('_', ' ')}
        </span>
      </div>

      <div style={sectionBlockStyle}>
        <div style={fieldLabelStyle}>Open for</div>
        <div style={getBodyTextStyle(theme)}>{getOpenForSignal(workCenter)}</div>
      </div>

      <div style={sectionBlockStyle}>
        <div style={fieldLabelStyle}>Owns</div>
        <div style={getBodyTextStyle(theme)}>{summarizePrimaryFunction(workCenter.primaryFunction)}</div>
      </div>

      {focusItems.length > 0 ? (
        <div style={focusGridStyle}>
          {focusItems.map((focus) => (
            <div key={focus} style={getFocusPillStyle(theme)}>• {focus}</div>
          ))}
        </div>
      ) : null}

      <div style={cardFooterStyle}>
        <div style={footerColumnStyle}>
          <div style={fieldLabelStyle}>Coverage</div>
          <div style={getSmallTextStyle(theme)}>{formatCoverage(workCenter.coverage)}</div>
        </div>
        <div style={footerColumnStyle}>
          <div style={fieldLabelStyle}>Next module</div>
          <div style={getSmallTextStyle(theme)}>{nextModule}</div>
        </div>
      </div>
    </button>
  );
}

function getDepartmentResourceLabel(department: string) {
  const labels: Record<string, string> = {
    Sales: 'Order release / customer signal',
    Engineering: 'Blueprint / routing gate',
    Receiving: 'Material intake / staging',
    'Machine Shop': 'Size-specific CNC / machining flow',
    'Material Handling': 'Cut / form / roll / press flow',
    Fab: 'Weld lanes / product fabrication',
    Coating: 'Prep / paint / plastic dip / passivation',
    Assembly: 'Product-lane assembly / kit readiness',
    'Saddles Dept': 'Service saddle build lane',
    'Patch Clamps': 'Patch clamp product lane',
    Clamps: 'Clamp product lane',
    QA: 'Validation / hold layer',
    Shipping: 'Outbound lanes / ship readiness',
    Maintenance: 'Reliability / repair flow',
    Office: 'Admin / purchasing / planning',
  };
  return labels[department] ?? 'Work center';
}

function getOpenForSignal(workCenter: WorkCenter) {
  const signals: Record<string, string> = {
    Sales: 'order release readiness, hot-order changes, and customer signal handoff.',
    Engineering: 'blueprint blockers, routing release, and engineered-order review.',
    Receiving: 'material arrival, staging truth, and downstream delivery needs.',
    'Machine Shop': 'machine-capability fit, setup-sensitive work, and tooling or maintenance blockers.',
    'Material Handling': 'cut lists, burn/roll/press bottlenecks, and downstream material shortages.',
    Fab: 'weld queue pressure, fixture needs, lane handoff, and quality holds.',
    Coating: 'finish blockers, prep status, process-zone readiness, and passivation/coating questions.',
    Assembly: 'missing components, build queue readiness, and product-lane handoffs.',
    'Saddles Dept': 'service saddle batch progress, LV4500 work, gauge checks, and saddle-specific flow.',
    'Patch Clamps': 'patch clamp queue, material readiness, and unresolved product-lane setup.',
    Clamps: 'clamp queue, material readiness, and product-lane blockers.',
    QA: 'quality holds, inspection status, compliance checks, and release blockers.',
    Shipping: 'hot shipments, staging, packing status, and dock readiness.',
    Maintenance: 'open work orders, downtime impact, assignments, and repair closeout.',
    Office: 'purchasing requests, approvals, scheduling visibility, and plant communication.',
  };
  return signals[workCenter.department] ?? workCenter.stationTabletDefault;
}

function getDepartmentTruthStrength(department: string): TruthStrength {
  if (['Machine Shop', 'Material Handling', 'Coating', 'Saddles Dept', 'QA', 'Maintenance'].includes(department)) return 'STRONG';
  if (['Receiving', 'Fab', 'Assembly', 'Engineering', 'Shipping'].includes(department)) return 'PARTIAL';
  return 'PLACEHOLDER';
}

function summarizePrimaryFunction(primaryFunction: string) {
  const [firstSentence] = primaryFunction.split('.');
  return firstSentence.length > 110 ? `${firstSentence.slice(0, 107).trim()}...` : firstSentence;
}

function formatCoverage(coverage: WorkCenter['coverage']) {
  if (coverage.days || coverage.nights || coverage.total) {
    const pieces = [
      coverage.total ? `${coverage.total} total` : null,
      coverage.days ? `${coverage.days} day` : null,
      coverage.nights ? `${coverage.nights} night` : null,
    ].filter(Boolean);
    return pieces.join(' / ');
  }
  return coverage.note ?? 'Coverage not entered yet';
}

function getWorkCenterCardStyle(theme: DashboardTheme, status: WorkCenter['status']): CSSProperties {
  const color = getWorkCenterStatusColor(status);
  return {
    padding: 16,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    borderRadius: 6,
    cursor: 'pointer',
    border: `1px solid ${color}66`,
    borderLeft: `4px solid ${color}`,
    textAlign: 'left',
    display: 'grid',
    gap: 10,
    width: '100%',
  };
}

function getWorkCenterTitleStyle(theme: DashboardTheme): CSSProperties {
  return {
    fontWeight: 900,
    fontSize: 15,
    marginBottom: 7,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
  };
}

function getResourceTypeStyle(department: string): CSSProperties {
  const color = department === 'Machine Shop' ? '#64748b' : '#f97316';
  return {
    display: 'inline-block',
    padding: '3px 7px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 900,
    color,
    background: `${color}18`,
    border: `1px solid ${color}44`,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  };
}

function getTruthBadgeStyle(strength: TruthStrength): CSSProperties {
  const color = strength === 'STRONG' ? '#10b981' : strength === 'PARTIAL' ? '#38bdf8' : '#64748b';
  return {
    display: 'inline-block',
    padding: '3px 7px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 900,
    color,
    background: `${color}18`,
    border: `1px solid ${color}44`,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  };
}

function getWorkCenterStatusBadge(status: WorkCenter['status']): CSSProperties {
  const color = getWorkCenterStatusColor(status);
  return {
    padding: '4px 8px',
    borderRadius: 4,
    color,
    border: `1px solid ${color}66`,
    background: `${color}18`,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.6px',
    whiteSpace: 'nowrap',
  };
}

function getBodyTextStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    fontSize: 12,
    fontWeight: 750,
    lineHeight: 1.4,
  };
}

function getSmallTextStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: 11,
    fontWeight: 800,
    lineHeight: 1.35,
  };
}

function getFocusPillStyle(theme: DashboardTheme): CSSProperties {
  return {
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    background: theme === 'dark' ? 'rgba(30,41,59,0.78)' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    borderRadius: 4,
    padding: '6px 7px',
    fontSize: 11,
    fontWeight: 850,
    lineHeight: 1.25,
  };
}

function getWorkCenterStatusColor(status: WorkCenter['status']) {
  if (status === 'READY') return '#10b981';
  if (status === 'WATCH') return '#f59e0b';
  if (status === 'NEEDS_ATTENTION') return '#dc2626';
  return '#64748b';
}

const workCenterContentStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  alignItems: 'flex-start',
};

const chipRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
};

const sectionBlockStyle: CSSProperties = {
  display: 'grid',
  gap: 4,
};

const focusGridStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
};

const cardFooterStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
  gap: 8,
  paddingTop: 2,
};

const footerColumnStyle: CSSProperties = {
  display: 'grid',
  gap: 3,
};

const fieldLabelStyle: CSSProperties = {
  color: '#94a3b8',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
};
