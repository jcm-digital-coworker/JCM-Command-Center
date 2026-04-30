import type { CSSProperties } from 'react';
import type { WorkCenter } from '../types/plant';
import { productionOrders } from '../data/productionOrders';
import { partBlueprints } from '../data/partBlueprints';
import { getStationPacket, getBlueprintForOrder } from '../logic/orderBlueprints';
import { getWorkflowSignal } from '../logic/orderWorkflow';

type WorkCenterWorkflowPanelProps = {
  workCenter: WorkCenter;
  theme?: 'dark' | 'light';
};

export default function WorkCenterWorkflowPanel({
  workCenter,
  theme = 'dark',
}: WorkCenterWorkflowPanelProps) {
  const orders = productionOrders.filter(
    (order) =>
      order.currentDepartment === workCenter.department ||
      order.nextDepartment === workCenter.department ||
      (workCenter.department === 'Receiving' && isMaterialActionOrder(order)) ||
      (workCenter.department === 'QA' && hasQualityBlock(order))
  );

  const sortedOrders = [...orders].sort((a, b) => getOrderRank(b) - getOrderRank(a));

  return (
    <section style={getPanelStyle(theme)}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>LIVE WORKFLOW</div>
          <h3 style={getTitleStyle(theme)}>Order signals</h3>
        </div>
        <span style={countPillStyle}>{sortedOrders.length} ACTIVE</span>
      </div>

      {sortedOrders.length === 0 ? (
        <div style={getEmptyStyle(theme)}>No active order signals for this work center.</div>
      ) : (
        <div style={stackStyle}>
          {sortedOrders.map((order) => {
            const blueprint = getBlueprintForOrder(order, partBlueprints);
            const packet = getStationPacket(order, blueprint);
            const signal = getWorkflowSignal(order);
            const priority = getVisualPriority(order, packet.status, signal.gate);
            const action = getActionLabel(signal.gate, packet.status);

            return (
              <article key={order.id} style={getCardStyle(theme, priority.color)}>
                <div style={cardTopStyle}>
                  <div>
                    <div style={getOrderTitleStyle(theme)}>
                      Order {order.orderNumber} • {order.productFamily}
                    </div>
                    <div style={mutedStyle}>
                      {order.partNumber ?? order.assemblyPartNumber ?? 'No part number'}
                      {order.projectedShipDate ? ` • Due ${order.projectedShipDate}` : ''}
                    </div>
                  </div>
                  <span style={getPriorityBadgeStyle(priority.color)}>{priority.label}</span>
                </div>

                <div style={statusGridStyle}>
                  <InfoBlock label="Status" value={String(packet.status)} theme={theme} />
                  <InfoBlock label="Gate" value={String(signal.gate)} theme={theme} />
                  <InfoBlock label="Owner" value={getOwnerLabel(signal.gate, order.currentDepartment)} theme={theme} />
                </div>

                <div style={messageStyle(theme)}>{signal.message}</div>
                <div style={nextActionStyle(theme)}>Next: {signal.action}</div>

                {packet.operation ? (
                  <div style={operationStyle(theme)}>Operation: {packet.operation}</div>
                ) : null}

                {packet.instructions && packet.instructions.length > 0 ? (
                  <div style={miniListStyle}>
                    {packet.instructions.slice(0, 3).map((instruction) => (
                      <div key={instruction} style={miniListItemStyle(theme)}>• {instruction}</div>
                    ))}
                  </div>
                ) : null}

                {packet.blockers && packet.blockers.length > 0 ? (
                  <div style={blockerBoxStyle}>
                    {packet.blockers.map((blocker) => (
                      <div key={blocker}>Blocked: {blocker}</div>
                    ))}
                  </div>
                ) : null}

                <div style={actionRowStyle}>
                  <button type="button" style={getActionButtonStyle(priority.color)}>
                    {action.primary}
                  </button>
                  <button type="button" style={secondaryButtonStyle}>
                    {action.secondary}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function InfoBlock({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return (
    <div style={getInfoBlockStyle(theme)}>
      <div style={infoLabelStyle}>{label}</div>
      <div style={getInfoValueStyle(theme)}>{value}</div>
    </div>
  );
}

function isMaterialActionOrder(order: (typeof productionOrders)[number]) {
  const materialStatus = String(order.materialStatus ?? '').toUpperCase();
  return materialStatus === 'MISSING' || materialStatus === 'NOT_RECEIVED' || materialStatus === 'ORDER_REQUIRED' || order.blockers.some((blocker) => blocker.type === 'material');
}

function hasQualityBlock(order: (typeof productionOrders)[number]) {
  return order.blockers.some((blocker) => blocker.type === 'quality') || String(order.qaStatus ?? '').toUpperCase() === 'HOLD';
}

function getOrderRank(order: (typeof productionOrders)[number]) {
  const priority = String(order.priority).toLowerCase();
  const priorityScore = priority === 'critical' ? 300 : priority === 'hot' ? 200 : 100;
  const blockedScore = String(order.flowStatus).toLowerCase() === 'blocked' ? 60 : 0;
  const missingBlueprintScore = !order.blueprintId && !order.partNumber ? 80 : 0;
  return priorityScore + blockedScore + missingBlueprintScore;
}

function getVisualPriority(order: (typeof productionOrders)[number], packetStatus: string, gate: string) {
  if (packetStatus === 'MISSING_BLUEPRINT' || gate === 'ENGINEERING') {
    return { label: 'ENGINEERING REQUIRED', color: '#dc2626' };
  }

  if (packetStatus === 'BLOCKED' || String(order.flowStatus).toLowerCase() === 'blocked') {
    return { label: 'BLOCKED', color: '#dc2626' };
  }

  if (String(order.priority).toLowerCase() === 'critical') {
    return { label: 'CRITICAL', color: '#dc2626' };
  }

  if (String(order.priority).toLowerCase() === 'hot') {
    return { label: 'HOT', color: '#f59e0b' };
  }

  return { label: 'READY', color: '#10b981' };
}

function getOwnerLabel(gate: string, currentDepartment: string) {
  if (gate === 'ENGINEERING') return 'Engineering';
  if (gate === 'RECEIVING') return 'Receiving';
  if (gate === 'SUPERVISOR') return 'Production Supervisor';
  if (gate === 'SALES') return 'Sales';
  return currentDepartment;
}

function getActionLabel(gate: string, packetStatus: string) {
  if (packetStatus === 'MISSING_BLUEPRINT' || gate === 'ENGINEERING') {
    return { primary: 'Escalate Engineering', secondary: 'Hold Station' };
  }

  if (gate === 'RECEIVING') {
    return { primary: 'Request / Stage Material', secondary: 'Notify Affected Areas' };
  }

  if (packetStatus === 'BLOCKED') {
    return { primary: 'Resolve Blocker', secondary: 'Notify Lead' };
  }

  return { primary: 'Start / Continue Work', secondary: 'View Packet' };
}

const headerStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 14 };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: '1.4px', textTransform: 'uppercase', marginBottom: 6 };
const stackStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 12 };
const cardTopStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' };
const statusGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginTop: 12 };
const mutedStyle: CSSProperties = { color: '#64748b', fontSize: 12, marginTop: 4, fontWeight: 700 };
const infoLabelStyle: CSSProperties = { color: '#94a3b8', fontSize: 10, fontWeight: 900, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 };
const miniListStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 };
const blockerBoxStyle: CSSProperties = { marginTop: 10, padding: 10, borderRadius: 6, border: '1px solid rgba(220, 38, 38, 0.45)', background: 'rgba(220, 38, 38, 0.12)', color: '#fecaca', fontSize: 12, fontWeight: 800 };
const actionRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 };
const countPillStyle: CSSProperties = { whiteSpace: 'nowrap', padding: '6px 9px', borderRadius: 4, border: '1px solid #f97316', color: '#f97316', background: 'rgba(249, 115, 22, 0.12)', fontSize: 11, fontWeight: 900 };
const secondaryButtonStyle: CSSProperties = { padding: '9px 11px', borderRadius: 4, border: '1px solid #475569', background: 'transparent', color: '#cbd5e1', fontSize: 11, fontWeight: 900, letterSpacing: '0.7px', cursor: 'pointer', textTransform: 'uppercase' };

function getPanelStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }; }
function getTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 16, fontWeight: 900, letterSpacing: '0.7px', textTransform: 'uppercase' }; }
function getEmptyStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 16, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1', color: '#64748b', fontSize: 13, fontWeight: 700 }; }
function getCardStyle(theme: 'dark' | 'light', color: string): CSSProperties { return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}80`, borderLeft: `5px solid ${color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }; }
function getOrderTitleStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 14, fontWeight: 900, lineHeight: 1.35 }; }
function getPriorityBadgeStyle(color: string): CSSProperties { return { whiteSpace: 'nowrap', padding: '6px 8px', borderRadius: 4, border: `1px solid ${color}`, color, background: `${color}1f`, fontSize: 10, fontWeight: 900, letterSpacing: '0.6px', textTransform: 'uppercase' }; }
function getInfoBlockStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 10, borderRadius: 6, background: theme === 'dark' ? '#111827' : '#ffffff', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' }; }
function getInfoValueStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 12, fontWeight: 900 }; }
function messageStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 12, color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 13, lineHeight: 1.45, fontWeight: 800 }; }
function nextActionStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 6, color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 13, lineHeight: 1.45, fontWeight: 900 }; }
function operationStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 10, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 12, fontWeight: 900 }; }
function miniListItemStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#94a3b8' : '#475569', fontSize: 12, fontWeight: 700 }; }
function getActionButtonStyle(color: string): CSSProperties { return { padding: '9px 11px', borderRadius: 4, border: `1px solid ${color}`, background: `${color}26`, color, fontSize: 11, fontWeight: 900, letterSpacing: '0.7px', cursor: 'pointer', textTransform: 'uppercase' }; }
