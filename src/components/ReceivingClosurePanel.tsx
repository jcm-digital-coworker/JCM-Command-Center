import { useEffect, useState, type CSSProperties } from 'react';
import { productionOrders } from '../data/productionOrders';
import { getRuntimeProductionOrders, applyWorkflowRuntimeAction, WORKFLOW_RUNTIME_UPDATED_EVENT } from '../logic/workflowRuntimeState';
import type { AppTab } from '../types/app';

type Props = {
  theme?: 'dark' | 'light';
  onGoToTab?: (tab: AppTab) => void;
};

export default function ReceivingClosurePanel({ theme = 'dark', onGoToTab }: Props) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, bump);
      window.removeEventListener('storage', bump);
    };
  }, []);

  const runtimeOrders = getRuntimeProductionOrders(productionOrders);
  void tick;

  const materialOrders = runtimeOrders.filter((order) => {
    const materialStatus = String(order.materialStatus ?? '').toUpperCase();
    return (
      materialStatus === 'MISSING' ||
      materialStatus === 'NOT_RECEIVED' ||
      materialStatus === 'ORDER_REQUIRED' ||
      materialStatus === 'PARTIAL' ||
      order.blockers.some((blocker) => blocker.type === 'material')
    );
  });

  function handleMarkStaged(orderNumber: string) {
    applyWorkflowRuntimeAction(orderNumber, 'MARK_MATERIAL_STAGED', 'Material staged from Receiving closure panel.');
  }

  return (
    <section style={getPanelStyle(theme)}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>RECEIVING LOOP</div>
          <h3 style={getTitleStyle(theme)}>Material closure</h3>
          <p style={subTextStyle(theme)}>Orders waiting on material from Receiving. Mark staged once material is verified and delivered.</p>
        </div>
        <span style={countBadgeStyle(materialOrders.length)}>{materialOrders.length} OPEN</span>
      </div>

      {materialOrders.length === 0 ? (
        <div style={getEmptyStyle(theme)}>No open material blockers — all orders have material staged or received.</div>
      ) : (
        <div style={stackStyle}>
          {materialOrders.map((order) => {
            const materialBlockers = order.blockers.filter((b) => b.type === 'material');
            const materialStatus = order.materialStatus ?? 'UNKNOWN';
            const isPartial = materialStatus === 'PARTIAL';
            return (
              <div key={order.id} style={getCardStyle(theme, isPartial)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={getOrderHeaderStyle(theme)}>
                    <strong style={getOrderStyle(theme)}>#{order.orderNumber} — {order.productFamily}</strong>
                    {order.priority && (
                      <span style={getPriorityChip(order.priority)}>{String(order.priority).toUpperCase()}</span>
                    )}
                  </div>
                  {order.customer && (
                    <div style={customerStyle(theme)}>{order.customer}</div>
                  )}
                  {order.partNumber && (
                    <div style={partStyle(theme)}>Part: {order.partNumber}{order.quantity ? ` · Qty: ${order.quantity}` : ''}</div>
                  )}
                  <div style={metaRowStyle}>
                    <span style={deptStyle(theme)}>{order.currentDepartment}</span>
                    <span style={getMaterialChip(materialStatus)}>{materialStatus.replace(/_/g, ' ')}</span>
                    {order.projectedShipDate && (
                      <span style={dateStyle(theme)}>DUE {order.projectedShipDate}</span>
                    )}
                  </div>
                  {materialBlockers.map((blocker, i) => (
                    <div key={i} style={blockerStyle(theme)}>⚠ {blocker.message}</div>
                  ))}
                </div>
                <div style={buttonColStyle}>
                  <button
                    type="button"
                    style={stagedButtonStyle}
                    onClick={() => handleMarkStaged(order.orderNumber)}
                  >
                    MARK STAGED
                  </button>
                  {onGoToTab && (
                    <button
                      type="button"
                      style={requestButtonStyle}
                      onClick={() => onGoToTab('receiving')}
                    >
                      → RECEIVING
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function getPriorityChip(priority: string): CSSProperties {
  const p = String(priority).toLowerCase();
  const color = p === 'critical' ? '#ef4444' : p === 'hot' ? '#f59e0b' : '#64748b';
  return { fontSize: 9, fontWeight: 900, color, background: `${color}22`, border: `1px solid ${color}`, borderRadius: 3, padding: '2px 6px', letterSpacing: '0.5px' };
}

function getMaterialChip(status: string): CSSProperties {
  const s = status.toUpperCase();
  const color = s === 'MISSING' ? '#ef4444' : s === 'NOT_RECEIVED' ? '#f59e0b' : s === 'ORDER_REQUIRED' ? '#f97316' : s === 'PARTIAL' ? '#a78bfa' : '#64748b';
  return { fontSize: 10, fontWeight: 900, color, background: `${color}22`, border: `1px solid ${color}55`, borderRadius: 3, padding: '2px 6px' };
}

const headerStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 6 };
const stackStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 };
const metaRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6, alignItems: 'center' };
const buttonColStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 };
const stagedButtonStyle: CSSProperties = { padding: '9px 11px', borderRadius: 4, border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.16)', color: '#10b981', fontSize: 11, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' };
const requestButtonStyle: CSSProperties = { padding: '9px 11px', borderRadius: 4, border: '1px solid #38bdf8', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', fontSize: 11, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' };

function countBadgeStyle(count: number): CSSProperties {
  const color = count > 0 ? '#f97316' : '#10b981';
  return { color, fontSize: 11, fontWeight: 900, border: `1px solid ${color}`, borderRadius: 4, padding: '6px 8px', whiteSpace: 'nowrap' };
}

function getPanelStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#fff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function getTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: '0 0 4px', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 16, fontWeight: 900 }; }
function subTextStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, lineHeight: 1.4 }; }
function getEmptyStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 6, border: theme === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1', color: '#10b981', fontSize: 13, fontWeight: 700 }; }
function getCardStyle(theme: 'dark' | 'light', partial: boolean): CSSProperties { return { padding: 13, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${partial ? '#a78bfa55' : 'rgba(245, 158, 11, 0.45)'}`, borderLeft: `4px solid ${partial ? '#a78bfa' : '#f59e0b'}`, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }; }
function getOrderHeaderStyle(_theme: 'dark' | 'light'): CSSProperties { return { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }; }
function getOrderStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 13 }; }
function customerStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, marginTop: 3, fontWeight: 700 }; }
function partStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#7dd3fc' : '#0369a1', fontSize: 11, marginTop: 2, fontWeight: 800 }; }
function deptStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 11, fontWeight: 700 }; }
function dateStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 700 }; }
function blockerStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 6, padding: '5px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.35)', color: theme === 'dark' ? '#fcd34d' : '#92400e', fontSize: 11, fontWeight: 700 }; }
