import type { ProductionOrder } from '../types/productionOrder';
import { evaluateWorkflow } from './workflowEvaluation';

export function isSalesOriginOrder(order: ProductionOrder): boolean {
  return order.workflowOrigin === 'SALES';
}

export function hasMissingBlueprint(order: ProductionOrder): boolean {
  const evaluation = evaluateWorkflow(order);
  return evaluation.checkpointResults.some(
    (result) =>
      result.checkpoint === 'ENGINEERING_REVIEW' &&
      result.strength === 'HARD_STOP' &&
      result.reason.toLowerCase().includes('blueprint')
  );
}

export function hasMaterialIssue(order: ProductionOrder): boolean {
  const evaluation = evaluateWorkflow(order);
  return evaluation.checkpointResults.some(
    (result) =>
      result.checkpoint === 'MATERIAL_READINESS' &&
      (result.strength === 'HARD_STOP' || result.strength === 'SOFT_ACTION')
  );
}

export function getCurrentOrderGate(order: ProductionOrder) {
  const evaluation = evaluateWorkflow(order);
  return evaluation.primaryGate.owner;
}

export function getWorkflowSignal(order: ProductionOrder) {
  const evaluation = evaluateWorkflow(order);

  return {
    orderNumber: order.orderNumber,
    gate: evaluation.primaryGate.owner,
    checkpoint: evaluation.primaryGate.checkpoint,
    strength: evaluation.primaryGate.strength,
    urgency: evaluation.primaryGate.urgency,
    message: evaluation.primaryGate.reason,
    action: evaluation.primaryGate.action,
    pressureScore: evaluation.pressureScore,
    canProceed: evaluation.canProceed,
    parallelActions: evaluation.parallelActions,
    watchers: evaluation.watchers,
    explanation: evaluation.explanation,
  };
}
