import { useState, useEffect, type CSSProperties } from 'react';
import type { Department } from '../types/machine';
import type { ProductionOrder } from '../types/productionOrder';
import type { AppTab } from '../types/app';
import { productionOrders } from '../data/productionOrders';
import { getRuntimeProductionOrders, WORKFLOW_RUNTIME_UPDATED_EVENT } from '../logic/workflowRuntimeState';
import { addWorkflowAction } from '../logic/workflowActions';
import { getOrderLastTouchedHours, getBlockerAgeLabel, getBlockerAgeTone, getBlockerAgeToneColor } from '../logic/blockerAge';
import { getUrgencyScore } from '../logic/urgencyScore';
import { isBlockedProductionOrder, isClosedProductionStatus } from '../logic/orderStatusTruth';

type BlockerAgeTone = ReturnType<typeof getBlockerAgeTone>;

type EscalationEntry = {
  order: ProductionOrder;
  ageHours: number | null;
  tone: BlockerAgeTone;
};

type Props = {
  department: Department;
  theme?: 'dark' | 'light';
  onGoToTab?: (tab: AppTab) => void;
};

const STALE_THRESHOLD_HOURS = 1;

function getBlockedDeptOrders(department: Department): EscalationEntry[] {
  const orders = getRuntimeProductionOrders(productionOrders);
  return orders
    .filter((order) => {
      const deptMatch =
        order.currentDepartment === department ||
        (order.requiredDepartments ?? []).includes(department);
      const isOpen = !isClosedProductionStatus(order.status);
      return deptMatch && isBlockedProductionOrder(order) && isOpen;
    })
    .map((order) => {
      const ageHours = getOrderLastTouchedHours(order.orderNumber);
      const tone = ageHours !== null ? getBlockerAgeTone(ageHours) : 'aging';
      return { order, ageHours, tone };
    })
    .filter((entry) => entry.ageHours === null || entry.ageHours >= STALE_THRESHOLD_HOURS)
    .sort((a, b) => {
      const urgencyDiff = getUrgencyScore(b.order) - getUrgencyScore(a.order);
      if (urgencyDiff !== 0) return urgencyDiff;
      return (b.ageHours ?? 0) - (a.ageHours ?? 0);
    });
}

