import type { WorkCenter } from '../types/plant';
import { productionOrders } from '../data/productionOrders';
import { partBlueprints } from '../data/partBlueprints';
import { getBlueprintForOrder, getStationPacket, orderRequiresBlueprintPacket } from '../logic/orderBlueprints';
import { getWorkflowSignal } from '../logic/orderWorkflow';

type Props = {
  workCenter: WorkCenter;
  theme?: 'dark' | 'light';
  onOpenReceiving?: (view: 'submit', requesterDepartment?: WorkCenter['department']) => void;
  onOpenEngineering?: () => void;
  onOpenMaintenance?: () => void;
};

export default function WorkCenterWorkflowPanelV2({
  workCenter,
  theme = 'dark',
  onOpenReceiving,
  onOpenEngineering,
  onOpenMaintenance,
}: Props) {
  const orders = productionOrders
    .filter((order) => order.currentDepartment === workCenter.department || order.nextDepartment === workCenter.department || (workCenter.department === 'Receiving' && needsMaterial(order)))
    .sort((a, b) => rank(b) - rank(a));

  return (
    <section style={{ padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#fff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: 1.2 }}>LIVE WORKFLOW</div>
          <h3 style={{ margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }}>Order Signals</h3>
        </div>
        <strong style={{ color: '#f97316' }}>{orders.length} ACTIVE</strong>
      </div>

      {orders.length === 0 ? <div style={{ color: '#64748b' }}>No active order signals for this work center.</div> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.map((order) => {
          const blueprint = getBlueprintForOrder(order, partBlueprints);
          const packet = getStationPacket(order, blueprint);
          const signal = getWorkflowSignal(order);
          const urgency = getUrgency(order, packet.status, signal.gate);
          const due = dueLabel(order.projectedShipDate);
          const buttons = getButtons(signal.gate, packet.status);

          return (
            <article key={order.id} style={{ padding: 14, borderRadius: 8, border: `1px solid ${urgency.color}`, borderLeft: `5px solid ${urgency.color}`, background: theme === 'dark' ? '#0f172a' : '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <strong style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>Order {order.orderNumber} • {order.productFamily}</strong>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{order.partNumber ?? order.assemblyPartNumber ?? 'No part number'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <span style={badge(urgency.color)}>{urgency.label}</span>
                  <span style={badge(due.color)}>{due.label}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginTop: 12 }}>
                <Info label="Status" value={String(packet.status)} theme={theme} />
                <Info label="Gate" value={String(signal.gate)} theme={theme} />
                <Info label="Owner" value={owner(signal.gate, order.currentDepartment)} theme={theme} />
              </div>

              <p style={{ color: theme === 'dark' ? '#cbd5e1' : '#475569', fontWeight: 800 }}>{signal.message}</p>
              <p style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontWeight: 900 }}>Next: {signal.action}</p>

              {packet.operation ? <div style={{ color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 800 }}>Operation: {packet.operation}</div> : null}
              {packet.blockers?.map((blocker) => <div key={blocker} style={{ color: '#fecaca', marginTop: 6 }}>Blocked: {blocker}</div>)}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <button type="button" style={button(urgency.color)} onClick={() => act(buttons.primary, workCenter.department, onOpenReceiving, onOpenEngineering, onOpenMaintenance)}>{buttons.primary}</button>
                <button type="button" style={button('#64748b')} onClick={() => act(buttons.secondary, workCenter.department, onOpenReceiving, onOpenEngineering, onOpenMaintenance)}>{buttons.secondary}</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Info({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return <div style={{ padding: 10, borderRadius: 6, background: theme === 'dark' ? '#111827' : '#fff', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' }}><div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 900 }}>{label}</div><div style={{ color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 900 }}>{value}</div></div>;
}

function needsMaterial(order: (typeof productionOrders)[number]) { const materialStatus = String(order.materialStatus ?? '').toUpperCase(); return materialStatus === 'MISSING' || materialStatus === 'NOT_RECEIVED' || materialStatus === 'ORDER_REQUIRED' || order.blockers.some((b) => b.type === 'material'); }
function rank(order: (typeof productionOrders)[number]) { const missingBlueprintScore = orderRequiresBlueprintPacket(order) && !getBlueprintForOrder(order, partBlueprints) ? 80 : 0; return (String(order.priority).toLowerCase() === 'critical' ? 300 : String(order.priority).toLowerCase() === 'hot' ? 200 : 100) + (String(order.flowStatus).toLowerCase() === 'blocked' ? 60 : 0) + missingBlueprintScore + dueLabel(order.projectedShipDate).score; }
function getUrgency(order: (typeof productionOrders)[number], status: string, gate: string) { if (status === 'MISSING_BLUEPRINT' || gate === 'ENGINEERING') return { label: 'ENGINEERING REQUIRED', color: '#dc2626' }; if (status === 'BLOCKED') return { label: 'BLOCKED', color: '#dc2626' }; if (String(order.priority).toLowerCase() === 'critical') return { label: 'CRITICAL', color: '#dc2626' }; if (String(order.priority).toLowerCase() === 'hot') return { label: 'HOT', color: '#f59e0b' }; return { label: 'READY', color: '#10b981' }; }
function dueLabel(date?: string) { if (!date) return { label: 'NO DATE', color: '#64748b', score: 0 }; const days = Math.ceil((new Date(`${date}T00:00:00`).getTime() - Date.now()) / 86400000); if (days < 0) return { label: 'OVERDUE', color: '#dc2626', score: 100 }; if (days === 0) return { label: 'DUE TODAY', color: '#dc2626', score: 90 }; if (days <= 2) return { label: `DUE IN ${days} DAY${days === 1 ? '' : 'S'}`, color: '#f59e0b', score: 60 }; return { label: `DUE IN ${days} DAYS`, color: '#10b981', score: 0 }; }
function owner(gate: string, current: string) { if (gate === 'ENGINEERING') return 'Engineering'; if (gate === 'RECEIVING') return 'Receiving'; if (gate === 'SUPERVISOR') return 'Production Supervisor'; if (gate === 'SALES') return 'Sales'; return current; }
function getButtons(gate: string, status: string) { if (status === 'MISSING_BLUEPRINT' || gate === 'ENGINEERING') return { primary: 'Escalate Engineering', secondary: 'Hold Station' }; if (gate === 'RECEIVING') return { primary: 'Request Material', secondary: 'Notify Areas' }; if (status === 'BLOCKED') return { primary: 'Resolve Blocker', secondary: 'Notify Lead' }; return { primary: 'Start Work', secondary: 'View Packet' }; }
function act(label: string, dept: WorkCenter['department'], rec?: Props['onOpenReceiving'], eng?: Props['onOpenEngineering'], maint?: Props['onOpenMaintenance']) { if (label.includes('Engineering') || label.includes('Hold')) return eng?.(); if (label.includes('Material') || label.includes('Areas')) return rec?.('submit', dept); if (label.includes('Blocker') || label.includes('Lead')) return maint?.(); }
function badge(color: string) { return { whiteSpace: 'nowrap', padding: '5px 7px', borderRadius: 4, border: `1px solid ${color}`, color, background: `${color}1f`, fontSize: 10, fontWeight: 900 } as const; }
function button(color: string) { return { padding: '9px 11px', borderRadius: 4, border: `1px solid ${color}`, background: `${color}26`, color, fontSize: 11, fontWeight: 900, cursor: 'pointer' } as const; }
