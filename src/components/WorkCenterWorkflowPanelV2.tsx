import { useEffect, useState, useMemo } from 'react';
import type { WorkCenter } from '../types/plant';
import type { CoveragePerson } from '../types/coverage';
import type { DynamicTraveler } from '../types/dynamicTraveler';
import { seedCoverage } from '../data/coverage';
import { productionOrders } from '../data/productionOrders';
import { COVERAGE_STORAGE_KEY } from '../logic/coverage';
import { getWorkCenterWorkflowGroups } from '../logic/workflowPanelSelectors';
import { generateDynamicTravelers } from '../logic/dynamicTraveler';
import { addWorkflowAction } from '../logic/workflowActions';
import { applyWorkflowRuntimeAction, WORKFLOW_RUNTIME_UPDATED_EVENT } from '../logic/workflowRuntimeState';
import TravelerDetailModal from './travelers/TravelerDetailModal';

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
  const [runtimeVersion, setRuntimeVersion] = useState(0);
  const [selectedTraveler, setSelectedTraveler] = useState<DynamicTraveler | null>(null);
  const [coveragePeople] = useState<CoveragePerson[]>(() => loadCoverage());

  useEffect(() => {
    const refresh = () => setRuntimeVersion((version) => version + 1);
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const deptCrew = useMemo(
    () => coveragePeople.filter((p) => p.department === workCenter.department),
    [coveragePeople, workCenter.department],
  );

  const travelers = useMemo(
    () => generateDynamicTravelers(productionOrders, workCenter.department),
    [workCenter.department, runtimeVersion],
  );

  const groups = getWorkCenterWorkflowGroups(workCenter);
  const activeCount = groups.reduce((total, group) => total + group.cards.length, 0);
  const travelerReadyCount = travelers.filter((traveler) => traveler.visualSignal === 'READY').length;
  const travelerBlockedCount = travelers.filter((traveler) => traveler.visualSignal === 'BLOCKED' || traveler.visualSignal === 'HOLD').length;

  return (
    <section style={panelStyle(theme)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
        <div>
          <div style={{ color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: 1.2 }}>LIVE WORKFLOW</div>
          <h3 style={{ margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }}>Station Order Truth</h3>
        </div>
        <strong style={{ color: '#f97316', whiteSpace: 'nowrap' }}>{activeCount + travelers.length} VISIBLE</strong>
      </div>

      {deptCrew.length > 0 && (
        <div style={crewStripStyle(theme)}>
          <div style={crewStripLabelStyle}>CREW ON SHIFT</div>
          <div style={crewRowStyle}>
            {deptCrew.map((person) => (
              <div key={person.id} style={crewChipStyle(person.status, theme)}>
                <div style={crewDotStyle(person.status)} />
                <div>
                  <div style={crewNameStyle(theme)}>{person.name}</div>
                  <div style={crewStationStyle}>{person.station}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={travelerPanelStyle(theme)}>
        <div style={travelerHeaderStyle}>
          <div>
            <div style={{ color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>Dynamic Travelers</div>
            <div style={{ color: '#64748b', fontSize: 12, fontWeight: 700, marginTop: 3 }}>
              Department-scoped work instructions: what to run, where to run it, and where it goes next.
            </div>
          </div>
          <div style={travelerCountRowStyle}>
            <span style={badge('#10b981')}>{travelerReadyCount} READY</span>
            <span style={badge('#ef4444')}>{travelerBlockedCount} BLOCKED / HOLD</span>
          </div>
        </div>

        {travelers.length === 0 ? (
          <div style={{ color: '#64748b', fontWeight: 700, fontSize: 13 }}>No Dynamic Travelers are mapped for this work center yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {travelers.slice(0, 4).map((traveler) => (
              <button key={traveler.id} type="button" style={travelerCardStyle(traveler.visualSignal, theme)} onClick={() => setSelectedTraveler(traveler)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ color: theme === 'dark' ? '#f8fafc' : '#0f172a' }}>#{traveler.order.orderNumber} • {traveler.order.productFamily}</strong>
                    <div style={{ color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 13, fontWeight: 800, lineHeight: 1.4, marginTop: 6 }}>{traveler.currentInstruction}</div>
                  </div>
                  <span style={badge(getTravelerSignalColor(traveler.visualSignal))}>{traveler.visualSignal}</span>
                </div>
                <TravelerIntelBadges traveler={traveler} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginTop: 10 }}>
                  <Info label="Resource" value={traveler.bestResource?.label ?? 'No capable resource'} theme={theme} />
                  <Info label="Next" value={String(traveler.nextHandoff ?? 'Not assigned')} theme={theme} />
                  <Info label="Material" value={formatToken(String(traveler.materialStatus))} theme={theme} />
                  <Info label="QA" value={formatToken(String(traveler.qaStatus))} theme={theme} />
                </div>
              </button>
            ))}
          </div>
        )}
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
                    {order.lastAction ? <div style={reasonStyle(theme)}>Last action: {order.lastAction}</div> : null}

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

      {selectedTraveler ? (
        <TravelerDetailModal
          traveler={selectedTraveler}
          theme={theme}
          onClose={() => setSelectedTraveler(null)}
        />
      ) : null}
    </section>
  );
}

function Info({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return <div style={{ padding: 10, borderRadius: 6, background: theme === 'dark' ? '#111827' : '#fff', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' }}><div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 900 }}>{label}</div><div style={{ color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontWeight: 900 }}>{value}</div></div>;
}

function TravelerIntelBadges({ traveler }: { traveler: DynamicTraveler }) {
  const primaryFinishHint = traveler.finishHints[0] ? formatToken(traveler.finishHints[0]) : 'Finish Unknown';
  const confidence = formatToken(traveler.productClassification.confidence);
  const needsReview = traveler.classificationReviewReasons.length > 0 || traveler.productClassification.needsHumanReview;

  return (
    <div style={intelBadgeRowStyle}>
      <span style={badge('#38bdf8')}>FINISH: {primaryFinishHint}</span>
      {traveler.qaRequired ? <span style={badge('#f97316')}>QA REQUIRED</span> : <span style={badge('#64748b')}>QA NOT REQUIRED</span>}
      {needsReview ? <span style={badge('#f97316')}>REVIEW NEEDED</span> : <span style={badge('#10b981')}>CLASSIFIED</span>}
      <span style={badge(getConfidenceColor(traveler.productClassification.confidence))}>{confidence}</span>
    </div>
  );
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
  if (label.includes('Engineering') || label.includes('Hold')) {
    addWorkflowAction({ orderNumber, actionType: 'ENGINEERING_ESCALATION', department: 'Engineering', note: label });
    applyWorkflowRuntimeAction(orderNumber, 'ESCALATE_ENGINEERING', label);
    return eng?.();
  }
  if (label.includes('Material') || label.includes('Areas')) {
    addWorkflowAction({ orderNumber, actionType: 'MATERIAL_REQUEST', department: 'Receiving', note: label });
    applyWorkflowRuntimeAction(orderNumber, 'REQUEST_MATERIAL', label);
    return rec?.('submit', dept);
  }
  if (label.includes('Blocker') || label.includes('Lead')) {
    addWorkflowAction({ orderNumber, actionType: 'BLOCKER_RESOLUTION', department: dept, note: label });
    applyWorkflowRuntimeAction(orderNumber, 'RESOLVE_BLOCKER', label);
    return maint?.();
  }
  addWorkflowAction({ orderNumber, actionType: 'WORK_STARTED', department: dept, note: label });
  applyWorkflowRuntimeAction(orderNumber, 'START_WORK', label);
}

function loadCoverage(): CoveragePerson[] {
  try {
    const stored = localStorage.getItem(COVERAGE_STORAGE_KEY);
    if (!stored) return seedCoverage;
    const parsed = JSON.parse(stored) as CoveragePerson[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedCoverage;
  } catch {
    return seedCoverage;
  }
}

function crewDotColor(status: string): string {
  if (status === 'AVAILABLE') return '#10b981';
  if (status === 'ASSIGNED') return '#f59e0b';
  if (status === 'BREAK') return '#8b5cf6';
  return '#64748b';
}

function getTravelerSignalColor(signal: DynamicTraveler['visualSignal']): string {
  if (signal === 'READY') return '#10b981';
  if (signal === 'BLOCKED' || signal === 'HOLD') return '#ef4444';
  if (signal === 'DONE') return '#64748b';
  return '#f97316';
}

function getConfidenceColor(confidence: DynamicTraveler['productClassification']['confidence']): string {
  if (confidence === 'HIGH') return '#10b981';
  if (confidence === 'MEDIUM') return '#38bdf8';
  if (confidence === 'LOW') return '#f97316';
  return '#ef4444';
}

function formatToken(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function crewStripStyle(theme: 'dark' | 'light') { return { padding: '10px 14px', borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0', marginBottom: 14 } as const; }
function crewChipStyle(status: string, theme: 'dark' | 'light') { const color = crewDotColor(status); return { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', borderRadius: 6, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: `1px solid ${color}44`, borderLeft: `3px solid ${color}` } as const; }
function crewDotStyle(status: string) { return { width: 8, height: 8, borderRadius: 999, background: crewDotColor(status), marginTop: 4, flexShrink: 0 } as const; }
function crewNameStyle(theme: 'dark' | 'light') { return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 12, fontWeight: 900 } as const; }
function travelerPanelStyle(theme: 'dark' | 'light') { return { padding: 12, borderRadius: 8, background: theme === 'dark' ? '#111827' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', marginBottom: 16 } as const; }
function travelerCardStyle(signal: DynamicTraveler['visualSignal'], theme: 'dark' | 'light') { const color = getTravelerSignalColor(signal); return { width: '100%', textAlign: 'left', padding: 13, borderRadius: 8, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}66`, borderLeft: `5px solid ${color}`, cursor: 'pointer' } as const; }

const crewStripLabelStyle = { color: '#f97316', fontSize: 10, fontWeight: 900, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 8 } as const;
const crewRowStyle = { display: 'flex', flexWrap: 'wrap', gap: 8 } as const;
const crewStationStyle = { color: '#64748b', fontSize: 11, fontWeight: 700, marginTop: 2 } as const;
const travelerHeaderStyle = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap' } as const;
const travelerCountRowStyle = { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' } as const;
const intelBadgeRowStyle = { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 } as const;

function panelStyle(theme: 'dark' | 'light') { return { padding: 18, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#fff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' } as const; }
function groupStyle(theme: 'dark' | 'light') { return { padding: 12, borderRadius: 8, background: theme === 'dark' ? '#111827' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' } as const; }
function constraintStyle(theme: 'dark' | 'light') { return { marginTop: 12, padding: 10, borderRadius: 6, color: theme === 'dark' ? '#f8fafc' : '#0f172a', background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', fontSize: 13, fontWeight: 800 } as const; }
function reasonStyle(theme: 'dark' | 'light') { return { marginTop: 6, color: theme === 'dark' ? '#94a3b8' : '#475569', fontSize: 12, fontWeight: 700 } as const; }
function badge(color: string) { return { whiteSpace: 'nowrap', padding: '5px 7px', borderRadius: 4, border: `1px solid ${color}`, color, background: `${color}1f`, fontSize: 10, fontWeight: 900 } as const; }
function button(color: string) { return { padding: '9px 11px', borderRadius: 4, border: `1px solid ${color}`, background: `${color}26`, color, fontSize: 11, fontWeight: 900, cursor: 'pointer' } as const; }
