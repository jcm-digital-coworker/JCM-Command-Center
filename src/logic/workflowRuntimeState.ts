import type { ProductionOrder, FlowBlocker } from '../types/productionOrder';
import { productionOrders } from '../data/productionOrders';

export type WorkflowRuntimeActionKind =
  | 'REQUEST_MATERIAL'
  | 'MARK_MATERIAL_STAGED'
  | 'ESCALATE_ENGINEERING'
  | 'ACKNOWLEDGE_ORDER'
  | 'START_WORK'
  | 'RESOLVE_BLOCKER';

export type RuntimeOrderOverride = Partial<Pick<
  ProductionOrder,
  | 'materialStatus'
  | 'engineeringStatus'
  | 'productionSupervisorAcknowledged'
  | 'status'
  | 'flowStatus'
  | 'blockers'
>> & {
  lastAction?: string;
  lastActionAt?: string;
};

export type WorkflowRuntimeState = Record<string, RuntimeOrderOverride>;

const STORAGE_KEY = 'jcm_workflow_runtime_state';
export const WORKFLOW_RUNTIME_UPDATED_EVENT = 'jcm-workflow-runtime-state-updated';

export function getWorkflowRuntimeState(): WorkflowRuntimeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WorkflowRuntimeState) : {};
  } catch {
    return {};
  }
}

export function getRuntimeOrder(order: ProductionOrder): ProductionOrder {
  const override = getWorkflowRuntimeState()[order.orderNumber];
  return override ? { ...order, ...override } : order;
}

export function getRuntimeProductionOrders(orders: ProductionOrder[] = productionOrders): ProductionOrder[] {
  return orders.map(getRuntimeOrder);
}

export function applyWorkflowRuntimeAction(orderNumber: string, actionKind: WorkflowRuntimeActionKind, note?: string): RuntimeOrderOverride {
  const currentState = getWorkflowRuntimeState();
  const baseOrder = productionOrders.find((order) => order.orderNumber === orderNumber);
  const currentOrder = baseOrder ? getRuntimeOrder(baseOrder) : undefined;
  const nextOverride = reduceRuntimeAction(currentOrder, actionKind, note);
  const updatedState = {
    ...currentState,
    [orderNumber]: {
      ...(currentState[orderNumber] ?? {}),
      ...nextOverride,
      lastAction: note ?? actionKind,
      lastActionAt: new Date().toISOString(),
    },
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
  window.dispatchEvent(new Event(WORKFLOW_RUNTIME_UPDATED_EVENT));
  return updatedState[orderNumber];
}

export function clearWorkflowRuntimeState() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(WORKFLOW_RUNTIME_UPDATED_EVENT));
}

function reduceRuntimeAction(order: ProductionOrder | undefined, actionKind: WorkflowRuntimeActionKind, note?: string): RuntimeOrderOverride {
  if (actionKind === 'REQUEST_MATERIAL') {
    return {
      materialStatus: 'ORDER_REQUIRED',
      status: 'BLOCKED',
      flowStatus: 'blocked',
    };
  }

  if (actionKind === 'MARK_MATERIAL_STAGED') {
    return {
      materialStatus: 'STAGED',
      blockers: removeBlockers(order?.blockers ?? [], 'material'),
    };
  }

  if (actionKind === 'ESCALATE_ENGINEERING') {
    return {
      engineeringStatus: 'PENDING',
      status: 'HOLD',
      flowStatus: 'blocked',
    };
  }

  if (actionKind === 'ACKNOWLEDGE_ORDER') {
    return {
      productionSupervisorAcknowledged: true,
    };
  }

  if (actionKind === 'START_WORK') {
    return {
      status: 'IN_PROGRESS',
      flowStatus: order?.blockers?.length ? 'blocked' : 'runnable',
    };
  }

  if (actionKind === 'RESOLVE_BLOCKER') {
    return {
      blockers: [],
      flowStatus: 'runnable',
      status: 'READY',
    };
  }

  return {
    lastAction: note ?? actionKind,
  };
}

function removeBlockers(blockers: FlowBlocker[], type: FlowBlocker['type']): FlowBlocker[] {
  return blockers.filter((blocker) => blocker.type !== type);
}
