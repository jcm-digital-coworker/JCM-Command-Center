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
import {
  dashboardPromptDetailStyle,
  dashboardPromptGridStyle,
  getDashboardPromptButtonStyle,
  getDashboardPromptCardStyle,
  getDashboardPromptTitleStyle,
  getDashboardToneColor,
  type DashboardTone,
} from './dashboardStyles';

type EmbeddedPrompt = {
  title: string;
  detail: string;
  actionLabel: string;
  intent?: QuickActionRuntimeIntent;
  routeTarget: AppTab;
  tone: DashboardTone;
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
    <div style={dashboardPromptGridStyle}>
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
  const color = getDashboardToneColor(prompt.tone);

  return (
    <div style={getDashboardPromptCardStyle(color)}>
      <div style={getDashboardPromptTitleStyle(color)}>{prompt.title.toUpperCase()}</div>
      <div style={dashboardPromptDetailStyle}>{prompt.detail}</div>
      <button
        type="button"
        style={getDashboardPromptButtonStyle(color)}
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
