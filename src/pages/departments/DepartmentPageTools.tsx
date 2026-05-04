import { useState, type CSSProperties, type ReactNode } from 'react';
import { workers } from '../../data/workers';
import { seedCoverage } from '../../data/coverage';
import { productionOrders } from '../../data/productionOrders';
import { COVERAGE_STORAGE_KEY } from '../../logic/coverage';
import { getCrewGuidanceForDepartment } from '../../logic/crewGuidance';
import { getSkillGapAlerts } from '../../logic/skillGapAlerts';
import { departmentOperatingProfiles } from '../../data/departmentOperatingProfiles';
import type { Department } from '../../types/machine';
import type { CoveragePerson } from '../../types/coverage';
import type { PlantAsset, PlantAssetKind } from '../../types/plantAsset';
import type { ProductionOrder } from '../../types/productionOrder';
import type { AppTab } from '../../types/app';

export type DepartmentPageProps = {
  theme?: 'dark' | 'light';
  onGoToTab?: (tab: AppTab) => void;
};

export function getDepartmentAssets(assets: PlantAsset[], department: Department) {
  return assets.filter((asset) => asset.ownerDepartment === department);
}

export function getDepartmentOrders(orders: ProductionOrder[], department: Department) {
  return orders.filter((order) => {
    const requiredDepartments = Array.isArray(order.requiredDepartments)
      ? order.requiredDepartments
      : [];
    return (
      order.currentDepartment === department ||
      requiredDepartments.includes(department)
    );
  });
}

export function getBlockedOrders(orders: ProductionOrder[]) {
  return orders.filter((order) => String(order.status).toLowerCase() === 'blocked');
}

export function kindLabel(kind: PlantAssetKind) {
  const labels: Record<PlantAssetKind, string> = {
    DEPARTMENT: 'Department / Gate',
    MACHINE: 'Machine',
    WORK_CELL: 'Work Cell',
    PROCESS_ZONE: 'Process Zone',
    BUILDING: 'Building',
    MANUAL_EQUIPMENT: 'Manual Equipment',
    PERSONNEL_GROUP: 'Personnel Group',
  };
  return labels[kind];
}

export function statusLabel(value: string | undefined) {
  return String(value ?? 'UNKNOWN').replace(/_/g, ' ');
}

