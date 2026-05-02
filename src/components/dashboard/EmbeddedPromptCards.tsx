import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { AppTab } from '../../types/app';
import type { ProductionOrder } from '../../types/productionOrder';
import { productionOrders } from '../../data/productionOrders';
import {
  applyQuickActionRuntimeIntent,
  type QuickActionRuntimeIntent,
} from '../../logic/quickActionRuntimeExecutor';
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
  type DashboardTone,
} from './dashboardStyles';

type PlantSignal = {
  title: string;
  detail: string;
  actionLabel: string;
  priority: number;
  intent?: QuickActionRuntimeIntent;
  routeTarget: AppTab;
  tone: DashboardTone;
};

type EmbeddedPromptCardsProps = {
  onNavigate: (tab: AppTab) => void;
};

export default function EmbeddedPromptCards({ onNavigate }: EmbeddedPromptCardsProps) {
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

  const signals = useMemo(() => {
    void runtimeVersion;
    return getPlantSignals();
  }, [runtimeVersion]);

  const activeSignalCount = signals.filter((signal) => signal.intent || signal.tone !== 'green').length;
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

function PlantSignalCard({ signal, onNavigate }: { signal: PlantSignal; onNavigate: (tab: AppTab) => void }) {
  const color = getDashboardToneColor(signal.tone);

  return (
    <div style={getDashboardPromptCardStyle(color)}>
      <div style={getDashboardPromptTitleStyle(color)}>{signal.title.toUpperCase()}</div>
      <div style={dashboardPromptDetailStyle}>{signal.detail}</div>
      <button
        type="button"
        style={getDashboardPromptButtonStyle(color)}
        onClick={() => {
          if (signal.intent) {
            applyQuickActionRuntimeIntent(signal.intent, getRuntimeProductionOrders(productionOrders));
          }
          onNavigate(signal.routeTarget);
        }}
      >
        {signal.actionLabel.toUpperCase()}
      </button>
    </div>
  );
}

function getPlantSignals(): PlantSignal[] {
  const orders = getRuntimeProductionOrders(productionOrders);
  const openOrders = orders.filter((order) => order.status !== 'DONE' && order.status !== 'COMPLETE' && order.status !== 'complete');
  const signals: PlantSignal[] = [];

  openOrders.forEach((order) => {
    if (order.qaStatus === 'HOLD' || order.qaStatus === 'FAILED') {
      signals.push({
        title: `QA hold ${order.orderNumber}`,
        detail: `Priority ${formatOrderPriority(order)} quality signal. Review release risk before this order moves downstream.`,
        actionLabel: 'Review QA / Safety',
        priority: 100 + getOrderPriorityScore(order),
        routeTarget: 'risk',
        tone: 'red',
      });
    }

    if (isBlockedOrder(order)) {
      signals.push({
        title: `Blocked order ${order.orderNumber}`,
        detail: `Priority ${formatOrderPriority(order)} blocked flow. Resolve the first blocker before labor is assigned.`,
        actionLabel: 'Resolve first blocker',
        intent: 'RESOLVE_FIRST_BLOCKER',
        priority: 80 + getOrderPriorityScore(order),
        routeTarget: 'orders',
        tone: 'red',
      });
    }

    if (isMaterialIssue(order)) {
      signals.push({
        title: `Material issue ${order.orderNumber}`,
        detail: `Priority ${formatOrderPriority(order)} material gap. Stage or receive material before pushing work forward.`,
        actionLabel: 'Stage material issue',
        intent: 'STAGE_FIRST_MATERIAL_ISSUE',
        priority: 60 + getOrderPriorityScore(order),
        routeTarget: 'receiving',
        tone: 'orange',
      });
    }
  });

  if (signals.length === 0) {
    signals.push({
      title: 'No plant signals active',
      detail: 'No blocked order, material issue, or QA hold is currently driving dashboard action.',
      actionLabel: 'Review workflow',
      priority: 0,
      routeTarget: 'workflow',
      tone: 'green',
    });
  }

  return signals
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3);
}

function isBlockedOrder(order: ProductionOrder): boolean {
  return order.status === 'BLOCKED' || order.status === 'blocked' || order.flowStatus === 'blocked' || order.flowStatus === 'BLOCKED' || (order.blockers?.length ?? 0) > 0;
}

function isMaterialIssue(order: ProductionOrder): boolean {
  return order.materialStatus !== undefined && order.materialStatus !== 'RECEIVED' && order.materialStatus !== 'STAGED';
}

function getOrderPriorityScore(order: ProductionOrder): number {
  if (order.priority === 'critical' || order.priority === 'CRITICAL') return 30;
  if (order.priority === 'hot' || order.priority === 'HOT') return 20;
  return 10;
}

function formatOrderPriority(order: ProductionOrder): string {
  if (order.priority === 'critical' || order.priority === 'CRITICAL') return 'critical';
  if (order.priority === 'hot' || order.priority === 'HOT') return 'hot';
  return 'normal';
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
