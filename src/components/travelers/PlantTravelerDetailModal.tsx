import type { CSSProperties } from 'react';
import type { DynamicTraveler, PlantTraveler } from '../../types/dynamicTraveler';

type PlantTravelerDetailModalProps = {
  plantTraveler: PlantTraveler;
  theme: 'dark' | 'light';
  onClose: () => void;
};

export default function PlantTravelerDetailModal({ plantTraveler, theme, onClose }: PlantTravelerDetailModalProps) {
  const order = plantTraveler.order;
  const signalColor = getPlantStatusColor(plantTraveler.overallStatus);

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalCardStyle(theme, signalColor)} onClick={(event) => event.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <div style={eyebrowStyle}>FULL PLANT TRAVELER</div>
            <h3 style={modalTitleStyle(theme)}>#{order.orderNumber}</h3>
            <div style={subTextStyle(theme)}>{order.productFamily}</div>
          </div>
          <button type="button" style={closeButtonStyle} onClick={onClose}>CLOSE</button>
        </div>

        <div style={plantInstructionStyle(theme, signalColor)}>
          <div style={smallLabelStyle(theme)}>Plant Instruction</div>
          <div style={instructionTextStyle(theme)}>{plantTraveler.currentInstruction}</div>
        </div>

        <div style={progressShellStyle(theme)}>
          <div style={progressTopRowStyle}>
            <div>
              <div style={smallLabelStyle(theme)}>Whole Order Completion</div>
              <strong style={progressTextStyle(theme)}>{plantTraveler.completionPercent}%</strong>
            </div>
            <span style={statusBadgeStyle(signalColor)}>{formatToken(plantTraveler.overallStatus)}</span>
          </div>
          <div style={progressTrackStyle(theme)}>
            <div style={progressFillStyle(signalColor, plantTraveler.completionPercent)} />
          </div>
          <div style={progressSubTextStyle(theme)}>
            {plantTraveler.completedStepCount} of {plantTraveler.totalStepCount} department steps complete
          </div>
        </div>

        <div style={infoGridStyle}>
          <Info label="Active Department" value={plantTraveler.activeDepartment ?? 'Not assigned'} theme={theme} />
          <Info label="Next Department" value={plantTraveler.nextDepartment ?? 'Not assigned'} theme={theme} />
          <Info label="Priority" value={formatToken(String(order.priority ?? 'normal'))} theme={theme} />
          <Info label="Ship Date" value={order.projectedShipDate ?? 'Not scheduled'} theme={theme} />
        </div>

        <ProductIntelligencePanel plantTraveler={plantTraveler} theme={theme} />

        <section style={sectionBlockStyle}>
          <div style={smallLabelStyle(theme)}>Plant Route</div>
          <div style={routeListStyle}>
            {plantTraveler.departmentSteps.map((step, index) => (
              <DepartmentStepCard key={step.id} step={step} index={index} theme={theme} />
            ))}
          </div>
        </section>

        <section style={sectionBlockStyle}>
          <div style={smallLabelStyle(theme)}>Plant Blockers</div>
          {plantTraveler.blockers.length > 0 ? (
            <div style={listStyle}>
              {plantTraveler.blockers.map((blocker, index) => (
                <div key={`${blocker.type}-${index}`} style={blockerStyle(theme)}>
                  {formatToken(blocker.type)}: {blocker.message}
                </div>
              ))}
            </div>
          ) : (
            <div style={readyNoticeStyle(theme)}>No plant-level blocker is listed for this order.</div>
          )}
        </section>
      </div>
    </div>
  );
}

