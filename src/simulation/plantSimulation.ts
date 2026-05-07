import type { Department } from '../types/machine';
import type { FlowBlocker, ProductionOrder } from '../types/productionOrder';
import { productionOrders } from '../data/productionOrders';
import {
  applyWorkflowRuntimeAction,
  clearWorkflowRuntimeState,
  getRuntimeProductionOrders,
  getWorkflowRuntimeState,
  type RuntimeOrderOverride,
  type WorkflowRuntimeActionKind,
} from '../logic/workflowRuntimeState';

export const PLANT_SIMULATION_UPDATED_EVENT = 'jcm-plant-simulation-updated';

const STORAGE_KEY = 'jcm_plant_simulation_session';
const EVENT_LOG_STORAGE_KEY = 'jcm_plant_simulation_events';

export type PlantSimulationStep = {
  id: string;
  title: string;
  description: string;
  actionKind: WorkflowRuntimeActionKind;
  note: string;
  extraOverrides?: Partial<RuntimeOrderOverride>;
  expectedEffects?: string[];
};

export type PlantSimulationScenario = {
  id: string;
  name: string;
  description: string;
  orderNumber: string;
  steps: PlantSimulationStep[];
};

export type PlantSimulationSession = {
  enabled: boolean;
  scenarioId: string;
  orderNumber: string;
  nextStepIndex: number;
  startedAt: string;
  lastStepId?: string;
  lastStepTitle?: string;
};

export type PlantSimulationOrderSummary = {
  currentDepartment: string;
  nextDepartment: string;
  status: string;
  flowStatus: string;
  materialStatus: string;
  engineeringStatus: string;
  qaStatus: string;
  blockedReason: string;
  blockerCount: number;
  blockerTypes: string;
  lastAction: string;
};

export type PlantSimulationChangedField = {
  field: keyof PlantSimulationOrderSummary;
  before: string | number;
  after: string | number;
};

export type PlantSimulationEventRecord = {
  id: string;
  stepId: string;
  stepIndex: number;
  title: string;
  description: string;
  actionKind: WorkflowRuntimeActionKind;
  note: string;
  orderNumber: string;
  occurredAt: string;
  before: PlantSimulationOrderSummary;
  after: PlantSimulationOrderSummary;
  changes: PlantSimulationChangedField[];
  expectedEffects: string[];
};

export type PlantSimulationSnapshot = {
  session: PlantSimulationSession | null;
  scenario: PlantSimulationScenario | null;
  activeOrder: ProductionOrder | null;
  nextStep: PlantSimulationStep | null;
  completedSteps: number;
  totalSteps: number;
  runtimeOverrideCount: number;
  eventLog: PlantSimulationEventRecord[];
  lastEvent: PlantSimulationEventRecord | null;
};

export function getPlantSimulationSnapshot(): PlantSimulationSnapshot {
  const scenario = getPlantDayScenario();
  const session = getPlantSimulationSession();
  const runtimeOrders = getRuntimeProductionOrders();
  const orderNumber = session?.orderNumber ?? scenario?.orderNumber;
  const activeOrder = orderNumber ? runtimeOrders.find((order) => order.orderNumber === orderNumber) ?? null : null;
  const totalSteps = scenario?.steps.length ?? 0;
  const nextStepIndex = Math.min(session?.nextStepIndex ?? 0, totalSteps);
  const eventLog = getPlantSimulationEventLog();

  return {
    session,
    scenario,
    activeOrder,
    nextStep: scenario?.steps[nextStepIndex] ?? null,
    completedSteps: nextStepIndex,
    totalSteps,
    runtimeOverrideCount: Object.keys(getWorkflowRuntimeState()).length,
    eventLog,
    lastEvent: eventLog[0] ?? null,
  };
}

export function startPlantSimulation(): PlantSimulationSnapshot {
  const scenario = requireScenario();
  clearPlantSimulationEventLog();
  clearWorkflowRuntimeState();
  writeSession({
    enabled: true,
    scenarioId: scenario.id,
    orderNumber: scenario.orderNumber,
    nextStepIndex: 0,
    startedAt: new Date().toISOString(),
  });
  return advancePlantSimulationStep();
}

