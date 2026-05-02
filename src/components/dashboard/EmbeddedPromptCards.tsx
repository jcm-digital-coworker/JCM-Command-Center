import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { AppTab } from '../../types/app';
import { productionOrders } from '../../data/productionOrders';
import {
  applyQuickActionRuntimeIntent,
  type QuickActionRuntimeIntent,
} from '../../logic/quickActionRuntimeExecutor';
import {
  getRuntimeProductionOrders,
  WORKFLOW_RUNTIME_UPDATED_EVENT,
} from '../../logic/workflowRuntimeState';

type EmbeddedPrompt = {
  title: string;
  detail: string;
  actionLabel: string;
  intent?: QuickActionRuntimeIntent;
  routeTarget: AppTab;
  tone: 'red' | 'orange' | 'blue' | 'green' | 'slate';
};

type EmbeddedPromptCardsProps = {
  onNavigate: (tab: AppTab) => void;
};

export default function EmbeddedPromptCards({ onNavigate }: EmbeddedPromptCardsProps) {
  const [runtimeVersion, setRuntimeVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setRuntimeVersion((version) => version + 1);
    window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const prompts = useMemo(() => {
    void runtimeVersion;
    return getEmbeddedPrompts();
  }, [runtimeVersion]);

  return (
    <div style={promptGridStyle}>
      {prompts.map((prompt) => (
        <PromptCard
          key={`${prompt.title}-${prompt.actionLabel}`}
          prompt={prompt}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function PromptCard({ prompt, onNavigate }: { prompt: EmbeddedPrompt; onNavigate: (tab: AppTab) => void }) {
  const color = getPromptColor(prompt.tone);

  return (
    <div style={getCardStyle(color)}>
      <div style={getTitleStyle(color)}>{prompt.title.toUpperCase()}</div>
      <div style={detailStyle}>{prompt.detail}</div>
      <button
        type="button"
        style={getButtonStyle(color)}
        onClick={() => {
          if (prompt.intent) {
            applyQuickActionRuntimeIntent(prompt.intent, getRuntimeProductionOrders(productionOrders));
          }
          onNavigate(prompt.routeTarget);
        }}
      >
        {prompt.actionLabel.toUpperCase()}
      </button>
    </div>
  );
}

function getEmbeddedPrompts(): EmbeddedPrompt[] {
  const orders = getRuntimeProductionOrders(productionOrders);
  const openOrders = orders.filter((order) => order.status !== 'DONE');
  const blockedOrder = openOrders.find((order) =>
    order.status === 'BLOCKED' ||
    order.flowStatus === 'blocked' ||
    order.blockers.length > 0,
  );
  const materialIssue = openOrders.find((order) => order.materialStatus !== 'RECEIVED');
  const qaHold = openOrders.find((order) => order.qaStatus === 'HOLD' || order.qaStatus === 'FAILED');

  const prompts: EmbeddedPrompt[] = [];

  if (blockedOrder) {
    prompts.push({
      title: `Blocked order ${blockedOrder.orderNumber}`,
      detail: 'Workflow is blocked. Resolve the first blocker or escalate before labor is assigned.',
      actionLabel: 'Resolve first blocker',
      intent: 'RESOLVE_FIRST_BLOCKER',
      routeTarget: 'orders',
      tone: 'red',
    });
  }

  if (materialIssue) {
    prompts.push({
      title: `Material issue ${materialIssue.orderNumber}`,
      detail: 'Material is not fully received. Stage the first material issue before pushing work forward.',
      actionLabel: 'Stage material issue',
      intent: 'STAGE_FIRST_MATERIAL_ISSUE',
      routeTarget: 'receiving',
      tone: 'orange',
    });
  }

  if (qaHold) {
    prompts.push({
      title: `QA hold ${qaHold.orderNumber}`,
      detail: 'Quality status needs review before the order can flow cleanly.',
      actionLabel: 'Review QA / Safety',
      routeTarget: 'risk',
      tone: 'blue',
    });
  }

  if (prompts.length === 0) {
    prompts.push({
      title: 'No embedded prompts active',
      detail: 'No blocked order, material issue, or QA hold is currently driving dashboard action.',
      actionLabel: 'Review workflow',
      routeTarget: 'workflow',
      tone: 'green',
    });
  }

  return prompts.slice(0, 3);
}

function getPromptColor(tone: EmbeddedPrompt['tone']): string {
  if (tone === 'red') return '#dc2626';
  if (tone === 'orange') return '#f97316';
  if (tone === 'blue') return '#3b82f6';
  if (tone === 'green') return '#10b981';
  return '#64748b';
}

const promptGridStyle: CSSProperties = {
  marginTop: 14,
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 10,
};

const detailStyle: CSSProperties = {
  color: '#64748b',
  fontSize: 12,
  lineHeight: 1.35,
  marginTop: 6,
};

function getCardStyle(color: string): CSSProperties {
  return {
    padding: 12,
    borderRadius: 5,
    border: `1px solid ${color}55`,
    borderLeft: `4px solid ${color}`,
    background: '#0f172a',
  };
}

function getTitleStyle(color: string): CSSProperties {
  return {
    color,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: '0.7px',
  };
}

function getButtonStyle(color: string): CSSProperties {
  return {
    marginTop: 10,
    padding: '7px 9px',
    borderRadius: 4,
    border: `1px solid ${color}`,
    background: `${color}22`,
    color,
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '0.6px',
    cursor: 'pointer',
  };
}
