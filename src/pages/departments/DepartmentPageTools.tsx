import type { CSSProperties, ReactNode } from 'react';
import { workers } from '../../data/workers';
import { getCrewGuidanceForDepartment } from '../../logic/crewGuidance';
import type { Department } from '../../types/machine';
import type { PlantAsset, PlantAssetKind } from '../../types/plantAsset';
import type { ProductionOrder } from '../../types/productionOrder';

export type DepartmentPageProps = {
  theme?: 'dark' | 'light';
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
  return (
    <div style={shellStyle()}>
      <div style={heroStyle(theme)}>
        <div style={eyebrowStyle(theme)}>Department View</div>
        <h2 style={titleStyle(theme)}>{title}</h2>
        <p style={subtitleStyle(theme)}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
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
  return (
    <div style={cardStyle(theme)}>
      <div style={cardHeaderStyle}>
        <strong style={cardTitleStyle(theme)}>{order.orderNumber}</strong>
        <span style={pillStyle(order.status, theme)}>
          {statusLabel(order.status)}
        </span>
      </div>
      <div style={metaStyle(theme)}>
        {order.customer ?? 'Customer not set'} • {statusLabel(order.productFamily)}
      </div>
      <p style={bodyStyle(theme)}>
        Part {order.assemblyPartNumber ?? 'Not assigned'} • Qty{' '}
        {order.quantity ?? 'TBD'} • Ship {order.projectedShipDate ?? 'TBD'}
      </p>
      <div style={chipRowStyle}>
        <span style={chipStyle(theme)}>
          Material: {statusLabel(order.materialStatus ?? 'UNKNOWN')}
        </span>
        <span style={chipStyle(theme)}>
          QA: {statusLabel(order.qaStatus ?? 'UNKNOWN')}
        </span>
        {order.blockedReason && (
          <span style={chipStyle(theme)}>
            Block: {statusLabel(order.blockedReason)}
          </span>
        )}
      </div>
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

        return (
          <div key={recommendation.id} style={crewCardStyle(tone, theme)}>
            <div style={cardHeaderStyle}>
              <strong style={cardTitleStyle(theme)}>{recommendation.title}</strong>
              <span style={crewToneStyle(tone, theme)}>{tone}</span>
            </div>

            <p style={bodyStyle(theme)}>{recommendation.message}</p>
            <p style={bodyStyle(theme)}>{recommendation.action}</p>

            <div style={chipRowStyle}>
              {recommendation.requiredSkills.map((skill) => (
                <span key={skill} style={chipStyle(theme)}>
                  Skill: {statusLabel(skill)}
                </span>
              ))}

              {recommendation.orderNumbers.length > 0 ? (
                recommendation.orderNumbers.map((orderNumber) => (
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
              {recommendation.workerIds.length > 0
                ? recommendation.workerIds
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

function subtitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: 0,
    color: theme === 'dark' ? '#94a3b8' : '#475569',
    lineHeight: 1.5,
    fontSize: 14,
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
