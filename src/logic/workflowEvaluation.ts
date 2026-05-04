import type { Department } from '../types/machine';
import type { ProductionOrder } from '../types/productionOrder';
import type { PartBlueprint } from '../types/partBlueprint';
import { partBlueprints } from '../data/partBlueprints';
import { getBlueprintForOrder, orderRequiresBlueprintPacket } from './orderBlueprints';

export type WorkflowCheckpoint =
  | 'SALES_RELEASE'
  | 'ENGINEERING_REVIEW'
  | 'SUPERVISOR_PRIORITY'
  | 'MATERIAL_READINESS'
  | 'DEPARTMENT_DISPATCH'
  | 'STATION_EXECUTION'
  | 'QA_RELEASE'
  | 'SHIPPING_RELEASE'
  | 'COMPLETE';

export type GateStrength = 'HARD_STOP' | 'SOFT_ACTION' | 'WATCH_ONLY' | 'PASS';
export type WorkflowUrgency = 'info' | 'watch' | 'action' | 'critical';
export type WorkflowOwner =
  | Department
  | 'Sales'
  | 'Engineering'
  | 'Production Supervisor'
  | 'Receiving'
  | 'Purchasing'
  | 'Maintenance'
  | 'QA'
  | 'Shipping';

export type WorkflowCheckpointResult = {
  checkpoint: WorkflowCheckpoint;
  strength: GateStrength;
  owner: WorkflowOwner;
  urgency: WorkflowUrgency;
  reason: string;
  action: string;
};

export type WorkflowEvaluation = {
  orderNumber: string;
  primaryGate: WorkflowCheckpointResult;
  checkpointResults: WorkflowCheckpointResult[];
  parallelActions: WorkflowCheckpointResult[];
  watchers: WorkflowCheckpointResult[];
  pressureScore: number;
  canProceed: boolean;
  explanation: string[];
};

const PASS_STRENGTH_ORDER: Record<GateStrength, number> = {
  PASS: 0,
  WATCH_ONLY: 1,
  SOFT_ACTION: 2,
  HARD_STOP: 3,
};

const URGENCY_SCORE: Record<WorkflowUrgency, number> = {
  info: 0,
  watch: 10,
  action: 25,
  critical: 45,
};

export function evaluateWorkflow(
  order: ProductionOrder,
  blueprints: PartBlueprint[] = partBlueprints
): WorkflowEvaluation {
  const blueprint = getBlueprintForOrder(order, blueprints);
  const checkpointResults = [
    evaluateSalesRelease(order),
    evaluateEngineeringReview(order, blueprint),
    evaluateSupervisorPriority(order),
    evaluateMaterialReadiness(order),
    evaluateDepartmentDispatch(order),
    evaluateStationExecution(order),
    evaluateQaRelease(order),
    evaluateShippingRelease(order),
  ];

  const primaryGate = choosePrimaryGate(checkpointResults, order);
  const parallelActions = checkpointResults.filter(
    (result) =>
      result !== primaryGate &&
      (result.strength === 'HARD_STOP' || result.strength === 'SOFT_ACTION')
  );
  const watchers = checkpointResults.filter((result) => result.strength === 'WATCH_ONLY');
  const pressureScore = getPressureScore(order, checkpointResults);
  const canProceed = !checkpointResults.some((result) => result.strength === 'HARD_STOP');

  return {
    orderNumber: order.orderNumber,
    primaryGate,
    checkpointResults,
    parallelActions,
    watchers,
    pressureScore,
    canProceed,
    explanation: buildExplanation(order, primaryGate, parallelActions, watchers, pressureScore),
  };
}

export function evaluateSalesRelease(order: ProductionOrder): WorkflowCheckpointResult {
  if (order.workflowOrigin === 'SALES' && !order.salesReleasedAt) {
    return result('SALES_RELEASE', 'HARD_STOP', 'Sales', 'action', 'Sales has not released this order into production.', 'Release or cancel the order before production routing.');
  }

  return result('SALES_RELEASE', 'PASS', 'Sales', 'info', 'Sales release is clear.', 'No Sales action required.');
}

export function evaluateEngineeringReview(order: ProductionOrder, blueprint?: PartBlueprint): WorkflowCheckpointResult {
  if (order.engineeringRequired === true && !order.blueprintId && !order.partNumber) {
    return result('ENGINEERING_REVIEW', 'HARD_STOP', 'Engineering', getOrderUrgency(order), 'Engineered order has no blueprint or part definition attached.', 'Create and release the engineering packet.');
  }

  if (order.engineeringRequired === true && order.engineeringStatus !== 'RELEASED') {
    return result('ENGINEERING_REVIEW', 'HARD_STOP', 'Engineering', getOrderUrgency(order), 'Engineering release is required before production can proceed.', 'Complete Engineering release.');
  }

  if (orderRequiresBlueprintPacket(order) && !blueprint) {
    return result('ENGINEERING_REVIEW', 'HARD_STOP', 'Engineering', getOrderUrgency(order), 'Executable blueprint/routing packet is missing or unmapped.', 'Attach the correct blueprint packet and routing.');
  }

  return result('ENGINEERING_REVIEW', 'PASS', 'Engineering', 'info', 'Engineering review is clear.', 'No Engineering action required.');
}

