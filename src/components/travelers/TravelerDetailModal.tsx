import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { DynamicTraveler, TravelerAction, TravelerActionType, TravelerResource } from '../../types/dynamicTraveler';
import { generatePlantTraveler } from '../../logic/dynamicTraveler';
import { applyWorkflowRuntimeAction, getWorkflowRuntimeState } from '../../logic/workflowRuntimeState';
import { addWorkflowAction, getWorkflowActionLog } from '../../logic/workflowActions';
import PlantTravelerDetailModal from './PlantTravelerDetailModal';
import type { Department } from '../../types/machine';

type TravelerDetailModalProps = {
  traveler: DynamicTraveler;
  theme: 'dark' | 'light';
  onClose: () => void;
  onOpenOrders?: () => void;
};

export default function TravelerDetailModal({ traveler, theme, onClose, onOpenOrders }: TravelerDetailModalProps) {
  const [selectedResource, setSelectedResource] = useState<TravelerResource | null>(traveler.bestResource ?? null);
  const [showPlantTraveler, setShowPlantTraveler] = useState(false);
  const [lastFired, setLastFired] = useState<TravelerActionType | null>(null);
  const order = traveler.order;

  function handleAction(type: TravelerActionType) {
    const orderNumber = order.orderNumber;
    if (type === 'REQUEST_MATERIAL') {
      applyWorkflowRuntimeAction(orderNumber, 'REQUEST_MATERIAL', 'Material requested from traveler');
    } else if (type === 'MARK_READY_FOR_HANDOFF') {
      addWorkflowAction({
        orderNumber,
        actionType: 'NOTIFICATION',
        department: traveler.department,
        note: 'Ready for handoff recorded from traveler; order state preserved',
      });
    } else if (type === 'SEND_TO_NEXT_DEPARTMENT' && traveler.nextHandoff && traveler.nextHandoff !== 'Complete') {
      const next = traveler.nextHandoff as Department;
      applyWorkflowRuntimeAction(orderNumber, 'ADVANCE_DEPARTMENT', `Sent to ${next}`, {
        currentDepartment: next,
      });
    } else if (type === 'COMPLETE_ORDER') {
      applyWorkflowRuntimeAction(orderNumber, 'COMPLETE_ORDER', 'Order marked complete from traveler');
      onClose();
      return;
    } else if (type === 'REPORT_ISSUE') {
      addWorkflowAction({
        orderNumber,
        actionType: 'NOTIFICATION',
        department: traveler.department,
        note: 'Issue reported from traveler; blocker preserved for review',
      });
    }
    setLastFired(type);
    setTimeout(() => setLastFired(null), 2000);
  }
  const signalColor = getSignalColor(traveler.visualSignal);
  const visibleActions = traveler.actions.filter((action) => action.type !== 'OPEN_DETAIL' && action.type !== 'OPEN_FULL_ORDER' && action.type !== 'OPEN_PLANT_TRAVELER');
  const plantTraveler = generatePlantTraveler(order);

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle(theme, signalColor)} onClick={(event) => event.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <div style={eyebrowStyle}>DEPARTMENT TRAVELER</div>
            <h3 style={modalTitleStyle(theme)}>#{order.orderNumber}</h3>
            <div style={subTextStyle(theme)}>{traveler.department} · {order.productFamily}</div>
          </div>
          <button type="button" style={closeButtonStyle} onClick={onClose}>CLOSE</button>
        </div>

        <div style={instructionBoxStyle(theme, signalColor)}>
          <div style={smallLabelStyle(theme)}>Current Instruction</div>
          <div style={instructionTextStyle(theme)}>{traveler.currentInstruction}</div>
        </div>

        <button type="button" style={plantTravelerButtonStyle} onClick={() => setShowPlantTraveler(true)}>
          OPEN FULL PLANT TRAVELER · {plantTraveler.completionPercent}% COMPLETE
        </button>

        <div style={infoGridStyle}>
          <Info label="Signal" value={traveler.visualSignal} theme={theme} />
          <Info label="Step" value={formatToken(traveler.stepStatus)} theme={theme} />
          <Info label="Recommended Resource" value={traveler.bestResource?.label ?? 'No capable resource mapped'} theme={theme} />
          <Info label="Next Handoff" value={traveler.nextHandoff ?? 'Not assigned'} theme={theme} />
          <Info label="Material" value={formatMaterial(traveler.materialStatus)} theme={theme} />
          <Info label="QA" value={formatQa(traveler.qaStatus)} theme={theme} />
          <Info label="Priority" value={formatToken(String(order.priority ?? 'normal'))} theme={theme} />
          <Info label="Ship Date" value={order.projectedShipDate ?? 'Not scheduled'} theme={theme} />
        </div>

        <ProductIntelligencePanel traveler={traveler} theme={theme} />

        <section style={sectionBlockStyle}>
          <div style={smallLabelStyle(theme)}>Capable Resources</div>
          <p style={helperTextStyle(theme)}>Only resources that match all required traveler capabilities are shown here. Unusable equipment is intentionally hidden.</p>
          {traveler.capableResources.length > 0 ? (
            <div style={listStyle}>
              {traveler.capableResources.map((resource) => (
                <button
                  key={resource.id}
                  type="button"
                  style={resourceButtonStyle(theme, resource.id === traveler.bestResource?.id, selectedResource?.id === resource.id)}
                  onClick={() => setSelectedResource(resource)}
                >
                  <strong>{resource.label}</strong>
                  <span>{resource.id === traveler.bestResource?.id ? 'Recommended' : formatToken(resource.status)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div style={warningBoxStyle(theme)}>No capable resource has been mapped for this department/order combination.</div>
          )}
        </section>

        {selectedResource ? (
          <ResourceContextPanel traveler={traveler} resource={selectedResource} theme={theme} />
        ) : null}

        <section style={sectionBlockStyle}>
          <div style={smallLabelStyle(theme)}>Blockers</div>
          {traveler.blockers.length > 0 ? (
            <div style={listStyle}>
              {traveler.blockers.map((blocker, index) => (
                <div key={`${blocker.type}-${index}`} style={blockerStyle(theme)}>
                  {formatToken(blocker.type)}: {blocker.message}
                </div>
              ))}
            </div>
          ) : (
            <div style={readyNoticeStyle(theme)}>No blocker is listed on this traveler.</div>
          )}
        </section>

        <section style={sectionBlockStyle}>
          <div style={smallLabelStyle(theme)}>Traveler Actions</div>
          <p style={helperTextStyle(theme)}>Enabled actions record activity or update order state in real time. Locked actions require preconditions to be met first.</p>
          <div style={listStyle}>
            {visibleActions.map((action) => (
              <ActionRow key={action.type} action={action} theme={theme} onFire={handleAction} fired={lastFired === action.type} />
            ))}
          </div>
        </section>

        <OrderActivitySection orderNumber={order.orderNumber} theme={theme} />

        {onOpenOrders ? (
          <button type="button" style={openOrdersButtonStyle} onClick={onOpenOrders}>OPEN FULL ORDER</button>
        ) : null}
      </div>

      {showPlantTraveler ? (
        <PlantTravelerDetailModal
          plantTraveler={plantTraveler}
          theme={theme}
          onClose={() => setShowPlantTraveler(false)}
        />
      ) : null}
    </div>
  );
}

function Info({ label, value, theme }: { label: string; value: string; theme: 'dark' | 'light' }) {
  return (
    <div>
      <div style={smallLabelStyle(theme)}>{label}</div>
      <div style={infoValueStyle(theme)}>{value}</div>
    </div>
  );
}

function ProductIntelligencePanel({ traveler, theme }: { traveler: DynamicTraveler; theme: 'dark' | 'light' }) {
  const classification = traveler.productClassification;
  const matchedLabel = classification.matchedRule?.label ?? 'No matched model rule';
  const reviewReasons = traveler.classificationReviewReasons;

  return (
    <section style={productIntelStyle(theme, reviewReasons.length > 0)}>
      <div style={smallLabelStyle(theme)}>Product Intelligence</div>
      <div style={infoGridStyle}>
        <Info label="Model Signal" value={classification.modelSignal ?? 'Not found'} theme={theme} />
        <Info label="Matched Rule" value={matchedLabel} theme={theme} />
        <Info label="Product Family" value={formatToken(classification.productFamily)} theme={theme} />
        <Info label="Material" value={formatToken(classification.materialClass)} theme={theme} />
        <Info label="Finish Hint" value={formatHintList(traveler.finishHints)} theme={theme} />
        <Info label="QA Required" value={traveler.qaRequired ? 'Yes' : 'No'} theme={theme} />
        <Info label="Confidence" value={formatToken(classification.confidence)} theme={theme} />
        <Info label="Suggested Route" value={classification.routeHint.length > 0 ? classification.routeHint.join(' → ') : 'No route hint'} theme={theme} />
      </div>

      {reviewReasons.length > 0 ? (
        <div style={reviewBoxStyle(theme)}>
          <strong>Needs review before automatic dispatch:</strong>
          <ul style={reviewListStyle}>
            {reviewReasons.slice(0, 4).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={readyNoticeStyle(theme)}>No classification review warning is listed for this traveler.</div>
      )}
    </section>
  );
}

function ResourceContextPanel({ traveler, resource, theme }: { traveler: DynamicTraveler; resource: TravelerResource; theme: 'dark' | 'light' }) {
  const isRecommended = resource.id === traveler.bestResource?.id;
  const matchingCapabilities = resource.capabilities.filter((capability) => traveler.capableResources.some((candidate) => candidate.id === resource.id && candidate.capabilities.includes(capability)));

  return (
    <section style={resourceContextStyle(theme, isRecommended)}>
      <div style={smallLabelStyle(theme)}>Resource Context</div>
      <div style={resourceContextHeaderStyle}>
        <div>
          <div style={resourceTitleStyle(theme)}>{resource.label}</div>
          <div style={subTextStyle(theme)}>{resource.department} · {formatToken(resource.type)}</div>
        </div>
        <span style={resourceStatusBadgeStyle(resource.status, isRecommended)}>{isRecommended ? 'RECOMMENDED' : formatToken(resource.status)}</span>
      </div>

      <div style={infoGridStyle}>
        <Info label="Current State" value={formatToken(resource.status)} theme={theme} />
        <Info label="Traveler Fit" value="Capable for this traveler" theme={theme} />
      </div>

      <div style={contextNoticeStyle(theme)}>
        This resource is shown because it satisfies every required capability for this traveler. Equipment that cannot run the job is not shown as an option.
      </div>

      <div style={chipRowStyle}>
        {matchingCapabilities.slice(0, 8).map((capability) => (
          <span key={capability} style={miniChipStyle(theme)}>{formatToken(capability)}</span>
        ))}
      </div>
    </section>
  );
}

function ActionRow({ action, theme, onFire, fired }: { action: TravelerAction; theme: 'dark' | 'light'; onFire: (type: TravelerActionType) => void; fired: boolean }) {
  return (
    <div style={actionRowStyle(theme, action.enabled)}>
      <div>
        <div style={actionLabelStyle(theme, action.enabled)}>{action.label}</div>
        {action.reason ? <div style={actionReasonStyle(theme)}>{action.reason}</div> : null}
      </div>
      {action.enabled ? (
        <button
          type="button"
          onClick={() => onFire(action.type)}
          style={actionFireButtonStyle(fired)}
          disabled={fired}
        >
          {fired ? '✓ DONE' : 'ACT'}
        </button>
      ) : (
        <span style={actionStatusStyle(false)}>LOCKED</span>
      )}
    </div>
  );
}

function OrderActivitySection({ orderNumber, theme }: { orderNumber: string; theme: 'dark' | 'light' }) {
  const runtimeOverride = getWorkflowRuntimeState()[orderNumber];
  const actionLog = getWorkflowActionLog().filter((entry) => entry.orderNumber === orderNumber);

  type TimelineEntry = { label: string; note: string; at: string };
  const entries: TimelineEntry[] = [];

  for (const entry of actionLog) {
    entries.push({
      label: entry.actionType.replaceAll('_', ' '),
      note: entry.note,
      at: entry.createdAt,
    });
  }

  if (runtimeOverride?.lastAction && runtimeOverride.lastActionAt) {
    const alreadyLogged = actionLog.some((e) => e.createdAt === runtimeOverride.lastActionAt);
    if (!alreadyLogged) {
      entries.unshift({
        label: runtimeOverride.lastAction,
        note: 'Runtime state update',
        at: runtimeOverride.lastActionAt,
      });
    }
  }

  entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return (
    <section style={sectionBlockStyle}>
      <div style={smallLabelStyle(theme)}>Order Activity</div>
      {entries.length === 0 ? (
        <div style={activityEmptyStyle(theme)}>No recorded activity for this order yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
          {entries.slice(0, 6).map((entry, i) => (
            <div key={i} style={activityRowStyle(theme)}>
              <div style={activityDotStyle} />
              <div>
                <div style={activityLabelStyle(theme)}>{entry.label}</div>
                <div style={activityNoteStyle(theme)}>{entry.note}</div>
              </div>
              <div style={activityTimeStyle}>{formatActivityTime(entry.at)}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatActivityTime(iso: string): string {
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString();
  } catch {
    return '';
  }
}

function activityEmptyStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 6,
    padding: '8px 10px',
    borderRadius: 4,
    fontSize: 11,
    color: '#64748b',
    fontWeight: 700,
    background: theme === 'dark' ? 'rgba(15,23,42,0.6)' : '#f8fafc',
    border: theme === 'dark' ? '1px dashed #334155' : '1px dashed #cbd5e1',
  };
}

function activityRowStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: '10px 1fr auto',
    gap: 8,
    alignItems: 'start',
    padding: '6px 8px',
    borderRadius: 4,
    background: theme === 'dark' ? 'rgba(15,23,42,0.7)' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
  };
}

const activityDotStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: '#f97316',
  marginTop: 4,
  flexShrink: 0,
};

function activityLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return { fontSize: 11, fontWeight: 900, color: theme === 'dark' ? '#cbd5e1' : '#334155', textTransform: 'uppercase', letterSpacing: '0.3px' };
}

function activityNoteStyle(theme: 'dark' | 'light'): CSSProperties {
  return { fontSize: 10, color: theme === 'dark' ? '#64748b' : '#94a3b8', marginTop: 1 };
}

const activityTimeStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#64748b',
  whiteSpace: 'nowrap',
};

function formatToken(value: string) {
  return value.replaceAll('_', ' ').replaceAll('-', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatHintList(values: string[]) {
  if (values.length === 0) return 'No finish hint';
  return values.map(formatToken).join(', ');
}

function formatMaterial(value: string) {
  if (value === 'UNKNOWN') return 'No material flag';
  return formatToken(value);
}

function formatQa(value: string) {
  if (value === 'UNKNOWN') return 'No QA flag';
  if (value === 'NOT_REQUIRED') return 'Not Required';
  return formatToken(value);
}

function getSignalColor(signal: DynamicTraveler['visualSignal']) {
  if (signal === 'BLOCKED' || signal === 'HOLD') return '#ef4444';
  if (signal === 'READY') return '#10b981';
  if (signal === 'DONE') return '#64748b';
  return '#f97316';
}

const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(2, 6, 23, 0.78)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

const modalHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  marginBottom: 14,
};

const infoGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
  gap: 12,
  marginTop: 14,
};

const sectionBlockStyle: CSSProperties = {
  marginTop: 16,
};

const listStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
};

const eyebrowStyle: CSSProperties = {
  color: '#f97316',
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
};

const closeButtonStyle: CSSProperties = {
  padding: '9px 11px',
  borderRadius: 6,
  border: '1px solid #f97316',
  background: 'rgba(249,115,22,0.12)',
  color: '#f97316',
  fontSize: 11,
  fontWeight: 900,
  cursor: 'pointer',
};

const openOrdersButtonStyle: CSSProperties = {
  width: '100%',
  marginTop: 16,
  padding: '11px 12px',
  borderRadius: 6,
  border: '1px solid #3b82f6',
  background: 'rgba(59,130,246,0.12)',
  color: '#93c5fd',
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
  letterSpacing: '0.7px',
};

const plantTravelerButtonStyle: CSSProperties = {
  width: '100%',
  marginTop: 12,
  padding: '11px 12px',
  borderRadius: 6,
  border: '1px solid #10b981',
  background: 'rgba(16,185,129,0.12)',
  color: '#10b981',
  fontSize: 12,
  fontWeight: 900,
  cursor: 'pointer',
  letterSpacing: '0.7px',
};

const resourceContextHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
};

const chipRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 10,
};