export function advancePlantSimulationStep(): PlantSimulationSnapshot {
  const scenario = requireScenario();
  const session = getPlantSimulationSession() ?? {
    enabled: true,
    scenarioId: scenario.id,
    orderNumber: scenario.orderNumber,
    nextStepIndex: 0,
    startedAt: new Date().toISOString(),
  };
  const step = scenario.steps[session.nextStepIndex];

  if (!step) {
    writeSession(session);
    return getPlantSimulationSnapshot();
  }

  const beforeOrder = getRuntimeProductionOrders().find((order) => order.orderNumber === scenario.orderNumber);
  const before = summarizeOrder(beforeOrder);
  applyWorkflowRuntimeAction(scenario.orderNumber, step.actionKind, step.note, step.extraOverrides);
  const afterOrder = getRuntimeProductionOrders().find((order) => order.orderNumber === scenario.orderNumber);
  const after = summarizeOrder(afterOrder);
  appendPlantSimulationEvent({
    id: `${Date.now()}-${step.id}`,
    stepId: step.id,
    stepIndex: session.nextStepIndex + 1,
    title: step.title,
    description: step.description,
    actionKind: step.actionKind,
    note: step.note,
    orderNumber: scenario.orderNumber,
    occurredAt: new Date().toISOString(),
    before,
    after,
    changes: getSummaryChanges(before, after),
    expectedEffects: step.expectedEffects ?? [],
  });

  writeSession({
    ...session,
    enabled: true,
    scenarioId: scenario.id,
    orderNumber: scenario.orderNumber,
    nextStepIndex: session.nextStepIndex + 1,
    lastStepId: step.id,
    lastStepTitle: step.title,
  });
  return getPlantSimulationSnapshot();
}

export function resetPlantSimulation(): PlantSimulationSnapshot {
  localStorage.removeItem(STORAGE_KEY);
  clearPlantSimulationEventLog();
  clearWorkflowRuntimeState();
  dispatchSimulationUpdated();
  return getPlantSimulationSnapshot();
}

export function getPlantSimulationSession(): PlantSimulationSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlantSimulationSession) : null;
  } catch {
    return null;
  }
}

export function getPlantSimulationEventLog(): PlantSimulationEventRecord[] {
  try {
    const raw = localStorage.getItem(EVENT_LOG_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlantSimulationEventRecord[]) : [];
  } catch {
    return [];
  }
}

