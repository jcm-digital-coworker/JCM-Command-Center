import { productClassificationRules } from '../data/productClassificationRules';
import type { ProductionOrder } from '../types/productionOrder';
import type {
  ClassificationConfidence,
  ProductClassification,
  ProductClassificationRule,
} from '../types/productClassification';

export function classifyProductionOrder(order: ProductionOrder): ProductClassification {
  const modelSignal = getModelSignal(order);
  const matchedRule = modelSignal ? findRuleByModelSignal(modelSignal) : undefined;
  const reviewReasons: string[] = [];

  if (!modelSignal) reviewReasons.push('No model number or part number signal found.');
  if (!matchedRule) reviewReasons.push('No product classification rule matched this order.');
  if (matchedRule?.reviewReason) reviewReasons.push(matchedRule.reviewReason);

  const orderForcesQa = order.orderType === 'ENGINEERED' || order.engineeringRequired === true;
  const qaRequired = Boolean(matchedRule?.qaRequired || orderForcesQa || order.qaStatus === 'PENDING' || order.qaStatus === 'HOLD');

  if (orderForcesQa && !matchedRule?.qaRequired) reviewReasons.push('Order is marked engineered, so QA is required even if the product rule does not require it.');
  if (order.qaStatus === 'PENDING' || order.qaStatus === 'HOLD') reviewReasons.push('Order has an active QA status and should be treated as QA-assigned.');

  return {
    modelSignal,
    matchedRule,
    productLine: matchedRule?.productLine ?? inferProductLine(order),
    productFamily: matchedRule?.productFamily ?? 'UNKNOWN',
    materialClass: matchedRule?.materialClass ?? 'UNKNOWN',
    sizeClass: matchedRule?.sizeClass ?? 'UNKNOWN',
    outletClass: matchedRule?.outletClass ?? 'UNKNOWN',
    finishHints: matchedRule?.finishHints ?? ['UNKNOWN_CONFIRM'],
    engineeredRequired: Boolean(matchedRule?.engineeredRequired || orderForcesQa),
    qaRequired,
    qaReason: qaRequired ? matchedRule?.qaReason ?? 'engineered' : 'not_required',
    routeHint: matchedRule?.routeHint ?? order.requiredDepartments ?? [],
    departmentOwnershipHint: matchedRule?.departmentOwnershipHint ?? [],
    confidence: combineConfidence(matchedRule, reviewReasons),
    needsHumanReview: Boolean(matchedRule?.needsHumanReview || reviewReasons.length > 0),
    reviewReasons,
  };
}

export function findRuleByModelSignal(modelSignal: string): ProductClassificationRule | undefined {
  return productClassificationRules.find((rule) => rule.modelSignals.includes(modelSignal));
}

function getModelSignal(order: ProductionOrder): string | undefined {
  const candidates = [order.partNumber, order.assemblyPartNumber, order.productFamily, order.blueprintId].filter(Boolean);
  for (const candidate of candidates) {
    const match = String(candidate).match(/\b\d{3}\b/);
    if (match) return match[0];
  }
  return undefined;
}

function inferProductLine(order: ProductionOrder): ProductClassification['productLine'] {
  if (order.orderType === 'ENGINEERED' || order.engineeringRequired) return 'ENGINEERED';
  if (order.productLane === 'SERVICE_SADDLE' || order.productLane === 'TAPPING_SLEEVE') return 'BRANCHING';
  if (order.productLane === 'CLAMP' || order.productLane === 'PATCH_CLAMP') return 'REPAIR';
  if (order.productLane === 'COUPLING') return 'CONNECTION';
  if (order.productLane === 'ENGINEERED_FITTING' || order.productLane === 'PIPE_FABRICATION') return 'ENGINEERED';
  return 'UNKNOWN';
}

function combineConfidence(
  matchedRule: ProductClassificationRule | undefined,
  reviewReasons: string[],
): ClassificationConfidence {
  if (!matchedRule) return 'REVIEW';
  if (matchedRule.needsHumanReview || reviewReasons.length > 0) return matchedRule.confidence === 'HIGH' ? 'MEDIUM' : matchedRule.confidence;
  return matchedRule.confidence;
}
