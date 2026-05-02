import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { DynamicTraveler, TravelerAction, TravelerResource } from '../../types/dynamicTraveler';
import { generatePlantTraveler } from '../../logic/dynamicTraveler';
import PlantTravelerDetailModal from './PlantTravelerDetailModal';

type TravelerDetailModalProps = {
  traveler: DynamicTraveler;
  theme: 'dark' | 'light';
  onClose: () => void;
  onOpenOrders?: () => void;
};

export default function TravelerDetailModal({ traveler, theme, onClose, onOpenOrders }: TravelerDetailModalProps) {
  const [selectedResource, setSelectedResource] = useState<TravelerResource | null>(traveler.bestResource ?? null);
  const [showPlantTraveler, setShowPlantTraveler] = useState(false);
  const order = traveler.order;
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
          <p style={helperTextStyle(theme)}>These are traveler signals. Disabled writeback actions are shown as locked until the live action flow is connected.</p>
          <div style={listStyle}>
            {visibleActions.map((action) => (
              <ActionRow key={action.type} action={action} theme={theme} />
            ))}
          </div>
        </section>

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
        <Info label="Current Job" value="Not connected yet" theme={theme} />
        <Info label="Queue Impact" value="Traveler queue model pending" theme={theme} />
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

function ActionRow({ action, theme }: { action: TravelerAction; theme: 'dark' | 'light' }) {
  return (
    <div style={actionRowStyle(theme, action.enabled)}>
      <div>
        <div style={actionLabelStyle(theme, action.enabled)}>{action.label}</div>
        {action.reason ? <div style={actionReasonStyle(theme)}>{action.reason}</div> : null}
      </div>
      <span style={actionStatusStyle(action.enabled)}>{action.enabled ? 'SIGNAL' : 'LOCKED'}</span>
    </div>
  );
}

function formatToken(value: string) {
  return value.replaceAll('_', ' ').replaceAll('-', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function helperTextStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    margin: '0 0 8px',
    color: theme === 'dark' ? '#94a3b8' : '#64748b',
    fontSize: 12,
    lineHeight: 1.4,
    fontWeight: 700,
  };
}
