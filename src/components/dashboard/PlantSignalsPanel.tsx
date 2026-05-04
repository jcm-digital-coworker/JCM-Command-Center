import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { AppTab } from '../../types/app';
import { productionOrders } from '../../data/productionOrders';
import { getPlantSignals, type PlantSignal } from '../../logic/plantSignals';
import {
  getRuntimeProductionOrders,
  WORKFLOW_RUNTIME_UPDATED_EVENT,
} from '../../logic/workflowRuntimeState';
import {
  dashboardPromptDetailStyle,
  dashboardPromptGridStyle,
  getDashboardPromptButtonStyle,
  getDashboardPromptCardStyle,
  getDashboardPromptTitleStyle,
  getDashboardToneColor,
} from './dashboardStyles';

type PlantSignalsPanelProps = {
  onNavigate: (tab: AppTab) => void;
};

export default function PlantSignalsPanel({ onNavigate }: PlantSignalsPanelProps) {
  const [runtimeVersion, setRuntimeVersion] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const refresh = () => setRuntimeVersion((version) => version + 1);
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const runtimeOrders = getRuntimeProductionOrders(productionOrders);
  const signals = useMemo(() => {
    void runtimeVersion;
    return getPlantSignals(runtimeOrders);
  }, [runtimeOrders, runtimeVersion]);

  const activeSignalCount = signals.filter((signal) => signal.tone !== 'green').length;
  const summary = activeSignalCount > 0
    ? `${activeSignalCount} priority signal${activeSignalCount === 1 ? '' : 's'} available`
    : 'No active signal pressure';

  return (
    <section style={signalShellStyle}>
      <button type="button" style={signalToggleStyle} onClick={() => setExpanded((current) => !current)}>
        <span>
          <span style={signalEyebrowStyle}>PLANT SIGNALS</span>
          <span style={signalSummaryStyle}>{summary}</span>
        </span>
        <span style={signalToggleMetaStyle}>{expanded ? 'COLLAPSE' : 'OPEN SIGNALS'}</span>
      </button>

      {expanded && (
        <div style={dashboardPromptGridStyle}>
          {signals.map((signal) => (
            <PlantSignalCard
              key={`${signal.title}-${signal.actionLabel}-${signal.priority}`}
              signal={signal}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function PlantSignalCard({
  signal,
  onNavigate,
}: {
  signal: PlantSignal;
  onNavigate: (tab: AppTab) => void;
}) {
  const color = getDashboardToneColor(signal.tone);

  return (
    <div style={getDashboardPromptCardStyle(color)}>
      <div style={getDashboardPromptTitleStyle(color)}>{signal.title.toUpperCase()}</div>
      <div style={dashboardPromptDetailStyle}>{signal.detail}</div>
      <button
        type="button"
        style={getDashboardPromptButtonStyle(color)}
        onClick={() => onNavigate(signal.routeTarget)}
      >
        {signal.actionLabel.toUpperCase()}
      </button>
    </div>
  );
}

const signalShellStyle: CSSProperties = {
  marginBottom: 16,
};

const signalToggleStyle: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  padding: '13px 14px',
  borderRadius: 6,
  border: '1px solid #334155',
  borderLeft: '4px solid #3b82f6',
  background: 'rgba(15, 23, 42, 0.72)',
  color: '#e2e8f0',
  cursor: 'pointer',
  textAlign: 'left',
  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
};

const signalEyebrowStyle: CSSProperties = {
  display: 'block',
  color: '#3b82f6',
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '0.9px',
  textTransform: 'uppercase',
};

const signalSummaryStyle: CSSProperties = {
  display: 'block',
  marginTop: 4,
  color: '#94a3b8',
  fontSize: 12,
  fontWeight: 700,
};

const signalToggleMetaStyle: CSSProperties = {
  color: '#93c5fd',
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: '0.7px',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};
