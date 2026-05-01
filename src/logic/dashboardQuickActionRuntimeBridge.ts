import { productionOrders } from '../data/productionOrders';
import { applyQuickActionRuntimeIntent } from './quickActionRuntimeExecutor';
import { getRuntimeProductionOrders } from './workflowRuntimeState';

const BRIDGE_FLAG = '__jcm_dashboard_quick_action_bridge__';

type BridgeWindow = Window & {
  [BRIDGE_FLAG]?: boolean;
};

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
      return;
    }

    if (label.includes('Resolve Material Issues') || label.includes('Open Material Issues')) {
      applyQuickActionRuntimeIntent('STAGE_FIRST_MATERIAL_ISSUE', orders);
      return;
    }

    if (label.includes('Escalate Engineering')) {
      applyQuickActionRuntimeIntent('ESCALATE_FIRST_BLOCKED_ORDER', orders);
    }
  });
}