export function evaluateSupervisorPriority(order: ProductionOrder): WorkflowCheckpointResult {
  if (order.workflowOrigin === 'SALES' && order.salesReleasedAt && !order.productionSupervisorAcknowledged) {
    return result('SUPERVISOR_PRIORITY', 'SOFT_ACTION', 'Production Supervisor', getOrderUrgency(order), 'Released order has not been acknowledged or priority-placed by Production Supervisor.', 'Acknowledge, rank, and release station priority.');
  }

  return result('SUPERVISOR_PRIORITY', 'PASS', 'Production Supervisor', 'info', 'Supervisor priority check is clear.', 'No supervisor action required.');
}

export function evaluateMaterialReadiness(order: ProductionOrder): WorkflowCheckpointResult {
  const materialStatus = String(order.materialStatus ?? 'UNKNOWN').toUpperCase();
  const materialBlocker = order.blockers.find((blocker) => blocker.type === 'material');

  if (materialStatus === 'ORDER_REQUIRED') {
    return result('MATERIAL_READINESS', 'SOFT_ACTION', 'Purchasing', getOrderUrgency(order), 'Required material must be ordered before the order can run cleanly.', 'Order material and update expected availability.');
  }

  if (materialStatus === 'MISSING' || materialStatus === 'NOT_RECEIVED' || materialBlocker) {
    return result('MATERIAL_READINESS', 'SOFT_ACTION', 'Receiving', getOrderUrgency(order), materialBlocker?.message ?? 'Material is not ready for this order.', 'Verify, receive, or stage material for the affected work center.');
  }

  return result('MATERIAL_READINESS', 'PASS', 'Receiving', 'info', 'Material readiness is clear.', 'No Receiving action required.');
}

export function evaluateDepartmentDispatch(order: ProductionOrder): WorkflowCheckpointResult {
  if (order.nextDepartment) {
    return result('DEPARTMENT_DISPATCH', 'WATCH_ONLY', order.nextDepartment, 'watch', `Incoming work may affect ${order.nextDepartment}.`, 'Watch incoming order status and prepare capacity.');
  }

  return result('DEPARTMENT_DISPATCH', 'PASS', order.currentDepartment, 'info', 'No downstream department is assigned.', 'No downstream watch required.');
}

export function evaluateStationExecution(order: ProductionOrder): WorkflowCheckpointResult {
  const machineBlocker = order.blockers.find((blocker) => blocker.type === 'machine');
  const laborBlocker = order.blockers.find((blocker) => blocker.type === 'labor');
  const processBlocker = order.blockers.find((blocker) => blocker.type === 'process' || blocker.type === 'upstream');

  if (machineBlocker) {
    return result('STATION_EXECUTION', 'SOFT_ACTION', 'Maintenance', getOrderUrgency(order), machineBlocker.message, 'Review machine blocker or reassign work.');
  }

  if (laborBlocker) {
    return result('STATION_EXECUTION', 'SOFT_ACTION', 'Production Supervisor', getOrderUrgency(order), laborBlocker.message, 'Assign qualified coverage or adjust the schedule.');
  }

  if (processBlocker) {
    return result('STATION_EXECUTION', 'SOFT_ACTION', order.currentDepartment, getOrderUrgency(order), processBlocker.message, 'Review station/process blocker before proceeding.');
  }

  return result('STATION_EXECUTION', 'PASS', order.currentDepartment, getOrderUrgency(order), `Order is ready for ${order.currentDepartment}.`, `Work in ${order.currentDepartment}.`);
}

export function evaluateQaRelease(order: ProductionOrder): WorkflowCheckpointResult {
  const qualityBlocker = order.blockers.find((blocker) => blocker.type === 'quality');
  const qaStatus = String(order.qaStatus ?? 'UNKNOWN').toUpperCase();

  if (qaStatus === 'HOLD' || qaStatus === 'FAILED' || qualityBlocker) {
    return result('QA_RELEASE', 'HARD_STOP', 'QA', getOrderUrgency(order), qualityBlocker?.message ?? 'QA release is holding this order.', 'Complete QA release or clear quality hold.');
  }

  if (order.currentDepartment === 'QA') {
    return result('QA_RELEASE', 'SOFT_ACTION', 'QA', getOrderUrgency(order), 'Order is at QA and needs release disposition.', 'Inspect and release or hold the order.');
  }

  return result('QA_RELEASE', 'PASS', 'QA', 'info', 'QA release is clear or not currently required.', 'No QA action required.');
}

