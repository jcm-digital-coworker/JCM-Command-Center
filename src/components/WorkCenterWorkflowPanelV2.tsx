import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { WorkCenter } from '../types/plant';
import type { CoveragePerson } from '../types/coverage';
import type { DynamicTraveler } from '../types/dynamicTraveler';
import type { ClassificationReviewConfirmation, ClassificationReviewDraft } from '../types/classificationReview';
import { seedCoverage } from '../data/coverage';
import { productionOrders } from '../data/productionOrders';
import { COVERAGE_STORAGE_KEY } from '../logic/coverage';
import { getWorkCenterWorkflowGroups } from '../logic/workflowPanelSelectors';
import { generateDynamicTravelers } from '../logic/dynamicTraveler';
import { addWorkflowAction } from '../logic/workflowActions';
import { applyWorkflowRuntimeAction, WORKFLOW_RUNTIME_UPDATED_EVENT } from '../logic/workflowRuntimeState';
import { getConfirmationsForTraveler, loadClassificationReviewConfirmations, saveClassificationReviewConfirmation } from '../logic/classificationReviewConfirmations';
import TravelerDetailModal from './travelers/TravelerDetailModal';
import ClassificationReviewCapture from './travelers/ClassificationReviewCapture';

type Props = {
  workCenter: WorkCenter;
  theme?: 'dark' | 'light';
  onOpenReceiving?: (view: 'submit', requesterDepartment?: WorkCenter['department']) => void;
  onOpenEngineering?: () => void;
  onOpenMaintenance?: () => void;
};

type ActionDeps = Pick<Props, 'onOpenReceiving' | 'onOpenEngineering' | 'onOpenMaintenance'>;

const REVIEW_TARGET_STORAGE_KEY = 'jcm-classification-review-target-v1';
const REVIEW_TARGET_EVENT = 'jcm-classification-review-target-updated';

