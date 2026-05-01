import type { WorkCenter } from '../types/plant';
import { getWorkCenterWorkflowGroups } from '../logic/workflowPanelSelectors';
import { addWorkflowAction } from '../logic/workflowActions';

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
  const groups = getWorkCenterWorkflowGroups(workCenter);
  const activeCount = groups.reduce((total, group) => total + group.cards.length, 0);

  return (
    <section style={panelStyle(theme)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
        <div>
          <div style={{ color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: 1.2 }}>LIVE WORKFLOW</div>
          <h3 style={{ margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }}>Station Order Truth</h3>
        </div>
        <strong style={{ color: '#f97316', whiteSpace: 'nowrap' }}>{activeCount} VISIBLE</strong>
      </div>

      {groups.length === 0 ? <div style={{ color: '#64748b' }}>No active order signals for this work center.</div> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groups.map((group) => (
          <div key={group.key} style={groupStyle(theme)}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>{group.title}</div>
              <div style={{ color: '#64748b', fontSize: 12, fontWeight: 700, marginTop: 3 }}>{group.description}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {group.cards.map((card) => {
                const order = card.order;
                const signal = card.signal;
                const packet = card.packet;

                return (
                  <article key={order.id} style={{ padding: 14, borderRadius: 8, border: `1px solid ${card.urgency.color}`, borderLeft: `5px solid ${card.urgency.color}`, background: theme === 'dark' ? '#0f172a' : '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <strong style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>Order {order.orderNumber} • {order.productFamily}</strong>
                        <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{order.partNumber ?? order.assemblyPartNumber ?? 'No part number'}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                        <span style={badge(card.urgency.color)}>{card.urgency.label}</span>
                        <span style={badge(card.due.color)}>{card.due.label}</span>
                        <span style={badge('#38bdf8')}>PRESSURE {signal.pressureScore}</span>
                      </div>
                    </div>

                    <div style={constraintStyle(theme)}>
                      <strong>{card.relationshipLabel}:</strong> {card.operatorConstraint}
                    </div>
                    <div style={reasonStyle(theme)}>{card.relationshipReason}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginTop: 12 }}>
                      <Info label="Status" value={String(packet.status)} theme={theme} />
                      <Info label="Checkpoint" value={String(signal.checkpoint)} theme={theme} />
                      <Info label="Primary Owner" value={String(signal.gate)} theme={theme} />
                      <Info label="Strength" value={String(signal.strength)} theme={theme} />
                    </div>

                    <p style={{ color: theme === 'dark' ? '#cbd5e1' : '#475569', fontWeight: 800 }}>{signal.message}</p>
                    <p style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontWeight: 900 }}>Next: {signal.action}</p>

                    {packet.operation ? <div style={{ color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 800 }}>Operation: {packet.operation}</div> : null}
                    {packet.blockers?.map((blocker) => <div key={blocker} style={{ color: '#fecaca', marginTop: 6 }}>Blocked: {blocker}</div>)}

                    {signal.parallelActions.length > 0 ? <SignalList title="Parallel actions" items={signal.parallelActions} theme={theme} /> : null}
                    {signal.watchers.length > 0 ? <SignalList title="Watchers" items={signal.watchers} theme={theme} /> : null}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                      <button type="button" style={button(card.urgency.color)} onClick={() => act(card.buttons.primary, order.orderNumber, workCenter.department, onOpenReceiving, onOpenEngineering, onOpenMaintenance)}>{card.buttons.primary}</button>
                      <button type="button" style={button('#64748b')} onClick={() => act(card.buttons.secondary, order.orderNumber, workCenter.department, onOpenReceiving, onOpenEngineering, onOpenMaintenance)}>{card.buttons.secondary}</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Info({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return <div style={{ padding: 10, borderRadius: 6, background: theme === 'dark' ? '#111827' : '#fff', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' }}><div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 900 }}>{label}</div><div style={{ color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 900 }}>{value}</div></div>;
}

function SignalList({ title, items, theme }: { title: string; items: Array<{ owner: string; reason: string; action: string; urgency: string }>; theme: 'dark' | 'light' }) {
  return (
    <div style={{ marginTop: 10, padding: 10, borderRadius: 6, background: theme === 'dark' ? '#111827' : '#fff', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' }}>
      <div style={{ color: '#f97316', fontSize: 10, fontWeight: 900, marginBottom: 6 }}>{title.toUpperCase()}</div>
      {items.map((item) => (
        <div key={`${item.owner}-${item.reason}`} style={{ color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: 700, marginTop: 4 }}>
          {item.owner}: {item.action} ({item.urgency})
        </div>
      ))}
    </div>
  );
}

function act(label: string, orderNumber: string, dept: WorkCenter['department'], rec?: Props['onOpenReceiving'], eng?: Props['onOpenEngineering'], maint?: Props['onOpenMaintenance']) {
  if (label === 'No Action') return;
  if (label.includes('Engineering') || label.includes('Hold')) { addWorkflowAction({ orderNumber, actionType: 'ENGINEERING_ESCALATION', department: 'Engineering', note: label }); return eng?.(); }
  if (label.includes('Material') || label.includes('Areas')) { addWorkflowAction({ orderNumber, actionType: 'MATERIAL_REQUEST', department: 'Receiving', note: label }); return rec?.('submit', dept); }
  if (label.includes('Blocker') || label.includes('Lead')) { addWorkflowAction({ orderNumber, actionType: 'BLOCKER_RESOLUTION', department: dept, note: label }); return maint?.(); }
  addWorkflowAction({ orderNumber, actionType: 'WORK_STARTED', department: dept, note: label });
}

function panelStyle(theme: 'dark' | 'light') { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#fff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' } as const; }
function groupStyle(theme: 'dark' | 'light') { return { padding: 12, borderRadius: 8, background: theme === 'dark' ? '#111827' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' } as const; }
function constraintStyle(theme: 'dark' | 'light') { return { marginTop: 12, padding: 10, borderRadius: 6, color: theme === 'dark' ? '#f8fafc' : '#0f172a', background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', fontSize: 13, fontWeight: 800 } as const; }
function reasonStyle(theme: 'dark' | 'light') { return { marginTop: 6, color: theme === 'dark' ? '#94a3b8' : '#475569', fontSize: 12, fontWeight: 700 } as const; }
function badge(color: string) { return { whiteSpace: 'nowrap', padding: '5px 7px', borderRadius: 4, border: `1px solid ${color}`, color, background: `${color}1f`, fontSize: 10, fontWeight: 900 } as const; }
function button(color: string) { return { padding: '9px 11px', borderRadius: 4, border: `1px solid ${color}`, background: `${color}26`, color, fontSize: 11, fontWeight: 900, cursor: 'pointer' } as const; }