export function evaluateShippingRelease(order: ProductionOrder): WorkflowCheckpointResult {
  const laborBlocker = order.currentDepartment === 'Shipping'
    ? order.blockers.find((blocker) => blocker.type === 'labor')
    : undefined;

  if (laborBlocker) {
    return result('SHIPPING_RELEASE', 'SOFT_ACTION', 'Shipping', getOrderUrgency(order), laborBlocker.message, 'Assign qualified shipping/material handling coverage.');
  }

  if (order.currentDepartment === 'Shipping' && String(order.status).toLowerCase() === 'ready') {
    return result('SHIPPING_RELEASE', 'SOFT_ACTION', 'Shipping', getOrderUrgency(order), 'Order is ready for shipping action.', 'Pack, stage, and confirm shipment paperwork.');
  }

  return result('SHIPPING_RELEASE', 'PASS', 'Shipping', 'info', 'Shipping release is not currently blocking this order.', 'No Shipping action required.');
}

function choosePrimaryGate(results: WorkflowCheckpointResult[], order: ProductionOrder): WorkflowCheckpointResult {
  const hardStop = results.find((checkpoint) => checkpoint.strength === 'HARD_STOP');
  if (hardStop) return hardStop;

  const strongestAction = [...results]
    .filter((checkpoint) => checkpoint.strength === 'SOFT_ACTION')
    .sort((a, b) => PASS_STRENGTH_ORDER[b.strength] - PASS_STRENGTH_ORDER[a.strength] || URGENCY_SCORE[b.urgency] - URGENCY_SCORE[a.urgency])[0];

  if (strongestAction) return strongestAction;

  return result('STATION_EXECUTION', 'PASS', order.currentDepartment, getOrderUrgency(order), `Order is ready for ${order.currentDepartment}.`, `Work in ${order.currentDepartment}.`);
}

function getPressureScore(order: ProductionOrder, results: WorkflowCheckpointResult[]): number {
  const priorityScore = String(order.priority).toLowerCase() === 'critical' ? 80 : String(order.priority).toLowerCase() === 'hot' ? 45 : 15;
  const dueScore = getDuePressure(order.projectedShipDate);
  const blockerScore = results.reduce((total, checkpoint) => total + (checkpoint.strength === 'HARD_STOP' ? 60 : checkpoint.strength === 'SOFT_ACTION' ? 30 : checkpoint.strength === 'WATCH_ONLY' ? 5 : 0), 0);
  const urgencyScore = results.reduce((total, checkpoint) => total + URGENCY_SCORE[checkpoint.urgency], 0);
  return priorityScore + dueScore + blockerScore + urgencyScore;
}

function getDuePressure(projectedShipDate?: string): number {
  if (!projectedShipDate) return 0;
  const due = new Date(`${projectedShipDate}T00:00:00`);
  if (Number.isNaN(due.getTime())) return 0;
  const days = Math.ceil((due.getTime() - Date.now()) / 86400000);
  if (days < 0) return 80;
  if (days === 0) return 65;
  if (days <= 2) return 45;
  if (days <= 7) return 20;
  return 0;
}

function getOrderUrgency(order: ProductionOrder): WorkflowUrgency {
  const priority = String(order.priority).toLowerCase();
  const duePressure = getDuePressure(order.projectedShipDate);
  if (priority === 'critical' || duePressure >= 65) return 'critical';
  if (priority === 'hot' || duePressure >= 20) return 'action';
  return 'watch';
}

function buildExplanation(
  order: ProductionOrder,
  primaryGate: WorkflowCheckpointResult,
  parallelActions: WorkflowCheckpointResult[],
  watchers: WorkflowCheckpointResult[],
  pressureScore: number
): string[] {
  const explanation = [
    `Primary gate is ${primaryGate.checkpoint} because ${primaryGate.reason}`,
    `Pressure score is ${pressureScore}.`,
  ];

  if (parallelActions.length > 0) {
    explanation.push(`${parallelActions.length} parallel action${parallelActions.length === 1 ? '' : 's'} should move now.`);
  }

  if (watchers.length > 0) {
    explanation.push(`${watchers.length} watcher${watchers.length === 1 ? '' : 's'} need visibility before handoff.`);
  }

  if (order.nextDepartment) {
    explanation.push(`Next department is ${order.nextDepartment}.`);
  }

  return explanation;
}

function result(
  checkpoint: WorkflowCheckpoint,
  strength: GateStrength,
  owner: WorkflowOwner,
  urgency: WorkflowUrgency,
  reason: string,
  action: string
): WorkflowCheckpointResult {
  return { checkpoint, strength, owner, urgency, reason, action };
}
