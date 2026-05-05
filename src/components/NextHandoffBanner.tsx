import { useEffect, useState, useMemo, type CSSProperties } from 'react';
import { productionOrders } from '../data/productionOrders';
import { getRuntimeProductionOrders, WORKFLOW_RUNTIME_UPDATED_EVENT } from '../logic/workflowRuntimeState';
import { getUrgencyScore } from '../logic/urgencyScore';
import { isBlockedProductionOrder, isClosedProductionStatus } from '../logic/orderStatusTruth';
import type { Department } from '../types/machine';
import type { ProductionOrder } from '../types/productionOrder';

const FALLBACK_DEPT_DOWNSTREAM: Partial<Record<Department, string>> = {
  'Sales': 'Engineering',
  'Engineering': 'Fab / Production',
  'Receiving': 'Dept destination',
  'Machine Shop': 'Fab',
  'Material Handling': 'Fab',
  'Fab': 'Coating',
  'Coating': 'Assembly',
  'Assembly': 'QA / Shipping',
  'Saddles Dept': 'QA / Shipping',
  'QA': 'Shipping',
  'Shipping': 'Customer',
};

import type { AppTab } from '../types/app';

type Props = {
  department: Department;
  theme: 'dark' | 'light';
  onGoToTab?: (tab: AppTab) => void;
};

export default function NextHandoffBanner({ department, theme, onGoToTab }: Props) {
  const [tick, setTick] = useState(0);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, bump);
    window.addEventListener('storage', bump);
    return () => { window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, bump); window.removeEventListener('storage', bump); };
  }, []);

  const topOrders: ProductionOrder[] = useMemo(() => {
    const runtime = getRuntimeProductionOrders(productionOrders);
    return runtime
      .filter((order) => order.currentDepartment === department && !isClosedProductionStatus(order.status))
      .sort((a, b) => getUrgencyScore(b) - getUrgencyScore(a))
      .slice(0, 3);
  }, [tick, department]);

  useEffect(() => {
    if (topOrders.length <= 1) { setIdx(0); return; }
    const id = setInterval(() => setIdx((i) => (i + 1) % topOrders.length), 6000);
    return () => clearInterval(id);
  }, [topOrders.length]);

  if (topOrders.length === 0) return null;

  const order = topOrders[idx % topOrders.length];
  const isBlocked = isBlockedProductionOrder(order);
  const downstream = order.nextDepartment ?? FALLBACK_DEPT_DOWNSTREAM[department] ?? 'Next dept';
  const daysToShip = order.projectedShipDate
    ? Math.ceil((new Date(order.projectedShipDate).getTime() - Date.now()) / 86400000)
    : null;

  const tone = isBlocked ? '#dc2626' : daysToShip !== null && daysToShip <= 1 ? '#f59e0b' : '#10b981';

  return (
    <div
      style={{ ...bannerStyle(theme, tone), cursor: onGoToTab ? 'pointer' : 'default' }}
      onClick={onGoToTab ? () => onGoToTab('orders') : undefined}
      role={onGoToTab ? 'button' : undefined}
      tabIndex={onGoToTab ? 0 : undefined}
    >
      <div style={leftStyle}>
        <span style={labelStyle}>NEXT HANDOFF → {String(downstream).toUpperCase()}</span>
        <span style={orderStyle(theme)}>#{order.orderNumber}</span>
        <span style={familyStyle(theme)}>{order.productFamily}</span>
        {order.customer && <span style={customerStyle}>{order.customer}</span>}
      </div>
      <div style={rightStyle}>
        {daysToShip !== null && (
          <span style={daysChip(daysToShip)}>
            {daysToShip < 0 ? `${Math.abs(daysToShip)}d LATE` : daysToShip === 0 ? 'SHIPS TODAY' : `${daysToShip}d TO SHIP`}
          </span>
        )}
        {isBlocked && (
          <span style={blockedChip}>⚠ BLOCKED</span>
        )}
        {topOrders.length > 1 && (
          <span style={cycleStyle}>{idx + 1}/{topOrders.length}</span>
        )}
      </div>
    </div>
  );
}

function bannerStyle(theme: 'dark' | 'light', tone: string): CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    borderRadius: 6,
    background: theme === 'dark' ? '#0f172a' : '#f8fafc',
    border: `1px solid ${tone}44`,
    borderLeft: `4px solid ${tone}`,
    marginBottom: 12,
    flexWrap: 'wrap',
  };
}

const leftStyle: CSSProperties = { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' };
const rightStyle: CSSProperties = { display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 };
const labelStyle: CSSProperties = { fontSize: 9, fontWeight: 900, color: '#f97316', letterSpacing: '1px' };
function orderStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 12, fontWeight: 900, color: theme === 'dark' ? '#f8fafc' : '#0f172a' }; }
function familyStyle(theme: 'dark' | 'light'): CSSProperties { return { fontSize: 11, fontWeight: 700, color: theme === 'dark' ? '#cbd5e1' : '#475569' }; }
const customerStyle: CSSProperties = { fontSize: 10, color: '#64748b', fontWeight: 600 };
function daysChip(days: number): CSSProperties { const c = days < 0 ? '#dc2626' : days <= 2 ? '#f59e0b' : '#10b981'; return { fontSize: 10, fontWeight: 900, color: c, background: `${c}18`, border: `1px solid ${c}44`, borderRadius: 3, padding: '2px 7px' }; }
const blockedChip: CSSProperties = { fontSize: 10, fontWeight: 900, color: '#dc2626', background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 3, padding: '2px 7px' };
const cycleStyle: CSSProperties = { fontSize: 10, color: '#475569', fontWeight: 700 };