export default function DeptEscalationPanel({ department, theme = 'dark', onGoToTab }: Props) {
  const [entries, setEntries] = useState<EscalationEntry[]>(() => getBlockedDeptOrders(department));
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const [actioned, setActioned] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const refresh = () => setEntries(getBlockedDeptOrders(department));
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [department]);

  const visible = entries.filter((entry) => !dismissed.has(entry.order.orderNumber));
  if (visible.length === 0) return null;

  const isDark = theme === 'dark';
  const panelBg = isDark ? '#1e293b' : '#fef2f2';
  const textColor = isDark ? '#e2e8f0' : '#0f172a';
  const mutedColor = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? '#0f172a' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e2e8f0';

  function handleEscalateEngineering(entry: EscalationEntry) {
    addWorkflowAction({
      orderNumber: entry.order.orderNumber,
      actionType: 'NOTIFICATION',
      department,
      note: `Engineering escalation requested from ${department} — blocker untouched ${entry.ageHours !== null ? getBlockerAgeLabel(entry.ageHours) : 'unknown time'}. Order state preserved for review.`,
    });
    setActioned((prev) => new Set(prev).add(entry.order.orderNumber));
  }

  function handleNotifySupervisor(entry: EscalationEntry) {
    addWorkflowAction({
      orderNumber: entry.order.orderNumber,
      actionType: 'NOTIFICATION',
      department,
      note: `Supervisor notified — ${department} blocker on ${entry.order.orderNumber} untouched ${entry.ageHours !== null ? getBlockerAgeLabel(entry.ageHours) : ''}`,
    });
    setActioned((prev) => new Set(prev).add(entry.order.orderNumber));
  }

  function handleDismiss(orderNumber: string) {
    setDismissed((prev) => new Set(prev).add(orderNumber));
  }

  return (
    <div style={{ background: panelBg, border: '1px solid #dc2626', borderLeft: '4px solid #dc2626', borderRadius: 8, padding: '14px 16px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em', color: '#ef4444', textTransform: 'uppercase' }}>
          ⚠ BLOCKED — ACTION REQUIRED
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, background: '#dc2626', color: '#ffffff', borderRadius: 10, padding: '2px 8px' }}>
          {visible.length} order{visible.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visible.map((entry) => {
          const { order, ageHours, tone } = entry;
          const toneColor = getBlockerAgeToneColor(tone);
          const ageLabel = ageHours !== null ? getBlockerAgeLabel(ageHours) : 'unknown';
          const wasActioned = actioned.has(order.orderNumber);
          const blockerList = (order.blockers ?? []).slice(0, 2);
          const priorityUpper = String(order.priority ?? '').toUpperCase();
          const priorityColor = priorityUpper === 'CRITICAL' ? '#dc2626' : priorityUpper === 'HOT' ? '#f97316' : '#64748b';

          return (
            <div key={order.orderNumber} style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderLeft: `3px solid ${toneColor}`, borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: textColor }}>{order.orderNumber}</span>
                  <span style={agePillStyle(toneColor)}>{ageLabel}</span>
                  {priorityUpper && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: priorityColor, border: `1px solid ${priorityColor}`, borderRadius: 4, padding: '1px 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {priorityUpper}
                    </span>
                  )}
                </div>
                <button
                  style={{ background: 'none', border: 'none', color: mutedColor, cursor: 'pointer', fontSize: 12, padding: '2px 4px', lineHeight: 1 }}
                  onClick={() => handleDismiss(order.orderNumber)}
                  title="Dismiss from view"
                >
                  ✕
                </button>
              </div>

              <div style={{ color: mutedColor, fontSize: 12, marginBottom: 6 }}>
                {order.productFamily?.replace(/_/g, ' ')} — {order.customer ?? 'Unknown customer'}
              </div>

              {blockerList.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  {blockerList.map((blocker, i) => (
                    <span key={i} style={{ display: 'inline-block', fontSize: 11, background: isDark ? '#1e293b' : '#fef2f2', color: '#ef4444', border: '1px solid #ef444433', borderRadius: 4, padding: '2px 6px', marginRight: 4, marginBottom: 2 }}>
                      {blocker.type?.replace(/_/g, ' ')}{blocker.message ? ` — ${blocker.message}` : ''}
                    </span>
                  ))}
                </div>
              )}

              {wasActioned ? (
                <div style={{ fontSize: 11, fontWeight: 600, color: '#10b981', marginTop: 4 }}>
                  Notification logged — order state preserved
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {order.engineeringRequired && (
                    <button
                      style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', textTransform: 'uppercase' }}
                      onClick={() => handleEscalateEngineering(entry)}
                    >
                      NOTIFY ENGINEERING
                    </button>
                  )}
                  <button
                    style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', background: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', textTransform: 'uppercase' }}
                    onClick={() => handleNotifySupervisor(entry)}
                  >
                    NOTIFY SUPERVISOR
                  </button>
                  {onGoToTab && (
                    <button
                      style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', background: 'transparent', color: mutedColor, border: `1px solid ${isDark ? '#475569' : '#cbd5e1'}`, borderRadius: 4, padding: '4px 10px', cursor: 'pointer', textTransform: 'uppercase' }}
                      onClick={() => onGoToTab('orders')}
                    >
                      VIEW ORDER
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function agePillStyle(color: string): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.06em',
    color,
    background: `${color}22`,
    border: `1px solid ${color}`,
    borderRadius: 4,
    padding: '1px 6px',
    textTransform: 'uppercase',
  };
}
