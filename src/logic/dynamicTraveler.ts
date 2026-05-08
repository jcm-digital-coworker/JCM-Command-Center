import { departmentResources } from '../data/departmentResources';
import { classifyProductionOrder } from './classifyProductionOrder';
import type { Department } from '../types/machine';
import type { ProductionOrder, ProductLane } from '../types/productionOrder';
import type {
  DynamicTraveler,
  PlantTraveler,
  PlantTravelerStatus,
  TravelerAction,
  TravelerCapability,
  TravelerResource,
  TravelerStepStatus,
} from '../types/dynamicTraveler';
import {
  isClosedProductionStatus,
  isCriticalPriority,
  isHotPriority,
  isMaterialActionNeeded,
  normalizeOrderToken,
} from './orderStatusTruth';

const FINAL_PLANT_DEPARTMENT: Department = 'Shipping';
const NON_PRODUCTION_ROUTE_DEPARTMENTS: Department[] = ['Maintenance'];
const ACTIVE_PLANT_STEP_STATUSES: TravelerStepStatus[] = ['READY', 'ACTIVE', 'BLOCKED', 'HOLD'];

export function generateDynamicTravelers(
  orders: ProductionOrder[],
  department: Department | 'All',
): DynamicTraveler[] {
  const scopedOrders = department === 'All'
    ? orders
    : orders.filter((order) => order.currentDepartment === department || order.requiredDepartments?.includes(department));

  return scopedOrders
    .map((order) => generateDynamicTraveler(order, department === 'All' ? order.currentDepartment : department))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function generatePlantTravelers(orders: ProductionOrder[]): PlantTraveler[] {
  return orders
    .map((order) => generatePlantTraveler(order))
    .sort((a, b) => getPlantTravelerSortScore(b) - getPlantTravelerSortScore(a));
}

export function generatePlantTraveler(order: ProductionOrder): PlantTraveler {
  const productClassification = classifyProductionOrder(order);
  const route = getPlantRoute(order);
  const rawDepartmentSteps = route.map((department) => generateDynamicTraveler(order, department));
  const activeIndex = Math.max(route.indexOf(order.currentDepartment), 0);
  const departmentSteps = rawDepartmentSteps.map((step, index) => normalizePlantStepForRoute(step, index, activeIndex));
  const completedStepCount = departmentSteps.filter((step) => step.stepStatus === 'DONE').length;
  const totalStepCount = departmentSteps.length;
  const completionPercent = totalStepCount === 0 ? 0 : Math.round((completedStepCount / totalStepCount) * 100);
  const activeStep = getActivePlantTravelerStepFromSteps(departmentSteps, order.currentDepartment);
  const overallStatus = getPlantTravelerStatus(order, departmentSteps);
  const nextDepartment = activeStep?.nextHandoff ?? order.nextDepartment;

  return {
    id: `plant-${order.id}`,
    order,
    route,
    departmentSteps,
    productClassification,
    finishHints: productClassification.finishHints,
    qaRequired: productClassification.qaRequired,
    suggestedRoute: productClassification.routeHint,
    classificationReviewReasons: productClassification.reviewReasons,
    activeDepartment: activeStep?.department ?? order.currentDepartment,
    nextDepartment,
    overallStatus,
    completionPercent,
    completedStepCount,
    totalStepCount,
    blockers: order.blockers ?? [],
    currentInstruction: getPlantTravelerInstruction(order, overallStatus, activeStep, completionPercent),
    actions: activeStep?.actions ?? [],
  };
}

export function generateDynamicTraveler(order: ProductionOrder, department: Department): DynamicTraveler {
  const productClassification = classifyProductionOrder(order);
  const materialStatus = order.materialStatus ?? 'UNKNOWN';
  const qaStatus = order.qaStatus ?? 'UNKNOWN';
  const blockers = order.blockers ?? [];
  const requiredCapabilities = getRequiredCapabilities(order, department);
  const capableResources = getCapableResources(department, requiredCapabilities);
  const bestResource = pickBestResource(capableResources);
  const stepStatus = getTravelerStepStatus(order, department, capableResources);
  const nextHandoff = getNextHandoff(order, department);
  const currentInstruction = getCurrentInstruction(order, department, stepStatus, bestResource, nextHandoff);

  return {
    id: `${order.id}-${department.replaceAll(' ', '-').toLowerCase()}`,
    order,
    department,
    stepStatus,
    currentInstruction,
    nextHandoff,
    capableResources,
    bestResource,
    blockers,
    materialStatus,
    qaStatus,
    productClassification,
    finishHints: productClassification.finishHints,
    qaRequired: productClassification.qaRequired,
    classificationReviewReasons: productClassification.reviewReasons,
    actions: getTravelerActions(order, stepStatus, bestResource, nextHandoff),
    priorityScore: getTravelerPriorityScore(order, stepStatus, bestResource),
    visualSignal: getVisualSignal(stepStatus),
  };
}

export function getRequiredCapabilities(order: ProductionOrder, department: Department): TravelerCapability[] {
  if (department === 'Receiving') return ['receiving', 'material-staging'];
  if (department === 'Material Handling') return ['material-staging'];
  if (department === 'Fab') return ['fabrication'];
  if (department === 'Coating') return ['coating-prep'];
  if (department === 'Assembly') return ['assembly'];
  if (department === 'QA') return ['inspection'];
  if (department === 'Shipping') return ['shipping'];

  if (department === 'Saddles Dept') {
    return getSaddlesCapabilities(order);
  }

  if (department === 'Machine Shop') {
    return getMachineShopCapabilities(order);
  }

  return [];
}

function getPlantRoute(order: ProductionOrder): Department[] {
  if (order.requiredDepartments && order.requiredDepartments.length > 0) {
    return normalizePlantRoute(order.requiredDepartments, order.currentDepartment, order.nextDepartment);
  }

  const productClassification = classifyProductionOrder(order);
  if (productClassification.routeHint.length > 0) {
    return normalizePlantRoute(productClassification.routeHint, order.currentDepartment, order.nextDepartment);
  }

  return normalizePlantRoute([order.currentDepartment, order.nextDepartment].filter(Boolean) as Department[]);
}

function normalizePlantRoute(
  route: Department[],
  currentDepartment?: Department,
  nextDepartment?: Department,
): Department[] {
  const normalizedRoute = route.filter(isProductionRouteDepartment);

  if (isProductionRouteDepartment(currentDepartment)) addBeforeFinalDepartment(normalizedRoute, currentDepartment);
  if (isProductionRouteDepartment(nextDepartment)) addBeforeFinalDepartment(normalizedRoute, nextDepartment);
  addBeforeFinalDepartment(normalizedRoute, FINAL_PLANT_DEPARTMENT);

  return dedupeRoute(normalizedRoute)
    .filter((department) => department !== FINAL_PLANT_DEPARTMENT)
    .concat(FINAL_PLANT_DEPARTMENT);
}

function isProductionRouteDepartment(department: Department | undefined): department is Department {
  return Boolean(department && !NON_PRODUCTION_ROUTE_DEPARTMENTS.includes(department));
}

function addBeforeFinalDepartment(route: Department[], department: Department): void {
  if (route.includes(department)) return;

  const finalIndex = route.indexOf(FINAL_PLANT_DEPARTMENT);
  if (finalIndex >= 0 && department !== FINAL_PLANT_DEPARTMENT) {
    route.splice(finalIndex, 0, department);
    return;
  }

  route.push(department);
}

function dedupeRoute(route: Department[]): Department[] {
  return route.filter((department, index) => route.indexOf(department) === index);
}

function normalizePlantStepForRoute(step: DynamicTraveler, index: number, activeIndex: number): DynamicTraveler {
  if (index < activeIndex) {
    return {
      ...step,
      stepStatus: 'DONE',
      visualSignal: 'DONE',
      blockers: [],
      currentInstruction: `Plant route checkpoint complete for ${step.department}.`,
    };
  }

  if (index > activeIndex) {
    return {
      ...step,
      stepStatus: 'NOT_READY',
      visualSignal: 'WATCH',
      blockers: [],
      currentInstruction: `${step.department} is waiting on upstream handoff before this department can act.`,
    };
  }

  return step;
}

function getActivePlantTravelerStepFromSteps(
  steps: DynamicTraveler[],
  currentDepartment: Department,
): DynamicTraveler | undefined {
  return (
    steps.find((step) => step.department === currentDepartment) ??
    steps.find((step) => ACTIVE_PLANT_STEP_STATUSES.includes(step.stepStatus)) ??
    steps[0]
  );
}

function getPlantTravelerStatus(order: ProductionOrder, steps: DynamicTraveler[]): PlantTravelerStatus {
  if (isClosedProductionStatus(order.status)) return 'COMPLETE';
  const activeStep = steps.find((step) => step.stepStatus !== 'DONE' && step.stepStatus !== 'NOT_READY');
  if (activeStep?.stepStatus === 'HOLD') return 'HOLD';
  if (activeStep?.stepStatus === 'BLOCKED') return 'BLOCKED';
  if (activeStep?.stepStatus === 'ACTIVE') return 'ACTIVE';
  if (activeStep?.stepStatus === 'READY') return 'READY';
  return 'NOT_RELEASED';
}

function getPlantTravelerInstruction(
  order: ProductionOrder,
  status: PlantTravelerStatus,
  activeStep: DynamicTraveler | undefined,
  completionPercent: number,
): string {
  if (status === 'COMPLETE') return `Order #${order.orderNumber} is complete through the plant.`;
  if (status === 'HOLD') return `Order #${order.orderNumber} is on hold at ${activeStep?.department ?? 'the active route step'}. Review that department traveler before moving.`;
  if (status === 'BLOCKED') return `Order #${order.orderNumber} is blocked at ${activeStep?.department ?? 'the active route step'}. Review the active blocker before the route can advance.`;
  if (activeStep) return `Order #${order.orderNumber} is ${completionPercent}% complete. Current plant step: ${activeStep.department}.`;
  return `Order #${order.orderNumber} has no active plant step mapped yet.`;
}

function getPlantTravelerSortScore(traveler: PlantTraveler): number {
  let score = 0;
  if (traveler.overallStatus === 'BLOCKED' || traveler.overallStatus === 'HOLD') score += 100;
  if (traveler.overallStatus === 'READY' || traveler.overallStatus === 'ACTIVE') score += 80;
  if (isCriticalPriority(traveler.order.priority)) score += 30;
  if (isHotPriority(traveler.order.priority)) score += 20;
  if (traveler.qaRequired) score += 5;
  if (traveler.classificationReviewReasons.length > 0) score += 5;
  score += Math.max(0, 100 - traveler.completionPercent) / 10;
  return score;
}

function getSaddlesCapabilities(order: ProductionOrder): TravelerCapability[] {
  const lane = order.productLane as ProductLane | undefined;
  const family = String(order.productFamily ?? '').toUpperCase();

  if (lane === 'SERVICE_SADDLE' || family.includes('SERVICE_SADDLE') || family.includes('SADDLE')) {
    return ['service-saddle', 'lv4500-cell', 'saddle-machining', 'gauge-flow'];
  }

  return ['service-saddle', 'gauge-flow'];
}

function getMachineShopCapabilities(order: ProductionOrder): TravelerCapability[] {
  const lane = order.productLane as ProductLane | undefined;
  const family = String(order.productFamily ?? '').toUpperCase();

  if (lane === 'SERVICE_SADDLE' || family.includes('SERVICE_SADDLE') || family.includes('SADDLE')) return [];
  if (lane === 'TAPPING_SLEEVE' || family.includes('TAPPING_SLEEVE')) return ['tapping-sleeve', 'large-turning'];
  if (lane === 'COUPLING' || family.includes('COUPLING')) return ['coupling', 'turning'];
  if (lane === 'PIPE_FABRICATION' || family.includes('PIPE_FABRICATION')) return ['pipe-fabrication', 'large-turning'];
  if (lane === 'ENGINEERED_FITTING' || family.includes('ENGINEERED')) return ['engineered-fitting', 'large-turning'];
  if (lane === 'CLAMP' || lane === 'PATCH_CLAMP' || family.includes('REPAIR')) return ['repair-fitting', 'turning'];
  if (lane === 'OTHER') return ['turning'];

  return ['turning'];
}

function getCapableResources(department: Department, capabilities: TravelerCapability[]): TravelerResource[] {
  const departmentMatches = departmentResources.filter((resource) => resource.department === department);
  if (capabilities.length === 0) return departmentMatches;

  return departmentMatches.filter((resource) =>
    capabilities.every((capability) => resource.capabilities.includes(capability)),
  );
}

function pickBestResource(resources: TravelerResource[]): TravelerResource | undefined {
  return resources.find((resource) => resource.status === 'AVAILABLE') ?? resources[0];
}

function getTravelerStepStatus(
  order: ProductionOrder,
  department: Department,
  capableResources: TravelerResource[],
): TravelerStepStatus {
  const status = normalizeOrderToken(order.status);
  const qaStatus = normalizeOrderToken(order.qaStatus);

  if (isClosedProductionStatus(status)) return 'DONE';
  if (qaStatus === 'HOLD' || qaStatus === 'FAILED' || status === 'HOLD') return 'HOLD';
  if ((order.blockers ?? []).length > 0 || status === 'BLOCKED' || normalizeOrderToken(order.flowStatus) === 'BLOCKED') return 'BLOCKED';
  if (capableResources.length === 0) return 'BLOCKED';
  if (order.currentDepartment !== department && !order.requiredDepartments?.includes(department)) return 'NOT_READY';
  if (status === 'IN_PROGRESS' || status === 'RUNNING') return 'ACTIVE';
  return 'READY';
}

function getNextHandoff(order: ProductionOrder, department: Department): Department | 'Complete' | undefined {
  if (order.nextDepartment && order.nextDepartment !== department) return order.nextDepartment;

  const route = order.requiredDepartments ?? [];
  const currentIndex = route.indexOf(department);
  if (currentIndex >= 0 && currentIndex < route.length - 1) return route[currentIndex + 1];
  if (currentIndex === route.length - 1) return 'Complete';
  return order.nextDepartment;
}

function getCurrentInstruction(
  order: ProductionOrder,
  department: Department,
  stepStatus: TravelerStepStatus,
  bestResource: TravelerResource | undefined,
  nextHandoff: Department | 'Complete' | undefined,
): string {
  if (stepStatus === 'DONE') return `Order #${order.orderNumber} is complete for ${department}.`;
  if (stepStatus === 'HOLD') return `Hold order #${order.orderNumber}. Review QA, engineering, or management hold before moving.`;
  if (stepStatus === 'BLOCKED') {
    const blocker = order.blockers?.[0]?.message;
    if (blocker) return `Do not start order #${order.orderNumber}. Blocked: ${blocker}`;
    if (!bestResource) return `Do not start order #${order.orderNumber}. No capable ${department} resource is mapped yet.`;
    return `Do not start order #${order.orderNumber}. Review blocker before work begins.`;
  }

  const resourceLabel = bestResource ? ` on ${bestResource.label}` : '';
  const handoffLabel = nextHandoff ? ` After this step, advance it to ${nextHandoff}.` : '';

  if (department === 'Receiving') return `Receive and stage order #${order.orderNumber}.${handoffLabel}`;
  if (department === 'Material Handling') return `Stage material for order #${order.orderNumber}.${handoffLabel}`;
  if (department === 'QA') return `Inspect or release order #${order.orderNumber}${resourceLabel}.${handoffLabel}`;
  if (department === 'Shipping') return `Stage and ship order #${order.orderNumber}${resourceLabel}.${handoffLabel}`;
  if (department === 'Machine Shop') return `Run order #${order.orderNumber}${resourceLabel}.${handoffLabel}`;
  if (department === 'Saddles Dept') return `Run saddle order #${order.orderNumber}${resourceLabel}. Validate macro simulation and gauge requirements before handoff.${handoffLabel}`;

  return `Work order #${order.orderNumber}${resourceLabel}.${handoffLabel}`;
}

function getTravelerActions(
  order: ProductionOrder,
  stepStatus: TravelerStepStatus,
  bestResource: TravelerResource | undefined,
  nextHandoff: Department | 'Complete' | undefined,
): TravelerAction[] {
  const materialNeedsAction = isMaterialActionNeeded(order.materialStatus);

  return [
    { type: 'OPEN_DETAIL', label: 'Open traveler detail', enabled: true },
    { type: 'OPEN_PLANT_TRAVELER', label: 'Open full plant traveler', enabled: true },
    {
      type: 'REQUEST_MATERIAL',
      label: 'Request material for this order',
      enabled: materialNeedsAction,
      reason: materialNeedsAction ? undefined : 'Material is not currently flagged as missing.',
    },
    {
      type: 'REPORT_ISSUE',
      label: bestResource ? `Report issue or resource mismatch on ${bestResource.label}` : 'Report issue on this order',
      enabled: true,
    },
    {
      type: 'MARK_READY_FOR_HANDOFF',
      label: 'Record ready for handoff',
      enabled: stepStatus === 'READY' || stepStatus === 'ACTIVE',
      reason: stepStatus === 'READY' || stepStatus === 'ACTIVE' ? undefined : 'Traveler is not ready for handoff.',
    },
    {
      type: 'SEND_TO_NEXT_DEPARTMENT',
      label: nextHandoff && nextHandoff !== 'Complete' ? `Advance order to ${nextHandoff} now` : 'Advance to next department now',
      enabled: Boolean(nextHandoff) && nextHandoff !== 'Complete' && (stepStatus === 'READY' || stepStatus === 'ACTIVE'),
      reason: !nextHandoff ? 'No next handoff is available.' : nextHandoff === 'Complete' ? 'This is the final department - use Complete Order instead.' : undefined,
    },
    {
      type: 'COMPLETE_ORDER',
      label: 'Complete order now',
      enabled: nextHandoff === 'Complete' && (stepStatus === 'READY' || stepStatus === 'ACTIVE' || stepStatus === 'DONE'),
      reason: nextHandoff !== 'Complete' ? 'Order has remaining departments before completion.' : undefined,
    },
    { type: 'OPEN_FULL_ORDER', label: 'Open full order', enabled: true },
  ];
}

function getTravelerPriorityScore(
  order: ProductionOrder,
  stepStatus: TravelerStepStatus,
  bestResource: TravelerResource | undefined,
): number {
  let score = 0;
  if (stepStatus === 'READY' || stepStatus === 'ACTIVE') score += 120;
  if (stepStatus === 'BLOCKED' || stepStatus === 'HOLD') score += 40;
  if (!bestResource) score += 35;
  if (isCriticalPriority(order.priority)) score += 30;
  if (isHotPriority(order.priority)) score += 20;
  if (isMaterialActionNeeded(order.materialStatus)) score += 15;
  const qaStatus = normalizeOrderToken(order.qaStatus);
  if (qaStatus === 'HOLD' || qaStatus === 'FAILED') score += 15;
  return score;
}

function getVisualSignal(stepStatus: DynamicTraveler['stepStatus']): DynamicTraveler['visualSignal'] {
  if (stepStatus === 'BLOCKED') return 'BLOCKED';
  if (stepStatus === 'HOLD') return 'HOLD';
  if (stepStatus === 'DONE') return 'DONE';
  if (stepStatus === 'READY' || stepStatus === 'ACTIVE') return 'READY';
  return 'WATCH';
}