const reviewListStyle: CSSProperties = {
  margin: '8px 0 0',
  paddingLeft: 18,
};

function modalCardStyle(theme: 'dark' | 'light', color: string): CSSProperties {
  return {
    width: 'min(760px, 100%)',
    maxHeight: '88vh',
    overflow: 'auto',
    padding: 16,
    borderRadius: 10,
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
    border: `1px solid ${color}66`,
    borderLeft: `4px solid ${color}`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
  };
}

function modalTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: '4px 0',
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    letterSpacing: '0.5px',
  };
}

function subTextStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: 12,
    lineHeight: 1.4,
  };
}

function smallLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '1px',
    color: theme === 'dark' ? '#64748b' : '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  };
}

function infoValueStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 13,
    fontWeight: 800,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    lineHeight: 1.35,
  };
}

function instructionBoxStyle(theme: 'dark' | 'light', color: string): CSSProperties {
  return {
    padding: 12,
    borderRadius: 8,
    background: theme === 'dark' ? 'rgba(15,23,42,0.8)' : '#f8fafc',
    border: `1px solid ${color}66`,
  };
}

function instructionTextStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    fontSize: 15,
    fontWeight: 900,
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    lineHeight: 1.4,
  };
}

function productIntelStyle(theme: 'dark' | 'light', needsReview: boolean): CSSProperties {
  const color = needsReview ? '#f97316' : '#10b981';
  return {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    background: theme === 'dark' ? 'rgba(15,23,42,0.9)' : '#f8fafc',
    border: `1px solid ${color}66`,
    borderLeft: `4px solid ${color}`,
  };
}

function reviewBoxStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 12,
    padding: 10,
    borderRadius: 6,
    background: theme === 'dark' ? 'rgba(124,45,18,0.32)' : '#ffedd5',
    border: '1px solid #f97316',
    color: theme === 'dark' ? '#fed7aa' : '#9a3412',
    fontSize: 12,
    lineHeight: 1.45,
    fontWeight: 750,
  };
}

function resourceButtonStyle(theme: 'dark' | 'light', recommended: boolean, selected: boolean): CSSProperties {
  const color = recommended ? '#10b981' : selected ? '#3b82f6' : '#64748b';
  return {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    padding: 10,
    borderRadius: 6,
    background: theme === 'dark' ? 'rgba(15,23,42,0.8)' : '#f8fafc',
    border: `1px solid ${color}`,
    color: theme === 'dark' ? '#cbd5e1' : '#334155',
    fontSize: 12,
    cursor: 'pointer',
    textAlign: 'left',
  };
}

function resourceContextStyle(theme: 'dark' | 'light', recommended: boolean): CSSProperties {
  const color = recommended ? '#10b981' : '#3b82f6';
  return {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    background: theme === 'dark' ? 'rgba(15,23,42,0.9)' : '#f8fafc',
    border: `1px solid ${color}66`,
    borderLeft: `4px solid ${color}`,
  };
}

function resourceTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#e2e8f0' : '#0f172a',
    fontSize: 15,
    fontWeight: 900,
  };
}

function resourceStatusBadgeStyle(status: string, recommended: boolean): CSSProperties {
  const color = recommended ? '#10b981' : status === 'DOWN' ? '#ef4444' : status === 'BUSY' ? '#f97316' : '#64748b';
  return {
    whiteSpace: 'nowrap',
    color,
    border: `1px solid ${color}`,
    background: `${color}1f`,
    borderRadius: 4,
    padding: '5px 8px',
    fontSize: 10,
    fontWeight: 900,
  };
}

function contextNoticeStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 12,
    padding: 10,
    borderRadius: 6,
    background: theme === 'dark' ? '#111827' : '#ffffff',
    border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    fontSize: 12,
    lineHeight: 1.45,
    fontWeight: 700,
  };
}

function miniChipStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#cbd5e1' : '#475569',
    background: theme === 'dark' ? '#1e293b' : '#ffffff',
    border: theme === 'dark' ? '1px solid #334155' : '1px solid #cbd5e1',
    borderRadius: 4,
    padding: '4px 7px',
    fontSize: 10,
    fontWeight: 800,
  };
}

function blockerStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 10,
    borderRadius: 6,
    background: theme === 'dark' ? 'rgba(127,29,29,0.35)' : '#fee2e2',
    border: '1px solid #ef4444',
    color: theme === 'dark' ? '#fecaca' : '#991b1b',
    fontSize: 12,
    fontWeight: 800,
  };
}

function readyNoticeStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 10,
    borderRadius: 6,
    background: theme === 'dark' ? 'rgba(6,78,59,0.32)' : '#dcfce7',
    border: '1px solid #10b981',
    color: theme === 'dark' ? '#bbf7d0' : '#166534',
    fontSize: 12,
    fontWeight: 800,
  };
}

function warningBoxStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    padding: 10,
    borderRadius: 6,
    background: theme === 'dark' ? 'rgba(124,45,18,0.32)' : '#ffedd5',
    border: '1px solid #f97316',
    color: theme === 'dark' ? '#fed7aa' : '#9a3412',
    fontSize: 12,
    fontWeight: 800,
  };
}

function actionRowStyle(theme: 'dark' | 'light', enabled: boolean): CSSProperties {
  const color = enabled ? '#10b981' : '#64748b';
  return {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: 10,
    borderRadius: 6,
    background: theme === 'dark' ? 'rgba(15,23,42,0.8)' : '#f8fafc',
    border: `1px solid ${color}55`,
  };
}

function actionLabelStyle(theme: 'dark' | 'light', enabled: boolean): CSSProperties {
  return {
    color: enabled ? (theme === 'dark' ? '#e2e8f0' : '#0f172a') : '#64748b',
    fontSize: 12,
    fontWeight: 900,
  };
}

function actionReasonStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    color: theme === 'dark' ? '#64748b' : '#64748b',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 1.35,
  };
}

function actionStatusStyle(enabled: boolean): CSSProperties {
  const color = enabled ? '#10b981' : '#64748b';
  return {
    color,
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.8px',
    whiteSpace: 'nowrap',
  };
}

function actionFireButtonStyle(fired: boolean): CSSProperties {
  return {
    padding: '5px 10px',
    borderRadius: 4,
    border: fired ? '1px solid #10b981' : '1px solid #f97316',
    background: fired ? 'rgba(16,185,129,0.15)' : 'rgba(249,115,22,0.15)',
    color: fired ? '#10b981' : '#f97316',
    fontSize: 10,
    fontWeight: 900,
    cursor: fired ? 'default' : 'pointer',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  };
}

function helperTextStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: '0 0 8px',
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: 12,
    lineHeight: 1.4,
    fontWeight: 700,
  };
}