export function getPlantDayScenario(): PlantSimulationScenario | null {
  const order = getScenarioOrder();
  if (!order) return null;

  const route = getRoute(order);
  const receiving = pickDepartment(route, 'Receiving', order.currentDepartment);
  const productionOwner = pickFirstDepartment(route, ['Machine Shop', 'Material Handling', 'Fab', 'Coating', 'Saddles Dept', 'Assembly']) ?? order.currentDepartment;
  const laterOwner = pickFirstDepartment(route, ['Coating', 'Assembly', 'Shipping']) ?? order.nextDepartment ?? 'Shipping';
  const finalOwner = pickDepartment(route, 'Shipping', laterOwner);

  return {
    id: 'plant-day-diagnostic-v1',
    name: 'Plant Day Diagnostic',
    description: 'A deterministic DEV-only plant day that moves one order through material, work, engineering hold, release, handoff, and completion states.',
    orderNumber: order.orderNumber,
    steps: [
      {
        id: 'ready-in-receiving',
        title: 'Stage order in Receiving',
        description: 'Seeds the diagnostic order into a runnable Receiving state without touching source data.',
        actionKind: 'ACKNOWLEDGE_ORDER',
        note: 'Simulation: order staged in Receiving',
        extraOverrides: {
          currentDepartment: receiving,
          nextDepartment: productionOwner,
          status: 'READY',
          flowStatus: 'RUNNABLE',
          materialStatus: 'NOT_RECEIVED',
          engineeringStatus: 'NOT_REQUIRED',
          qaStatus: 'NOT_REQUIRED',
          blockers: [],
        },
        expectedEffects: ['Diagnostic order shows Receiving as current department', 'Flow is runnable but material is not received', 'No blockers are listed yet'],
      },
      {
        id: 'material-blocker',
        title: 'Inject material blocker',
        description: 'Adds a real blocker so dashboard counts, traveler state, and action buttons can be checked.',
        actionKind: 'REQUEST_MATERIAL',
        note: 'Simulation: material missing at Receiving',
        extraOverrides: {
          currentDepartment: receiving,
          nextDepartment: productionOwner,
          blockers: [materialBlocker()],
          blockedReason: 'WAITING_ON_MATERIAL',
        },
        expectedEffects: ['Blocked count should increase', 'Order detail should show a material blocker', 'Workflow action should point toward material/request context'],
      },
      {
        id: 'material-arrived',
        title: 'Material arrives',
        description: 'Clears only material blockers through the runtime material-staged action.',
        actionKind: 'MARK_MATERIAL_STAGED',
        note: 'Simulation: material staged and ready',
        extraOverrides: {
          currentDepartment: receiving,
          nextDepartment: productionOwner,
          blockedReason: undefined,
        },
        expectedEffects: ['Material status should show staged', 'Material blockers should clear', 'Flow should return to runnable when no other blockers remain'],
      },
      {
        id: 'handoff-to-production',
        title: `Handoff to ${productionOwner}`,
        description: 'Moves the order to the next production owner as a real runtime override.',
        actionKind: 'ADVANCE_DEPARTMENT',
        note: `Simulation: handoff to ${productionOwner}`,
        extraOverrides: {
          currentDepartment: productionOwner,
          nextDepartment: laterOwner,
          status: 'READY',
          flowStatus: 'RUNNABLE',
          blockers: [],
        },
        expectedEffects: ['Current department should become the production owner', 'Downstream pages should show the order in the new department', 'Order remains ready and runnable'],
      },
      {
        id: 'start-production-work',
        title: `Start work in ${productionOwner}`,
        description: 'Marks the order active so station and dashboard surfaces show an in-progress order.',
        actionKind: 'START_WORK',
        note: `Simulation: ${productionOwner} started work`,
        extraOverrides: {
          currentDepartment: productionOwner,
          nextDepartment: laterOwner,
          blockers: [],
        },
        expectedEffects: ['Status should become in progress', 'Runtime last action should show the simulated start-work event', 'No blockers should be introduced'],
      },
      {
        id: 'engineering-hold',
        title: 'Inject Engineering hold',
        description: 'Adds an engineering-owned blocker without clearing production state magically.',
        actionKind: 'ESCALATE_ENGINEERING',
        note: 'Simulation: engineering review required',
        extraOverrides: {
          currentDepartment: productionOwner,
          nextDepartment: 'Engineering',
          engineeringStatus: 'PENDING',
          blockers: [engineeringBlocker()],
          blockedReason: 'ENGINEERING_HOLD',
        },
        expectedEffects: ['Order should become blocked/held', 'Next owner should point at Engineering', 'Engineering review copy should not claim the issue is resolved'],
      },
      {
        id: 'engineering-release',
        title: 'Engineering releases order',
        description: 'Clears the engineering hold through an explicit simulation event.',
        actionKind: 'RESOLVE_BLOCKER',
        note: 'Simulation: engineering released order',
        extraOverrides: {
          currentDepartment: productionOwner,
          nextDepartment: laterOwner,
          engineeringStatus: 'RELEASED',
          status: 'READY',
          flowStatus: 'RUNNABLE',
          blockers: [],
          blockedReason: undefined,
        },
        expectedEffects: ['Engineering status should show released', 'Blockers should clear', 'Order should become runnable again'],
      },
      {
        id: 'handoff-later-owner',
        title: `Handoff to ${laterOwner}`,
        description: 'Advances the order after the hold clears so downstream pages should update.',
        actionKind: 'ADVANCE_DEPARTMENT',
        note: `Simulation: handoff to ${laterOwner}`,
        extraOverrides: {
          currentDepartment: laterOwner,
          nextDepartment: finalOwner === laterOwner ? undefined : finalOwner,
          status: 'READY',
          flowStatus: 'RUNNABLE',
          blockers: [],
        },
        expectedEffects: ['Current department should update to the downstream owner', 'Dashboard and traveler should agree on current department', 'No blocker should be carried forward'],
      },
      {
        id: 'complete-order',
        title: 'Complete diagnostic order',
        description: 'Completes the simulation order so closed-state surfaces can be verified.',
        actionKind: 'COMPLETE_ORDER',
        note: 'Simulation: diagnostic order completed',
        extraOverrides: {
          currentDepartment: finalOwner,
          nextDepartment: undefined,
        },
        expectedEffects: ['Status should show done/complete', 'Next department should clear', 'Closed-state surfaces should not show active blocker language'],
      },
    ],
  };
}

