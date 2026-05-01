import { productionOrders } from '../data/productionOrders';
import {
  applyQuickActionRuntimeIntent,
  type QuickActionRuntimeIntent,
} from './quickActionRuntimeExecutor';
import {
  getRuntimeProductionOrders,
  WORKFLOW_RUNTIME_UPDATED_EVENT,
} from './workflowRuntimeState';

const BRIDGE_FLAG = '__jcm_dashboard_quick_action_bridge__';
const PROMPT_CONTAINER_ID = 'jcm-dashboard-embedded-prompts';

type BridgeWindow = Window & {
  [BRIDGE_FLAG]?: boolean;
};

type EmbeddedPrompt = {
  title: string;
  detail: string;
  actionLabel: string;
  intent?: QuickActionRuntimeIntent;
  routeLabel?: string;
  tone: 'red' | 'orange' | 'blue' | 'green' | 'slate';
};

let promptRenderQueued = false;
let promptRenderInProgress = false;
let lastPromptSignature = '';

export function installDashboardQuickActionRuntimeBridge() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const bridgeWindow = window as BridgeWindow;
  if (bridgeWindow[BRIDGE_FLAG]) return;
  bridgeWindow[BRIDGE_FLAG] = true;

  document.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement | null)?.closest('button');
    if (!button) return;

    const section = button.closest('section');
    if (!section?.textContent?.includes('QUICK ACTIONS')) return;

    const label = button.textContent ?? '';
    const orders = getRuntimeProductionOrders(productionOrders);

    if (label.includes('Resolve Blockers') || label.includes('Report Blocked Work')) {
      applyQuickActionRuntimeIntent('RESOLVE_FIRST_BLOCKER', orders);
      queuePromptRender();
      return;
    }

    if (label.includes('Resolve Material Issues') || label.includes('Open Material Issues')) {
      applyQuickActionRuntimeIntent('STAGE_FIRST_MATERIAL_ISSUE', orders);
      queuePromptRender();
      return;
    }

    if (label.includes('Escalate Engineering')) {
      applyQuickActionRuntimeIntent('ESCALATE_FIRST_BLOCKED_ORDER', orders);
      queuePromptRender();
    }
  });

  window.addEventListener(WORKFLOW_RUNTIME_UPDATED_EVENT, queuePromptRender);
  window.addEventListener('storage', queuePromptRender);

  const observer = new MutationObserver((mutations) => {
    if (promptRenderInProgress) return;
    const promptOnlyMutation = mutations.every((mutation) => {
      const target = mutation.target as HTMLElement | null;
      return Boolean(target?.closest?.(`#${PROMPT_CONTAINER_ID}`));
    });
    if (promptOnlyMutation) return;
    queuePromptRender();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  queuePromptRender();
}

function queuePromptRender() {
  if (promptRenderQueued) return;
  promptRenderQueued = true;

  window.setTimeout(() => {
    promptRenderQueued = false;
    renderEmbeddedPrompts();
  }, 50);
}

function renderEmbeddedPrompts() {
  const quickActionsSection = findQuickActionsSection();
  if (!quickActionsSection) return;

  const prompts = getEmbeddedPrompts();
  const nextSignature = JSON.stringify(prompts);
  const existing = document.getElementById(PROMPT_CONTAINER_ID);

  if (existing && nextSignature === lastPromptSignature) return;

  promptRenderInProgress = true;
  existing?.remove();

  if (prompts.length === 0) {
    lastPromptSignature = nextSignature;
    promptRenderInProgress = false;
    return;
  }

  const container = document.createElement('div');
  container.id = PROMPT_CONTAINER_ID;
  container.style.marginTop = '14px';
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
  container.style.gap = '10px';

  prompts.forEach((prompt) => {
    container.appendChild(createPromptCard(prompt));
  });

  quickActionsSection.appendChild(container);
  lastPromptSignature = nextSignature;
  promptRenderInProgress = false;
}

function findQuickActionsSection(): HTMLElement | undefined {
  return Array.from(document.querySelectorAll('section')).find((section) =>
    section.textContent?.includes('QUICK ACTIONS'),
  ) as HTMLElement | undefined;
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
      routeLabel: 'Orders',
      tone: 'red',
    });
  }

  if (materialIssue) {
    prompts.push({
      title: `Material issue ${materialIssue.orderNumber}`,
      detail: 'Material is not fully received. Stage the first material issue before pushing work forward.',
      actionLabel: 'Stage material issue',
      intent: 'STAGE_FIRST_MATERIAL_ISSUE',
      routeLabel: 'Receiving',
      tone: 'orange',
    });
  }

  if (qaHold) {
    prompts.push({
      title: `QA hold ${qaHold.orderNumber}`,
      detail: 'Quality status needs review before the order can flow cleanly.',
      actionLabel: 'Review QA / Safety',
      routeLabel: 'QA / Safety',
      tone: 'blue',
    });
  }

  if (prompts.length === 0) {
    prompts.push({
      title: 'No embedded prompts active',
      detail: 'No blocked order, material issue, or QA hold is currently driving dashboard action.',
      actionLabel: 'Review workflow',
      routeLabel: 'Workflow',
      tone: 'green',
    });
  }

  return prompts.slice(0, 3);
}