function ProductIntelligencePanel({ plantTraveler, theme }: { plantTraveler: PlantTraveler; theme: 'dark' | 'light' }) {
  const classification = plantTraveler.productClassification;
  const reviewReasons = plantTraveler.classificationReviewReasons;
  const matchedLabel = classification.matchedRule?.label ?? 'No matched model rule';
  const routeLabel = plantTraveler.suggestedRoute.length > 0 ? plantTraveler.suggestedRoute.join(' → ') : 'No suggested route';

  return (
    <section style={productIntelStyle(theme, reviewReasons.length > 0)}>
      <div style={smallLabelStyle(theme)}>Product Intelligence</div>
      <div style={infoGridStyle}>
        <Info label="Model Signal" value={classification.modelSignal ?? 'Not found'} theme={theme} />
        <Info label="Matched Rule" value={matchedLabel} theme={theme} />
        <Info label="Product Family" value={formatToken(classification.productFamily)} theme={theme} />
        <Info label="Material" value={formatToken(classification.materialClass)} theme={theme} />
        <Info label="Finish Hint" value={formatHintList(plantTraveler.finishHints)} theme={theme} />
        <Info label="QA Required" value={plantTraveler.qaRequired ? 'Yes' : 'No'} theme={theme} />
        <Info label="Confidence" value={formatToken(classification.confidence)} theme={theme} />
        <Info label="Suggested Route" value={routeLabel} theme={theme} />
      </div>

      {reviewReasons.length > 0 ? (
        <div style={reviewBoxStyle(theme)}>
          <strong>Needs review before automatic dispatch:</strong>
          <ul style={reviewListStyle}>
            {reviewReasons.slice(0, 5).map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={readyNoticeStyle(theme)}>No classification review warning is listed for this plant traveler.</div>
      )}
    </section>
  );
}

function DepartmentStepCard({ step, index, theme }: { step: DynamicTraveler; index: number; theme: 'dark' | 'light' }) {
  const color = getStepColor(step.stepStatus);

  return (
    <article style={stepCardStyle(theme, color)}>
      <div style={stepHeaderStyle}>
        <div>
          <div style={stepNumberStyle(color)}>STEP {index + 1}</div>
          <strong style={stepTitleStyle(theme)}>{step.department}</strong>
        </div>
        <span style={statusBadgeStyle(color)}>{formatToken(step.stepStatus)}</span>
      </div>

      <p style={stepInstructionStyle(theme)}>{step.currentInstruction}</p>

      <div style={infoGridStyle}>
        <Info label="Resource" value={step.bestResource?.label ?? 'No capable resource'} theme={theme} />
        <Info label="Next" value={step.nextHandoff ?? 'Not assigned'} theme={theme} />
        <Info label="Material" value={formatToken(String(step.materialStatus))} theme={theme} />
        <Info label="QA" value={formatToken(String(step.qaStatus))} theme={theme} />
      </div>

      {step.blockers.length > 0 ? (
        <div style={miniBlockerStyle(theme)}>{step.blockers[0].message}</div>
      ) : null}
    </article>
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

function formatToken(value: string) {
  return value.replaceAll('_', ' ').replaceAll('-', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatHintList(values: string[]) {
  if (values.length === 0) return 'No finish hint';
  return values.map(formatToken).join(', ');
}

function getPlantStatusColor(status: PlantTraveler['overallStatus']) {
  if (status === 'BLOCKED' || status === 'HOLD') return '#ef4444';
  if (status === 'READY' || status === 'ACTIVE') return '#10b981';
  if (status === 'COMPLETE') return '#64748b';
  return '#f97316';
}

function getStepColor(status: DynamicTraveler['stepStatus']) {
  if (status === 'BLOCKED' || status === 'HOLD') return '#ef4444';
  if (status === 'READY' || status === 'ACTIVE') return '#10b981';
  if (status === 'DONE') return '#64748b';
  return '#f97316';
}

const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1100,
  background: 'rgba(2, 6, 23, 0.82)',
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

const sectionBlockStyle: CSSProperties = { marginTop: 16 };
const listStyle: CSSProperties = { display: 'grid', gap: 8 };
const routeListStyle: CSSProperties = { display: 'grid', gap: 10 };
const stepHeaderStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' };
const progressTopRowStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' };

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

const reviewListStyle: CSSProperties = {
  margin: '8px 0 0',
  paddingLeft: 18,
};

function modalCardStyle(theme: 'dark' | 'light', color: string): CSSProperties {
  return {
    width: 'min(860px, 100%)',
    maxHeight: '88vh',
    overflow: 'auto',
    padding: 16,
    borderRadius: 10,
    background: theme === 'dark' ? '#0f172a' : '#ffffff',
    border: `1px solid ${color}66`,
    borderLeft: `4px solid ${color}`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  };
}

function modalTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return { margin: '4px 0', color: theme === 'dark' ? '#e2e8f0' : '#0f172a', letterSpacing: '0.5px' };
}

function subTextStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, lineHeight: 1.4 };
}

function smallLabelStyle(theme: 'dark' | 'light'): CSSProperties {
  return { fontSize: 10, fontWeight: 900, letterSpacing: '1px', color: theme === 'dark' ? '#64748b' : '#64748b', textTransform: 'uppercase', marginBottom: 4 };
}

function infoValueStyle(theme: 'dark' | 'light'): CSSProperties {
  return { fontSize: 13, fontWeight: 800, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', lineHeight: 1.35 };
}

function instructionTextStyle(theme: 'dark' | 'light'): CSSProperties {
  return { fontSize: 15, fontWeight: 900, color: theme === 'dark' ? '#e2e8f0' : '#0f172a', lineHeight: 1.4 };
}

function plantInstructionStyle(theme: 'dark' | 'light', color: string): CSSProperties {
  return {
    padding: 12,
    borderRadius: 8,
    background: theme === 'dark' ? 'rgba(15,23,42,0.8)' : '#f8fafc',
    border: `1px solid ${color}66`,
  };
}

function progressShellStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 14,
    padding: 12,
    borderRadius: 8,
    background: theme === 'dark' ? '#111827' : '#f8fafc',
    border: theme === 'dark' ? '1px solid #1e293b' : '1px solid #e2e8f0',
  };
}

function progressTextStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 24, letterSpacing: '0.5px' };
}

function progressTrackStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    height: 10,
    borderRadius: 999,
    background: theme === 'dark' ? '#1e293b' : '#e2e8f0',
    overflow: 'hidden',
    marginTop: 10,
  };
}

function progressFillStyle(color: string, percent: number): CSSProperties {
  return { height: '100%', width: `${Math.max(0, Math.min(100, percent))}%`, background: color, borderRadius: 999 };
}

function progressSubTextStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 700, marginTop: 8 };
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

function stepCardStyle(theme: 'dark' | 'light', color: string): CSSProperties {
  return {
    padding: 12,
    borderRadius: 8,
    background: theme === 'dark' ? '#111827' : '#f8fafc',
    border: `1px solid ${color}55`,
    borderLeft: `4px solid ${color}`,
  };
}

function stepNumberStyle(color: string): CSSProperties {
  return { color, fontSize: 10, fontWeight: 900, letterSpacing: '1px', marginBottom: 2 };
}

function stepTitleStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#e2e8f0' : '#0f172a', fontSize: 15 };
}

function stepInstructionStyle(theme: 'dark' | 'light'): CSSProperties {
  return { color: theme === 'dark' ? '#cbd5e1' : '#475569', fontSize: 13, fontWeight: 800, lineHeight: 1.4, margin: '10px 0 0' };
}

function statusBadgeStyle(color: string): CSSProperties {
  return { whiteSpace: 'nowrap', color, border: `1px solid ${color}`, background: `${color}1f`, borderRadius: 4, padding: '5px 8px', fontSize: 10, fontWeight: 900 };
}

function miniBlockerStyle(theme: 'dark' | 'light'): CSSProperties {
  return {
    marginTop: 10,
    padding: 9,
    borderRadius: 6,
    background: theme === 'dark' ? 'rgba(127,29,29,0.35)' : '#fee2e2',
    border: '1px solid #ef4444',
    color: theme === 'dark' ? '#fecaca' : '#991b1b',
    fontSize: 12,
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
