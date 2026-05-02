import React from 'react';
import ReactDOM from 'react-dom/client';
import type { Root } from 'react-dom/client';
import type { AppTab } from '../types/app';
import EmbeddedPromptCards from '../components/dashboard/EmbeddedPromptCards';

export const JCM_NAVIGATE_EVENT = 'jcm:navigate';

const BRIDGE_FLAG = '__jcm_dashboard_quick_action_bridge__';
const PROMPT_CONTAINER_ID = 'jcm-dashboard-embedded-prompts';

type BridgeWindow = Window & {
  [BRIDGE_FLAG]?: boolean;
};

let mountQueued = false;
let promptRoot: Root | null = null;

export function installDashboardQuickActionRuntimeBridge() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const bridgeWindow = window as BridgeWindow;
  if (bridgeWindow[BRIDGE_FLAG]) return;
  bridgeWindow[BRIDGE_FLAG] = true;

  const observer = new MutationObserver(queuePromptMount);
  observer.observe(document.body, { childList: true, subtree: true });

  queuePromptMount();
}

function queuePromptMount() {
  if (mountQueued) return;
  mountQueued = true;

  window.setTimeout(() => {
    mountQueued = false;
    mountEmbeddedPromptCards();
  }, 50);
}

function mountEmbeddedPromptCards() {
  const quickActionsSection = findQuickActionsSection();
  if (!quickActionsSection) {
    unmountEmbeddedPromptCards();
    return;
  }

  let container = document.getElementById(PROMPT_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = PROMPT_CONTAINER_ID;
    quickActionsSection.appendChild(container);
  }

  if (!promptRoot) {
    promptRoot = ReactDOM.createRoot(container);
  }

  promptRoot.render(
    React.createElement(EmbeddedPromptCards, {
      onNavigate: dispatchNavigation,
    }),
  );
}

function unmountEmbeddedPromptCards() {
  promptRoot?.unmount();
  promptRoot = null;
  document.getElementById(PROMPT_CONTAINER_ID)?.remove();
}

function findQuickActionsSection(): HTMLElement | undefined {
  return Array.from(document.querySelectorAll('section')).find((section) =>
    section.textContent?.includes('QUICK ACTIONS'),
  ) as HTMLElement | undefined;
}

function dispatchNavigation(tab: AppTab) {
  window.dispatchEvent(new CustomEvent<{ tab: AppTab }>(JCM_NAVIGATE_EVENT, { detail: { tab } }));
}

installDashboardQuickActionRuntimeBridge();