const defaultReviewDraft: ClassificationReviewDraft = {
  question: 'NOT_ENOUGH_INFO',
  answer: 'NEEDS_REVIEW',
  reviewedBy: 'Floor Review',
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
  const [selectedReviewTraveler, setSelectedReviewTraveler] = useState<DynamicTraveler | null>(null);
  const [reviewTargetVersion, setReviewTargetVersion] = useState(0);
  const [reviewDraft, setReviewDraft] = useState<ClassificationReviewDraft>(defaultReviewDraft);
  const [reviewConfirmations, setReviewConfirmations] = useState<ClassificationReviewConfirmation[]>(() => loadClassificationReviewConfirmations());
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [coveragePeople] = useState<CoveragePerson[]>(() => loadCoverage());

  useEffect(() => {
    const refresh = () => setRuntimeVersion((version) => version + 1);
    const refreshConfirmations = () => setReviewConfirmations(loadClassificationReviewConfirmations());
    const refreshTarget = () => setReviewTargetVersion((version) => version + 1);
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('storage', refreshConfirmations);
    window.addEventListener('storage', refreshTarget);
    window.addEventListener('jcm-classification-review-confirmations-updated', refreshConfirmations);
    window.addEventListener(REVIEW_TARGET_EVENT, refreshTarget);
    return () => {
      window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('storage', refreshConfirmations);
      window.removeEventListener('storage', refreshTarget);
      window.removeEventListener('jcm-classification-review-confirmations-updated', refreshConfirmations);
      window.removeEventListener(REVIEW_TARGET_EVENT, refreshTarget);
    };
  }, []);

  const deptCrew = useMemo(
    () => coveragePeople.filter((person) => person.department === workCenter.department),
    [coveragePeople, workCenter.department],
  );

  const travelers = useMemo(
    () => generateDynamicTravelers(productionOrders, workCenter.department),
    [workCenter.department, runtimeVersion],
  );

  const reviewTarget = useMemo(() => loadReviewTarget(), [reviewTargetVersion, workCenter.department]);
  const groups = getWorkCenterWorkflowGroups(workCenter);
  const activeCount = groups.reduce((total: number, group: any) => total + group.cards.length, 0);
  const readyCount = travelers.filter((traveler) => traveler.visualSignal === 'READY').length;
  const blockedTravelers = travelers.filter((traveler) => traveler.visualSignal === 'BLOCKED' || traveler.visualSignal === 'HOLD');
  const blockerFocusTraveler = blockedTravelers[0] ?? null;
  const blockedCount = blockedTravelers.length;
  const reviewTravelers = travelers.filter((traveler) => needsClassificationReview(traveler));

  useEffect(() => {
    const targetedTraveler = reviewTarget?.department === workCenter.department
      ? reviewTravelers.find((traveler) => traveler.order.orderNumber === reviewTarget.orderNumber)
      : null;
    if (targetedTraveler) setSelectedReviewTraveler(targetedTraveler);
  }, [reviewTarget, reviewTravelers, workCenter.department]);

  function saveReviewCapture() {
    if (!selectedReviewTraveler) return;
    const next = saveClassificationReviewConfirmation(selectedReviewTraveler, reviewDraft);
    setReviewConfirmations(next);
    setReviewDraft(defaultReviewDraft);
  }

  function clearReviewTarget() {
    localStorage.removeItem(REVIEW_TARGET_STORAGE_KEY);
    setReviewTargetVersion((version) => version + 1);
    window.dispatchEvent(new Event(REVIEW_TARGET_EVENT));
  }

  function runAction(label: string, orderNumber: string) {
    const notice = act(label, orderNumber, workCenter.department, {
      onOpenReceiving,
      onOpenEngineering,
      onOpenMaintenance,
    });
    setActionNotice(notice);
  }

  return (
    <section style={panelStyle(theme)}>
      <div style={headerRowStyle}>
        <div>
          <div style={eyebrowStyle}>LIVE WORKFLOW</div>
          <h3 style={titleStyle(theme)}>Station Order Truth</h3>
        </div>
        <strong style={visibleCountStyle}>{activeCount + travelers.length} VISIBLE</strong>
      </div>

      {actionNotice ? <div style={noticeStyle(theme)}>{actionNotice}</div> : null}

      {deptCrew.length > 0 ? (
        <section style={subPanelStyle(theme)}>
          <div style={eyebrowStyle}>CREW ON SHIFT</div>
          <div style={wrapRowStyle}>
            {deptCrew.map((person) => <CrewChip key={person.id} person={person} theme={theme} />)}
          </div>
        </section>
      ) : null}

      {blockerFocusTraveler ? (
        <section style={blockerFocusStyle(theme)}>
          <div style={headerRowStyle}>
            <div>
              <div style={eyebrowStyle}>BLOCKER FOCUS</div>
              <strong style={strongTextStyle(theme)}>#{blockerFocusTraveler.order.orderNumber} needs help now</strong>
              <div style={bodyTextStyle(theme)}>{blockerFocusTraveler.currentInstruction}</div>
            </div>
            <span style={badge('#ef4444')}>{blockerFocusTraveler.visualSignal}</span>
          </div>
          <div style={wrapRowStyle}>
            <span style={badge('#f97316')}>{formatToken(blockerFocusTraveler.materialStatus)}</span>
            <span style={badge(getConfidenceColor(blockerFocusTraveler.productClassification.confidence))}>{formatToken(blockerFocusTraveler.productClassification.confidence)}</span>
            <span style={badge(blockerFocusTraveler.qaRequired ? '#f97316' : '#64748b')}>{blockerFocusTraveler.qaRequired ? 'QA REQUIRED' : 'QA NOT REQUIRED'}</span>
          </div>
          <div style={noticeStyle(theme)}>
            This card identifies the leading blocked or held traveler. Opening it does not clear the blocker, approve the route, or dispatch work.
            <button type="button" style={buttonStyle('#ef4444')} onClick={() => setSelectedTraveler(blockerFocusTraveler)}>Open traveler detail</button>
          </div>
        </section>
      ) : null}

      <ClassificationReviewSummary
        travelers={reviewTravelers}
        confirmations={reviewConfirmations}
        selectedTraveler={selectedReviewTraveler}
        targetOrderNumber={reviewTarget?.department === workCenter.department ? reviewTarget.orderNumber : undefined}
        draft={reviewDraft}
        theme={theme}
        onSelectTraveler={(traveler) => {
          setSelectedReviewTraveler(traveler);
          setSelectedTraveler(traveler);
        }}
        onDraftChange={setReviewDraft}
        onSave={saveReviewCapture}
        onClearTarget={clearReviewTarget}
      />

      <section style={subPanelStyle(theme)}>
        <div style={headerRowStyle}>
          <div>
            <div style={eyebrowStyle}>DYNAMIC TRAVELERS</div>
            <div style={mutedTextStyle(theme)}>Department-scoped work instructions: what to run, where to run it, and where it goes next.</div>
          </div>
          <div style={wrapRowStyle}>
            <span style={badge('#10b981')}>{readyCount} READY</span>
            <span style={badge('#ef4444')}>{blockedCount} BLOCKED / HOLD</span>
          </div>
        </div>
        {travelers.length === 0 ? (
          <Empty theme={theme}>No Dynamic Travelers are mapped for this work center yet.</Empty>
        ) : (
          <div style={stackStyle}>
            {travelers.slice(0, 4).map((traveler) => (
              <TravelerCard key={traveler.id} traveler={traveler} theme={theme} onOpen={() => setSelectedTraveler(traveler)} />
            ))}
          </div>
        )}
      </section>

      {groups.length === 0 ? <Empty theme={theme}>No active order signals for this work center.</Empty> : null}

      <div style={stackStyle}>
        {groups.map((group: any) => (
          <section key={group.key} style={groupStyle(theme)}>
            <div style={{ marginBottom: 10 }}>
              <div style={eyebrowStyle}>{group.title}</div>
              <div style={mutedTextStyle(theme)}>{group.description}</div>
            </div>
            <div style={stackStyle}>
              {group.cards.map((card: any) => (
                <WorkflowCard key={card.order.id} card={card} theme={theme} onAction={runAction} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {selectedTraveler ? (
        <TravelerDetailModal traveler={selectedTraveler} theme={theme} onClose={() => setSelectedTraveler(null)} />
      ) : null}
    </section>
  );
}

function CrewChip({ person, theme }: { person: CoveragePerson; theme: 'dark' | 'light' }) {
  const color = crewDotColor(person.status);
  return (
    <div style={{ ...chipCardStyle(theme), borderLeft: `3px solid ${color}` }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: color, marginTop: 4 }} />
      <div>
        <div style={strongTextStyle(theme)}>{person.name}</div>
        <div style={tinyTextStyle}>{person.station}</div>
      </div>
    </div>
  );
}

function TravelerCard({ traveler, theme, onOpen }: { traveler: DynamicTraveler; theme: 'dark' | 'light'; onOpen: () => void }) {
  const signalColor = getTravelerSignalColor(traveler.visualSignal);
  return (
    <button type="button" style={travelerCardStyle(theme, signalColor)} onClick={onOpen}>
      <div style={headerRowStyle}>
        <div>
          <strong style={strongTextStyle(theme)}>#{traveler.order.orderNumber} • {traveler.order.productFamily}</strong>
          <div style={bodyTextStyle(theme)}>{traveler.currentInstruction}</div>
        </div>
        <span style={badge(signalColor)}>{traveler.visualSignal}</span>
      </div>
      <div style={wrapRowStyle}>
        <span style={badge('#38bdf8')}>FINISH: {traveler.finishHints[0] ? formatToken(traveler.finishHints[0]) : 'Unknown'}</span>
        <span style={badge(traveler.qaRequired ? '#f97316' : '#64748b')}>{traveler.qaRequired ? 'QA REQUIRED' : 'QA NOT REQUIRED'}</span>
        <span style={badge(needsClassificationReview(traveler) ? '#f97316' : '#10b981')}>{needsClassificationReview(traveler) ? 'REVIEW NEEDED' : 'CLASSIFIED'}</span>
        <span style={badge(getConfidenceColor(traveler.productClassification.confidence))}>{formatToken(traveler.productClassification.confidence)}</span>
      </div>
      <div style={infoGridStyle}>
        <Info label="Resource" value={traveler.bestResource?.label ?? 'No capable resource'} theme={theme} />
        <Info label="Next" value={String(traveler.nextHandoff ?? 'Not assigned')} theme={theme} />
        <Info label="Material" value={formatToken(String(traveler.materialStatus))} theme={theme} />
        <Info label="QA" value={formatToken(String(traveler.qaStatus))} theme={theme} />
      </div>
    </button>
  );
}

function WorkflowCard({ card, theme, onAction }: { card: any; theme: 'dark' | 'light'; onAction: (label: string, orderNumber: string) => void }) {
  const order = card.order;
  const signal = card.signal;
  const packet = card.packet;
  return (
    <article style={workflowCardStyle(theme, card.urgency.color)}>
      <div style={headerRowStyle}>
        <div>
          <strong style={strongTextStyle(theme)}>Order {order.orderNumber} • {order.productFamily}</strong>
          <div style={tinyTextStyle}>{order.partNumber ?? order.assemblyPartNumber ?? 'No part number'}</div>
        </div>
        <div style={rightBadgeColumnStyle}>
          <span style={badge(card.urgency.color)}>{card.urgency.label}</span>
          <span style={badge(card.due.color)}>{card.due.label}</span>
          <span style={badge('#38bdf8')}>PRESSURE {signal.pressureScore}</span>
        </div>
      </div>

      <div style={constraintStyle(theme)}><strong>{card.relationshipLabel}:</strong> {card.operatorConstraint}</div>
      <div style={mutedTextStyle(theme)}>{card.relationshipReason}</div>

      <div style={infoGridStyle}>
        <Info label="Status" value={String(packet.status)} theme={theme} />
        <Info label="Checkpoint" value={String(signal.checkpoint)} theme={theme} />
        <Info label="Primary Owner" value={String(signal.gate)} theme={theme} />
        <Info label="Strength" value={String(signal.strength)} theme={theme} />
      </div>

      <p style={bodyTextStyle(theme)}>{signal.message}</p>
      <p style={nextTextStyle(theme)}>Next: {signal.action}</p>
      {packet.operation ? <div style={bodyTextStyle(theme)}>Operation: {packet.operation}</div> : null}
      {packet.blockers?.map((blocker: string) => <div key={blocker} style={blockerTextStyle}>Blocked: {blocker}</div>)}
      {order.lastAction ? <div style={mutedTextStyle(theme)}>Last action: {order.lastAction}</div> : null}
      {signal.parallelActions.length > 0 ? <SignalList title="Parallel actions" items={signal.parallelActions} theme={theme} /> : null}
      {signal.watchers.length > 0 ? <SignalList title="Watchers" items={signal.watchers} theme={theme} /> : null}

      <div style={wrapRowStyle}>
        <button type="button" style={buttonStyle(card.urgency.color)} onClick={() => onAction(card.buttons.primary, order.orderNumber)}>{safeButtonLabel(card.buttons.primary)}</button>
        <button type="button" style={buttonStyle('#64748b')} onClick={() => onAction(card.buttons.secondary, order.orderNumber)}>{safeButtonLabel(card.buttons.secondary)}</button>
      </div>
    </article>
  );
}

function ClassificationReviewSummary({
  travelers,
  confirmations,
  selectedTraveler,
  targetOrderNumber,
  draft,
  theme,
  onSelectTraveler,
  onDraftChange,
  onSave,
  onClearTarget,
}: {
  travelers: DynamicTraveler[];
  confirmations: ClassificationReviewConfirmation[];
  selectedTraveler: DynamicTraveler | null;
  targetOrderNumber?: string;
  draft: ClassificationReviewDraft;
  theme: 'dark' | 'light';
  onSelectTraveler: (traveler: DynamicTraveler) => void;
  onDraftChange: (draft: ClassificationReviewDraft) => void;
  onSave: () => void;
  onClearTarget: () => void;
}) {
  if (travelers.length === 0) {
    return (
      <section style={reviewStyle(theme, false)}>
        <div style={headerRowStyle}>
          <strong style={strongTextStyle(theme)}>No route/product review warnings in this work center.</strong>
          <span style={badge('#10b981')}>CLEAR</span>
        </div>
      </section>
    );
  }

  const activeTraveler = selectedTraveler ?? travelers[0];
  const activeTravelerConfirmations = getConfirmationsForTraveler(confirmations, activeTraveler);

  return (
    <section style={reviewStyle(theme, true)}>
      <div style={headerRowStyle}>
        <div>
          <div style={eyebrowStyle}>CLASSIFICATION REVIEW NEEDED</div>
          <strong style={strongTextStyle(theme)}>{travelers.length} traveler{travelers.length === 1 ? '' : 's'} need route/product confirmation.</strong>
          {targetOrderNumber ? (
            <div style={noticeStyle(theme)}>
              Opened from global queue for order {targetOrderNumber}. This traveler is preselected below.
              <button type="button" style={buttonStyle('#f97316')} onClick={onClearTarget}>Clear Target</button>
            </div>
          ) : null}
        </div>
        <span style={badge('#f97316')}>{travelers.length} REVIEW</span>
      </div>
      <div style={stackStyle}>
        {travelers.slice(0, 3).map((traveler) => {
          const travelerConfirmations = getConfirmationsForTraveler(confirmations, traveler);
          const isSelected = activeTraveler.id === traveler.id || targetOrderNumber === traveler.order.orderNumber;
          return (
            <button key={traveler.id} type="button" style={reviewItemStyle(theme, isSelected)} onClick={() => onSelectTraveler(traveler)}>
              <div style={headerRowStyle}>
                <strong>#{traveler.order.orderNumber} • {traveler.productClassification.modelSignal ?? 'No model'}</strong>
                <span style={badge(getConfidenceColor(traveler.productClassification.confidence))}>{formatToken(traveler.productClassification.confidence)}</span>
              </div>
              <div style={bodyTextStyle(theme)}>{traveler.classificationReviewReasons[0] ?? 'Classification needs human review.'}</div>
              <div style={tinyTextStyle}>{formatToken(traveler.productClassification.productFamily)} • {traveler.finishHints.length ? traveler.finishHints.map(formatToken).join(', ') : 'No finish hint'}</div>
              {travelerConfirmations.length > 0 ? <div style={savedTextStyle}>{travelerConfirmations.length} structured confirmation{travelerConfirmations.length === 1 ? '' : 's'} saved</div> : null}
            </button>
          );
        })}
      </div>
      <ClassificationReviewCapture traveler={activeTraveler} confirmations={activeTravelerConfirmations} draft={draft} theme={theme} onDraftChange={onDraftChange} onSave={onSave} />
    </section>
  );
}

function SignalList({ title, items, theme }: { title: string; items: Array<{ owner: string; reason: string; action: string; urgency: string }>; theme: 'dark' | 'light' }) {
  return (
    <div style={signalListStyle(theme)}>
      <div style={eyebrowStyle}>{title}</div>
      {items.map((item) => <div key={`${item.owner}-${item.reason}`} style={bodyTextStyle(theme)}>{item.owner}: {item.action} ({item.urgency})</div>)}
    </div>
  );
}

function Info({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return (
    <div style={infoBoxStyle(theme)}>
      <div style={tinyLabelStyle}>{label}</div>
      <div style={strongTextStyle(theme)}>{value}</div>
    </div>
  );
}

function Empty({ children, theme }: { children: string; theme: 'dark' | 'light' }) {
  return <div style={emptyStyle(theme)}>{children}</div>;
}

function act(label: string, orderNumber: string, dept: WorkCenter['department'], deps: ActionDeps): string | null {
  if (label === 'No Action') return null;

  if (label.includes('Engineering') || label.includes('Hold')) {
    addWorkflowAction({ orderNumber, actionType: 'ENGINEERING_ESCALATION', department: 'Engineering', note: label });
    applyWorkflowRuntimeAction(orderNumber, 'ESCALATE_ENGINEERING', label);
    deps.onOpenEngineering?.();
    return 'Engineering escalation recorded.';
  }

  if (label.includes('Material') || label.includes('Areas')) {
    addWorkflowAction({ orderNumber, actionType: 'MATERIAL_REQUEST', department: 'Receiving', note: label });
    applyWorkflowRuntimeAction(orderNumber, 'REQUEST_MATERIAL', label);
    deps.onOpenReceiving?.('submit', dept);
    return 'Material request started through Receiving.';
  }

  if (isMaintenanceAction(label)) {
    addWorkflowAction({ orderNumber, actionType: 'BLOCKER_RESOLUTION', department: 'Maintenance', note: label });
    deps.onOpenMaintenance?.();
    return 'Maintenance follow-up opened. The blocker remains until the issue is actually cleared.';
  }

  if (label.includes('Blocker') || label.includes('Lead')) {
    addWorkflowAction({ orderNumber, actionType: 'BLOCKER_RESOLUTION', department: dept, note: label });
    return 'Blocker review logged here. No blocker was cleared and no route changed; assign the owning department or use material/engineering/maintenance when that is the true owner.';
  }

  addWorkflowAction({ orderNumber, actionType: 'WORK_STARTED', department: dept, note: label });
  applyWorkflowRuntimeAction(orderNumber, 'START_WORK', label);
  return 'Work action recorded.';
}

function isMaintenanceAction(label: string): boolean {
  return /maintenance|machine|service|repair|alarm|down|downtime/i.test(label);
}

function safeButtonLabel(label: string): string {
  if (label.includes('Resolve Blocker')) return 'Review blocker';
  if (label.includes('Blocker')) return label.replace('Blocker', 'blocker');
  return label;
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

function loadReviewTarget(): { orderNumber: string; department: WorkCenter['department']; travelerId?: string; updatedAt?: string } | null {
  try {
    const stored = localStorage.getItem(REVIEW_TARGET_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { orderNumber?: string; department?: WorkCenter['department']; travelerId?: string; updatedAt?: string };
    return parsed.orderNumber && parsed.department ? { orderNumber: parsed.orderNumber, department: parsed.department, travelerId: parsed.travelerId, updatedAt: parsed.updatedAt } : null;
  } catch {
    return null;
  }
}

function needsClassificationReview(traveler: DynamicTraveler): boolean {
  return traveler.classificationReviewReasons.length > 0 || traveler.productClassification.needsHumanReview || traveler.productClassification.confidence === 'LOW' || traveler.productClassification.confidence === 'REVIEW';
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

function badge(color: string): CSSProperties {
  return { display: 'inline-block', padding: '4px 7px', borderRadius: 999, border: `1px solid ${color}66`, background: `${color}18`, color, fontSize: 10, fontWeight: 900, letterSpacing: '0.5px', textTransform: 'uppercase', whiteSpace: 'nowrap' };
}

function panelStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 16, borderRadius: 8, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', display: 'grid', gap: 16 }; }
function subPanelStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 12, borderRadius: 8, background: theme === 'dark' ? '#111827' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function blockerFocusStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 12, borderRadius: 8, background: theme === 'dark' ? '#111827' : '#fff7ed', border: '1px solid rgba(239,68,68,0.55)', borderLeft: '5px solid #ef4444', display: 'grid', gap: 10 }; }
function groupStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 14, borderRadius: 8, background: theme === 'dark' ? '#111827' : '#f8fafc', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function workflowCardStyle(theme: 'dark' | 'light', color: string): CSSProperties { return { padding: 14, borderRadius: 8, border: `1px solid ${color}`, borderLeft: `5px solid ${color}`, background: theme === 'dark' ? '#0f172a' : '#f8fafc' }; }
function travelerCardStyle(theme: 'dark' | 'light', color: string): CSSProperties { return { width: '100%', textAlign: 'left', padding: 13, borderRadius: 8, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: `1px solid ${color}66`, borderLeft: `5px solid ${color}`, cursor: 'pointer' }; }
function reviewStyle(theme: 'dark' | 'light', active: boolean): CSSProperties { const color = active ? '#f97316' : '#10b981'; return { padding: 12, borderRadius: 8, background: theme === 'dark' ? '#111827' : '#ffffff', border: `1px solid ${color}66`, borderLeft: `5px solid ${color}` }; }
function reviewItemStyle(theme: 'dark' | 'light', selected: boolean): CSSProperties { return { width: '100%', textAlign: 'left', padding: 10, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: selected ? '1px solid #f97316' : theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', cursor: 'pointer' }; }
function chipCardStyle(theme: 'dark' | 'light'): CSSProperties { return { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', borderRadius: 6, background: theme === 'dark' ? '#1e293b' : '#ffffff', border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0' }; }
function infoBoxStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 10, borderRadius: 6, background: theme === 'dark' ? '#111827' : '#ffffff', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' }; }
function signalListStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 10, padding: 10, borderRadius: 6, background: theme === 'dark' ? '#111827' : '#ffffff', border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0' }; }
function noticeStyle(theme: 'dark' | 'light'): CSSProperties { return { padding: 10, borderRadius: 6, background: theme === 'dark' ? '#0f172a' : '#fff7ed', border: theme === 'dark' ? '1px solid #7c2d12' : '1px solid #fed7aa', color: theme === 'dark' ? '#fed7aa' : '#9a3412', fontSize: 12, fontWeight: 800, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }; }
function emptyStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#94a3b8' : '#64748b', padding: 12, borderRadius: 6, border: theme === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1', fontSize: 13, fontWeight: 700 }; }
function buttonStyle(color: string): CSSProperties { return { padding: '8px 10px', borderRadius: 4, border: `1px solid ${color}`, background: `${color}18`, color, fontSize: 11, fontWeight: 900, letterSpacing: '0.6px', cursor: 'pointer', textTransform: 'uppercase' }; }
function strongTextStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: 900 }; }
function bodyTextStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: 750, lineHeight: 1.45, marginTop: 8 }; }
function mutedTextStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 700, lineHeight: 1.35 }; }
function titleStyle(theme: 'dark' | 'light'): CSSProperties { return { margin: 0, color: theme === 'dark' ? '#e2e8f0' : '#0f172a' }; }
function nextTextStyle(theme: 'dark' | 'light'): CSSProperties { return { color: theme === 'dark' ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: 900 }; }
function constraintStyle(theme: 'dark' | 'light'): CSSProperties { return { marginTop: 10, padding: 10, borderRadius: 6, background: theme === 'dark' ? '#111827' : '#ffffff', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 12, fontWeight: 800 }; }

const headerRowStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' };
const wrapRowStyle: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 };
const stackStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 };
const infoGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8, marginTop: 10 };
const rightBadgeColumnStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' };
const eyebrowStyle: CSSProperties = { color: '#f97316', fontSize: 11, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' };
const visibleCountStyle: CSSProperties = { color: '#f97316', whiteSpace: 'nowrap' };
const tinyTextStyle: CSSProperties = { color: '#64748b', fontSize: 11, fontWeight: 700, marginTop: 3 };
const tinyLabelStyle: CSSProperties = { color: '#94a3b8', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' };
const blockerTextStyle: CSSProperties = { color: '#fecaca', marginTop: 6, fontSize: 12, fontWeight: 800 };
const savedTextStyle: CSSProperties = { color: '#86efac', fontSize: 11, fontWeight: 900, marginTop: 6 };