function appendPlantSimulationEvent(event: PlantSimulationEventRecord) {
  const current = getPlantSimulationEventLog();
  localStorage.setItem(EVENT_LOG_STORAGE_KEY, JSON.stringify([event, ...current].slice(0, 20)));
}

function clearPlantSimulationEventLog() {
  localStorage.removeItem(EVENT_LOG_STORAGE_KEY);
}

function summarizeOrder(order: ProductionOrder | undefined): PlantSimulationOrderSummary {
  return {
    currentDepartment: text(order?.currentDepartment),
    nextDepartment: text(order?.nextDepartment),
    status: text(order?.status),
    flowStatus: text(order?.flowStatus),
    materialStatus: text(order?.materialStatus),
    engineeringStatus: text(order?.engineeringStatus),
    qaStatus: text(order?.qaStatus),
    blockedReason: text(order?.blockedReason),
    blockerCount: order?.blockers?.length ?? 0,
    blockerTypes: order?.blockers?.map((blocker) => blocker.type).join(', ') || 'none',
    lastAction: text((order as ProductionOrder & { lastAction?: string } | undefined)?.lastAction),
  };
}

function getSummaryChanges(before: PlantSimulationOrderSummary, after: PlantSimulationOrderSummary): PlantSimulationChangedField[] {
  return (Object.keys(before) as (keyof PlantSimulationOrderSummary)[])
    .filter((field) => before[field] !== after[field])
    .map((field) => ({ field, before: before[field], after: after[field] }));
}

function writeSession(session: PlantSimulationSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  dispatchSimulationUpdated();
}

function dispatchSimulationUpdated() {
  window.dispatchEvent(new Event(PLANT_SIMULATION_UPDATED_EVENT));
}

function requireScenario(): PlantSimulationScenario {
  const scenario = getPlantDayScenario();
  if (!scenario) throw new Error('No production orders are available for plant simulation.');
  return scenario;
}

function getScenarioOrder(): ProductionOrder | undefined {
  return productionOrders.find((order) => (order.requiredDepartments?.length ?? 0) >= 3)
    ?? productionOrders.find((order) => order.nextDepartment)
    ?? productionOrders[0];
}

function getRoute(order: ProductionOrder): Department[] {
  const route = order.requiredDepartments?.length ? order.requiredDepartments : [order.currentDepartment, order.nextDepartment ?? 'Shipping'];
  return route.filter((department, index) => route.indexOf(department) === index);
}

function pickDepartment(route: Department[], target: Department, fallback: Department): Department {
  return route.includes(target) ? target : fallback;
}

function pickFirstDepartment(route: Department[], preferred: Department[]): Department | undefined {
  return preferred.find((department) => route.includes(department));
}

function materialBlocker(): FlowBlocker {
  return {
    type: 'material',
    message: 'Simulation: material is missing at Receiving.',
  };
}

function engineeringBlocker(): FlowBlocker {
  return {
    type: 'process',
    message: 'Simulation: Engineering review is required before production continues.',
  };
}

function text(value: unknown): string {
  return String(value ?? 'none');
}
