import type { ProductionOrder } from '../types/productionOrder';
import {
  applyWorkflowRuntimeAction,
  type WorkflowRuntimeActionKind,
} from './workflowRuntimeState';
import {
  getFirstBlockedOrderNumber,
  getFirstMaterialIssueOrderNumber,
} from './quickActionRuntimeTargets';

export type QuickActionRuntimeIntent =
  | 'RESOLVE_FIRST_BLOCKER'
  | 'STAGE_FIRST_MATERIAL_ISSUE'
  | 'ESCALATE_FIRST_BLOCKED_ORDER';

export type QuickActionRuntimeResult = {
  applied: boolean;
  orderNumber?: string;
  kind?: WorkflowRuntimeActionKind;
  message: string;
};

export function applyQuickActionRuntimeIntent(
  intent: QuickActionRuntimeIntent,
  orders: ProductionOrder[],
): QuickActionRuntimeResult {
  if (intent === 'RESOLVE_FIRST_BLOCKER') {
    const orderNumber = getFirstBlockedOrderNumber(orders);
    return applyIfTargetExists(
      orderNumber,
      'RESOLVE_BLOCKER',
      'Dashboard Quick Action: Resolve Blockers',
      'No blocked order available for runtime update.',
    );
  }

  if (intent === 'STAGE_FIRST_MATERIAL_ISSUE') {
    const orderNumber = getFirstMaterialIssueOrderNumber(orders);
    return applyIfTargetExists(
      orderNumber,
      'MARK_MATERIAL_STAGED',
      'Dashboard Quick Action: Stage Material Issue',
      'No material issue order available for runtime update.',
    );
  }

  if (intent === 'ESCALATE_FIRST_BLOCKED_ORDER') {
    const orderNumber = getFirstBlockedOrderNumber(orders);
    return applyIfTargetExists(
      orderNumber,
      'ESCALATE_ENGINEERING',
      'Dashboard Quick Action: Escalate Engineering',
      'No blocked order available for engineering escalation.',
    );
  }

  return {
    applied: false,
    message: 'No runtime intent matched.',
  };
}

function applyIfTargetExists(
  orderNumber: string | undefined,
  kind: WorkflowRuntimeActionKind,
  note: string,
  fallbackMessage: string,
): QuickActionRuntimeResult {
  if (!orderNumber) {
    return {
      applied: false,
      message: fallbackMessage,
    };
  }

  applyWorkflowRuntimeAction(orderNumber, kind, note);

  return {
    applied: true,
    orderNumber,
    kind,
    message: `${note} applied to order ${orderNumber}.`,
  };
}