function createPromptCard(prompt: EmbeddedPrompt): HTMLElement {
  const color = getPromptColor(prompt.tone);
  const card = document.createElement('div');
  card.style.padding = '12px';
  card.style.borderRadius = '5px';
  card.style.border = `1px solid ${color}55`;
  card.style.borderLeft = `4px solid ${color}`;
  card.style.background = '#0f172a';

  const title = document.createElement('div');
  title.textContent = prompt.title.toUpperCase();
  title.style.color = color;
  title.style.fontSize = '12px';
  title.style.fontWeight = '900';
  title.style.letterSpacing = '0.7px';

  const detail = document.createElement('div');
  detail.textContent = prompt.detail;
  detail.style.color = '#64748b';
  detail.style.fontSize = '12px';
  detail.style.lineHeight = '1.35';
  detail.style.marginTop = '6px';

  const action = document.createElement('button');
  action.type = 'button';
  action.textContent = prompt.actionLabel.toUpperCase();
  action.style.marginTop = '10px';
  action.style.padding = '7px 9px';
  action.style.borderRadius = '4px';
  action.style.border = `1px solid ${color}`;
  action.style.background = `${color}22`;
  action.style.color = color;
  action.style.fontSize = '11px';
  action.style.fontWeight = '900';
  action.style.letterSpacing = '0.6px';
  action.style.cursor = 'pointer';

  action.addEventListener('click', (event) => {
    event.stopPropagation();
    if (prompt.intent) {
      applyQuickActionRuntimeIntent(prompt.intent, getRuntimeProductionOrders(productionOrders));
      queuePromptRender();
    }

    if (prompt.routeLabel) {
      clickQuickActionByLabel(prompt.routeLabel);
    }
  });

  card.appendChild(title);
  card.appendChild(detail);
  card.appendChild(action);
  return card;
}

function clickQuickActionByLabel(label: string) {
  const quickActionsSection = findQuickActionsSection();
  if (!quickActionsSection) return;

  const matchingButton = Array.from(quickActionsSection.querySelectorAll('button')).find(
    (button) => button.textContent?.includes(label) && button.id !== PROMPT_CONTAINER_ID,
  );

  if (matchingButton instanceof HTMLButtonElement) {
    matchingButton.click();
  }
}

function getPromptColor(tone: EmbeddedPrompt['tone']): string {
  if (tone === 'red') return '#dc2626';
  if (tone === 'orange') return '#f97316';
  if (tone === 'blue') return '#3b82f6';
  if (tone === 'green') return '#10b981';
  return '#64748b';
}

installDashboardQuickActionRuntimeBridge();
