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

export type PlantSimulationStep = {
  id: string;
  title: string;
  description: string;
  actionKind: WorkflowRuntimeActionKind;
  note: string;
  extraOverrides?: Partial<RuntimeOrderOverride>;
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

export type PlantSimulationSnapshot = {
  session: PlantSimulationSession | null;
  scenario: PlantSimulationScenario | null;
  activeOrder: ProductionOrder | null;
  nextStep: PlantSimulationStep | null;
  completedSteps: number;
  totalSteps: number;
  runtimeOverrideCount: number;
};

export function getPlantSimulationSnapshot(): PlantSimulationSnapshot {
  const scenario = getPlantDayScenario();
  const session = getPlantSimulationSession();
  const runtimeOrders = getRuntimeProductionOrders();
  const orderNumber = session?.orderNumber ?? scenario?.orderNumber;
  const activeOrder = orderNumber ? runtimeOrders.find((order) => order.orderNumber === orderNumber) ?? null : null;
  const totalSteps = scenario?.steps.length ?? 0;
  const nextStepIndex = Math.min(session?.nextStepIndex ?? 0, totalSteps);

  return {
    session,
    scenario,
    activeOrder,
    nextStep: scenario?.steps[nextStepIndex] ?? null,
    completedSteps: nextStepIndex,
    totalSteps,
    runtimeOverrideCount: Object.keys(getWorkflowRuntimeState()).length,
  };
}

export function startPlantSimulation(): PlantSimulationSnapshot {
  const scenario = requireScenario();
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

  applyWorkflowRuntimeAction(scenario.orderNumber, step.actionKind, step.note, step.extraOverrides);
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
      },
    ],
  };
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