export function PageShell({
  title,
  subtitle,
  children,
  theme = 'dark',
}: DepartmentPageProps & {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const profile = getPageDepartmentProfile(title);
  const summary = profile?.operatingSummary ?? subtitle;
  const localDetail = profile && subtitle !== profile.operatingSummary ? subtitle : null;

  return (
    <div style={shellStyle()}>
      <div style={heroStyle(theme)}>
        <div style={eyebrowStyle(theme)}>Department View</div>
        <h2 style={titleStyle(theme)}>{title}</h2>
        {profile ? (
          <div style={profileChipRowStyle}>
            <span style={profileChipStyle(theme)}>{profile.resourceLabel}</span>
            <span style={truthChipStyle(profile.truthStrength, theme)}>Truth: {profile.truthStrength}</span>
          </div>
        ) : null}
        <p style={subtitleStyle(theme)}>{summary}</p>
        {localDetail ? <p style={detailSubtitleStyle(theme)}>{localDetail}</p> : null}
      </div>
      {children}
    </div>
  );
}

function getPageDepartmentProfile(title: string) {
  return Object.values(departmentOperatingProfiles).find((profile) => profile.department === title) ?? null;
}

export function Section({
  title,
  children,
  theme = 'dark',
}: DepartmentPageProps & { title: string; children: ReactNode }) {
  return (
    <section style={sectionStyle(theme)}>
      <h3 style={sectionTitleStyle(theme)}>{title}</h3>
      {children}
    </section>
  );
}

export function AssetCard({
  asset,
  theme = 'dark',
}: DepartmentPageProps & { asset: PlantAsset }) {
  return (
    <div style={cardStyle(theme)}>
      <div style={cardHeaderStyle}>
        <strong style={cardTitleStyle(theme)}>{asset.name}</strong>
        <span style={pillStyle(asset.status, theme)}>{asset.status}</span>
      </div>
      <div style={metaStyle(theme)}>
        {kindLabel(asset.kind)} • {asset.physicalArea}
      </div>
      <p style={bodyStyle(theme)}>{asset.primaryFunction}</p>
      {asset.riskFlags && asset.riskFlags.length > 0 && (
        <div style={chipRowStyle}>
          {asset.riskFlags.map((risk) => (
            <span key={risk} style={chipStyle(theme)}>
              {risk}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderCard({
  order,
  theme = 'dark',
}: DepartmentPageProps & { order: ProductionOrder }) {
  const isBlocked = (order.blockers ?? []).length > 0 || String(order.flowStatus).toLowerCase() === 'blocked';
  const isRunnable = String(order.flowStatus).toLowerCase() === 'runnable';
  const priority = String(order.priority ?? 'normal').toLowerCase();
  const priorityColor = priority === 'critical' ? '#dc2626' : priority === 'hot' ? '#f59e0b' : '#64748b';
  const flowColor = isBlocked ? '#dc2626' : isRunnable ? '#10b981' : '#64748b';
  const borderColor = isBlocked ? '#dc2626' : isRunnable ? '#10b981' : '#334155';

  return (
    <div style={{ ...cardStyle(theme), borderLeft: `4px solid ${borderColor}` }}>
      <div style={cardHeaderStyle}>
        <strong style={cardTitleStyle(theme)}>#{order.orderNumber} — {order.productFamily}</strong>
        <span style={priorityPillStyle(priorityColor)}>{priority.toUpperCase()}</span>
      </div>
      <div style={metaStyle(theme)}>
        {order.currentDepartment}{order.nextDepartment ? ` → ${order.nextDepartment}` : ''}
      </div>
      <div style={{ ...chipRowStyle, marginTop: 8 }}>
        <span style={flowChipStyle(flowColor)}>
          {isBlocked ? 'BLOCKED' : isRunnable ? 'RUNNABLE' : statusLabel(order.status)}
        </span>
        {order.materialStatus && order.materialStatus !== 'UNKNOWN' && (
          <span style={chipStyle(theme)}>MAT: {statusLabel(order.materialStatus)}</span>
        )}
        {order.projectedShipDate && (
          <span style={chipStyle(theme)}>SHIP {order.projectedShipDate}</span>
        )}
      </div>
      {(order.blockers ?? []).map((blocker, i) => (
        <div key={i} style={blockerRowStyle(theme)}>
          ⚠ {blocker.type.toUpperCase()}: {blocker.message}
        </div>
      ))}
    </div>
  );
}

export function CrewGuidancePanel({
  department,
  orders,
  theme = 'dark',
}: DepartmentPageProps & { department: Department; orders: ProductionOrder[] }) {
  const recommendations = getCrewGuidanceForDepartment(department, {
    orders,
    workers,
  });

  return (
    <CardGrid>
      {recommendations.map((recommendation) => {
        const tone = getCrewTone(recommendation.level);
        const requiredSkills = recommendation.requiredSkills ?? [];
        const orderNumbers = recommendation.orderNumbers ?? [];
        const workerIds = recommendation.workerIds ?? [];

        return (
          <div key={recommendation.id} style={crewCardStyle(tone, theme)}>
            <div style={cardHeaderStyle}>
              <strong style={cardTitleStyle(theme)}>{recommendation.title}</strong>
              <span style={crewToneStyle(tone, theme)}>{tone}</span>
            </div>

            <p style={bodyStyle(theme)}>{recommendation.message}</p>
            <p style={bodyStyle(theme)}>{recommendation.action}</p>

            <div style={chipRowStyle}>
              {requiredSkills.map((skill) => (
                <span key={skill} style={chipStyle(theme)}>
                  Skill: {statusLabel(skill)}
                </span>
              ))}

              {orderNumbers.length > 0 ? (
                orderNumbers.map((orderNumber) => (
                  <span key={orderNumber} style={chipStyle(theme)}>
                    Order: {orderNumber}
                  </span>
                ))
              ) : (
                <span style={chipStyle(theme)}>No target order</span>
              )}
            </div>

            <div style={workerListStyle(theme)}>
              <strong>Matched co-workers:</strong>{' '}
              {workerIds.length > 0
                ? workerIds
                    .map(
                      (workerId) =>
                        workers.find((worker) => worker.id === workerId)?.name ??
                        workerId,
                    )
                    .join(', ')
                : 'None shown available'}
            </div>
          </div>
        );
      })}
    </CardGrid>
  );
}

function getCrewTone(level: 'info' | 'warning' | 'critical'): 'GO' | 'WATCH' | 'HOLD' {
  if (level === 'critical') return 'HOLD';
  if (level === 'warning') return 'WATCH';
  return 'GO';
}

export function LiveCrewSection({
  department,
  theme = 'dark',
  onGoToTab,
}: DepartmentPageProps & { department: Department }) {
  const [people] = useState<CoveragePerson[]>(() => {
    try {
      const stored = localStorage.getItem(COVERAGE_STORAGE_KEY);
      if (!stored) return seedCoverage;
      const parsed = JSON.parse(stored) as CoveragePerson[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedCoverage;
    } catch {
      return seedCoverage;
    }
  });

  const crew = people.filter((p) => p.department === department && p.status !== 'OFFLINE');
  const assigned = crew.filter((p) => p.status === 'ASSIGNED');
  const available = crew.filter((p) => p.status === 'AVAILABLE');
  const onBreak = crew.filter((p) => p.status === 'BREAK');
  const skillGaps = getSkillGapAlerts(department, productionOrders, people);

  if (crew.length === 0) return <div style={emptyStyle(theme)}>No crew signed in for this department.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {skillGaps.length > 0 && (
        <div style={skillGapBannerStyle(theme)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <strong style={{ color: '#f59e0b', fontSize: 11, letterSpacing: '0.8px' }}>SKILL GAP ALERT</strong>
            {onGoToTab && (
              <button
                type="button"
                onClick={() => onGoToTab('coverage')}
                style={crewGapActionButtonStyle}
              >
                → OPEN COVERAGE
              </button>
            )}
          </div>
          {skillGaps.map((gap) => (
            <div key={gap.skill} style={{ fontSize: 12, color: theme === 'dark' ? '#fcd34d' : '#92400e', marginTop: 2 }}>
              No available crew for <strong>{gap.skill.replace(/_/g, ' ')}</strong> — needed by order{gap.orderNumbers.length > 1 ? 's' : ''} {gap.orderNumbers.join(', ')}
            </div>
          ))}
        </div>
      )}
      <div style={crewSummaryRowStyle}>
        <CrewStat label="ASSIGNED" count={assigned.length} color="#f59e0b" theme={theme} />
        <CrewStat label="AVAILABLE" count={available.length} color="#10b981" theme={theme} />
        <CrewStat label="ON BREAK" count={onBreak.length} color="#8b5cf6" theme={theme} />
      </div>
      <div style={gridStyle}>
        {crew.map((person) => {
          const dotColor = person.status === 'AVAILABLE' ? '#10b981' : person.status === 'ASSIGNED' ? '#f59e0b' : '#8b5cf6';
          return (
            <div key={person.id} style={{ ...cardStyle(theme), borderLeft: `3px solid ${dotColor}`, padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div>
                  <div style={cardTitleStyle(theme)}>{person.name}</div>
                  <div style={metaStyle(theme)}>{person.role}</div>
                  <div style={metaStyle(theme)}>{person.station}</div>
                </div>
                <span style={pillStyle(person.status, theme)}>{person.status}</span>
              </div>
              {person.assignedTo && (
                <div style={{ ...bodyStyle(theme), marginTop: 6, fontStyle: 'italic' }}>→ {person.assignedTo}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CrewStat({ label, count, color, theme }: { label: string; count: number; color: string; theme: 'dark' | 'light' }) {
  return (
    <div style={{ padding: '8px 14px', borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}44`, borderLeft: `3px solid ${color}` }}>
      <div style={{ color, fontSize: 20, fontWeight: 900 }}>{count}</div>
      <div style={{ color: '#64748b', fontSize: 10, fontWeight: 900, letterSpacing: '0.8px' }}>{label}</div>
    </div>
  );
}

export function EmptyState({
  text,
  theme = 'dark',
}: DepartmentPageProps & { text: string }) {
  return <div style={emptyStyle(theme)}>{text}</div>;
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <div style={gridStyle}>{children}</div>;
}

function shellStyle(): CSSProperties {
  return { display: 'flex', flexDirection: 'column', gap: 18 };
}

function heroStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    background:
      theme === 'dark'
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : '#ffffff',
    borderLeft: '4px solid #f97316',
    borderRadius: 6,
    padding: 18,
    boxShadow:
      theme === 'dark'
        ? '0 8px 24px rgba(0,0,0,0.25)'
        : '0 4px 14px rgba(15,23,42,0.08)',
  };
}

function eyebrowStyle(theme: 'dark' | 'light'): CSSProperties {
  void theme;
  return {
    color: '#f97316',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  };
}

function titleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: '6px 0',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    fontSize: 24,
    letterSpacing: '0.5px',
  };
}

const profileChipRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  margin: '4px 0 8px',
};

function profileChipStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    border: theme === 'dark' ? '1px solid #475569' : '1px solid #cbd5e1',
    background: theme === 'dark' ? 'rgba(15,23,42,0.7)' : '#f8fafc',
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
  };
}

function truthChipStyle(truthStrength: string, theme: 'dark' | 'light'): CSSProperties {
  const color = truthStrength === 'STRONG' ? '#10b981' : truthStrength === 'PARTIAL' ? '#38bdf8' : '#64748b';
  return {
    border: `1px solid ${color}66`,
    background: theme === 'dark' ? `${color}18` : '#ffffff',
    color,
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.6px',
    textTransform: 'uppercase',
  };
}

function subtitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: 0,
    color: theme === 'dark' ? '#cbd5e1' : '#334155',
    lineHeight: 1.5,
    fontSize: 14,
    fontWeight: 750,
  };
}

function detailSubtitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: '8px 0 0',
    color: theme === 'dark' ? '#94a3b8' : '#475569',
    lineHeight: 1.45,
    fontSize: 13,
  };
}

function sectionStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    borderRadius: 6,
    padding: 14,
  };
}

function sectionTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: '0 0 12px 0',
    color: theme === 'dark' ? '#f8fafc' : '#0f172a',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  };
}

function cardStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    borderRadius: 6,
    padding: 12,
  };
}

const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  alignItems: 'flex-start',
};

function cardTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 14 };
}

function metaStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: 12,
    marginTop: 6,
    fontWeight: 700,
  };
}

function bodyStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#cbd5e1' : '#334155',
    fontSize: 13,
    lineHeight: 1.45,
  };
}

function pillStyle(status: string, theme: 'dark' | 'light'): CSSProperties {
  const normalized = String(status ?? '').toUpperCase();
  const danger = ['DOWN', 'BLOCKED', 'FAILED', 'HOLD'].includes(normalized);
  const warn = ['WATCH', 'UNKNOWN', 'PARTIAL', 'PENDING', 'WAITING'].includes(
    normalized,
  );
  const color = danger ? '#ef4444' : warn ? '#f59e0b' : '#10b981';
  return {
    border: `1px solid ${color}`,
    color,
    background: theme === 'dark' ? 'rgba(15,23,42,0.7)' : '#ffffff',
    padding: '4px 7px',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 900,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };
}

const chipRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 10,
};

function chipStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    padding: '5px 7px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 800,
  };
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: 10,
};

function crewCardStyle(
  tone: 'GO' | 'WATCH' | 'HOLD',
  theme: 'dark' | 'light',
): CSSProperties {
  const color = tone === 'GO' ? '#10b981' : tone === 'HOLD' ? '#ef4444' : '#f59e0b';
  return {
    ...cardStyle(theme),
    borderLeft: `4px solid ${color}`,
  };
}

function crewToneStyle(
  tone: 'GO' | 'WATCH' | 'HOLD',
  theme: 'dark' | 'light',
): CSSProperties {
  const color = tone === 'GO' ? '#10b981' : tone === 'HOLD' ? '#ef4444' : '#f59e0b';
  return {
    border: `1px solid ${color}`,
    color,
    background: theme === 'dark' ? 'rgba(15,23,42,0.7)' : '#ffffff',
    padding: '4px 7px',
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 900,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };
}

function workerListStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: 12,
    lineHeight: 1.45,
    marginTop: 10,
  };
}

function emptyStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: 13,
    padding: 12,
    border: theme === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1',
    borderRadius: 6,
  };
}

function priorityPillStyle(color: string): CSSProperties {
  return { border: `1px solid ${color}`, color, background: `${color}1f`, padding: '4px 7px', borderRadius: 999, fontSize: 10, fontWeight: 900, whiteSpace: 'nowrap' };
}

function flowChipStyle(color: string): CSSProperties {
  return { border: `1px solid ${color}`, color, background: `${color}1f`, padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 900 };
}

function blockerRowStyle(theme: 'dark' | 'light'): CSSProperties {
  return { marginTop: 8, padding: '7px 10px', borderRadius: 4, background: theme === 'dark' ? 'rgba(220,38,38,0.12)' : '#fef2f2', border: '1px solid rgba(220,38,38,0.3)', color: theme === 'dark' ? '#fca5a5' : '#991b1b', fontSize: 12, fontWeight: 800, lineHeight: 1.4, wordBreak: 'break-word' };
}

const crewSummaryRowStyle: CSSProperties = { display: 'flex', gap: 10, flexWrap: 'wrap' };

function skillGapBannerStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 6,
    border: '1px solid rgba(245,158,11,0.45)',
    borderLeft: '4px solid #f59e0b',
    background: theme === 'dark' ? 'rgba(245,158,11,0.08)' : '#fffbeb',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };
}

const crewGapActionButtonStyle: CSSProperties = {
  padding: '4px 10px',
  borderRadius: 4,
  border: '1px solid #f59e0b',
  background: 'rgba(245,158,11,0.15)',
  color: '#f59e0b',
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '0.5px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
