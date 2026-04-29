import type { Department } from '../../types/machine';
import type {
  BlockedReason,
  OrderDependency,
  ProductionOrder,
} from '../../types/productionOrder';
import type { Worker, WorkerSkill } from '../../types/worker';
import type {
  BlockedReasonMap,
  CrewGuidanceBlockerType,
  CrewGuidanceInput,
  CrewGuidanceItem,
  CrewGuidanceOrderGroup,
  CrewGuidanceWorkerGroup,
  DepartmentCrewRequirement,
} from './types';

const departmentCrewRequirements: Record<Department, DepartmentCrewRequirement> = {
  Receiving: {
    requiredSkills: ['RECEIVING', 'MATERIAL_HANDLING'],
    actionRole: 'receiver / material handler',
    readyAction: 'Stage received material and clear partial receipts before downstream labor is assigned.',
    blockedAction: 'Clear material questions before assigning more crew downstream.',
  },
  'Machine Shop': {
    requiredSkills: ['MACHINE_OPERATION'],
    actionRole: 'machine operator',
    readyAction: 'Assign machine operators only to work with material and required dependencies ready.',
    blockedAction: 'Hold machine labor until material, upstream, or machine blockers are cleared.',
  },
  'Material Handling': {
    requiredSkills: ['MATERIAL_HANDLING', 'MACHINE_OPERATION'],
    actionRole: 'material handler / equipment operator',
    readyAction: 'Feed runnable orders through staging, laser, saw, press, or movement lanes.',
    blockedAction: 'Use crew to clear staging and dependency blockers instead of overstaffing a hard-blocked lane.',
  },
  Fab: {
    requiredSkills: ['FAB_WELDING', 'FAB_FITTING'],
    actionRole: 'welder / fitter',
    readyAction: 'Put skilled fab labor on runnable work with the nearest ship dates.',
    blockedAction: 'Do not send welders to orders held by engineering, QA, or missing inputs.',
  },
  Coating: {
    requiredSkills: ['COATING'],
    actionRole: 'coating tech',
    readyAction: 'Assign coating techs to work that is ready for blast, paint, dip, passivation, or cure flow.',
    blockedAction: 'Do not stack coating labor while orders are still blocked upstream.',
  },
  Assembly: {
    requiredSkills: ['ASSEMBLY'],
    actionRole: 'assembler',
    readyAction: 'Build ready kits first where all required inputs are present.',
    blockedAction: 'Do not start partial kits unless the missing input is already being cleared.',
  },
  'Saddles Dept': {
    requiredSkills: ['ASSEMBLY'],
    actionRole: 'saddle assembler',
    readyAction: 'Staff saddle work when material, laser, press-building, and downstream handoff are clear.',
    blockedAction: 'Avoid tying up saddle labor if laser, press-building, or material dependencies are not ready.',
  },
  'Patch Clamps': {
    requiredSkills: ['ASSEMBLY', 'FAB_WELDING'],
    actionRole: 'patch clamp builder',
    readyAction: 'Use patch clamp labor on ready orders that can move without shared plant bottlenecks.',
    blockedAction: 'Check material and shared dependency status before adding crew.',
  },
  Clamps: {
    requiredSkills: ['ASSEMBLY'],
    actionRole: 'clamp assembler',
    readyAction: 'Staff clamp work when shared material, laser, and press-building needs are clear.',
    blockedAction: 'Avoid overstaffing clamps when Material Handling or missing inputs are the true blockers.',
  },
  QA: {
    requiredSkills: ['QA_INSPECTION'],
    actionRole: 'QA inspector',
    readyAction: 'Clear pending QA checks that protect Shipping from bad exits.',
    blockedAction: 'Prioritize holds and failures before routine checks.',
  },
  Shipping: {
    requiredSkills: ['SHIPPING', 'MATERIAL_HANDLING'],
    actionRole: 'shipping / staging co-worker',
    readyAction: 'Stage ship-ready orders and chase near-ready orders held only by final handoff work.',
    blockedAction: 'Do not pack work that lacks QA release or completion confirmation.',
  },
  Maintenance: {
    requiredSkills: ['MAINTENANCE'],
    actionRole: 'maintenance co-worker',
    readyAction: 'Assign maintenance to issues that unlock the most active plant work.',
    blockedAction: 'Escalate safety, asset-down, or line-down issues before routine work.',
  },
  Office: {
    requiredSkills: ['LEADERSHIP'],
    actionRole: 'office / engineering support',
    readyAction: 'Clear engineered-order questions, holds, and missing specification decisions.',
    blockedAction: 'Do not push engineered work forward without required review.',
  },
};

const blockedReasonTypeMap: BlockedReasonMap = {
  WAITING_ON_MATERIAL: 'material',
  WAITING_ON_LASER: 'upstream',
  WAITING_ON_PRESS: 'upstream',
  WAITING_ON_MACHINE_SHOP: 'upstream',
  WAITING_ON_FAB: 'upstream',
  WAITING_ON_COATING: 'upstream',
  WAITING_ON_ASSEMBLY: 'upstream',
  WAITING_ON_QA: 'quality',
  WAITING_ON_SHIPPING: 'process',
  MACHINE_DOWN: 'asset',
  LABOR_SHORTAGE: 'labor',
  ENGINEERING_HOLD: 'engineering',
  QUALITY_HOLD: 'quality',
  UNKNOWN: 'unknown',
};

export function getCrewGuidance(input: CrewGuidanceInput): CrewGuidanceItem[] {
  const requirement = departmentCrewRequirements[input.department];
  const departmentOrders = getOrdersForDepartment(input.orders, input.department);
  const orderGroup = groupOrdersForGuidance(departmentOrders);
  const workerGroup = groupWorkersForGuidance(
    input.workers,
    input.department,
    requirement.requiredSkills,
  );

  const guidance: CrewGuidanceItem[] = [];

  if (
    orderGroup.runnableOrders.length > 0 &&
    workerGroup.skilledAvailableWorkers.length > 0
  ) {
    guidance.push({
      id: `${input.department}-ready-crew-match`,
      level: 'info',
      department: input.department,
      title: `${input.department} has runnable work with matched crew`,
      message: `${orderGroup.runnableOrders.length} order${
        orderGroup.runnableOrders.length === 1 ? '' : 's'
      } can move with available ${requirement.actionRole}.`,
      action: requirement.readyAction,
      requiredSkills: requirement.requiredSkills,
      missingSkills: [],
      blockerTypes: [],
      orderNumbers: getTopOrderNumbers(orderGroup.runnableOrders),
      workerIds: workerGroup.skilledAvailableWorkers.map((worker) => worker.id),
    });
  }

  if (
    orderGroup.runnableOrders.length > 0 &&
    workerGroup.skilledAvailableWorkers.length === 0
  ) {
    guidance.push({
      id: `${input.department}-ready-no-skilled-crew`,
      level: 'warning',
      department: input.department,
      title: `${input.department} has runnable work but no matched crew available`,
      message: `Work can move, but no available worker currently shows the required ${formatSkills(
        requirement.requiredSkills,
      )} skill coverage.`,
      action:
        'Reassign a qualified secondary worker or hold the crew move until a matched co-worker is available.',
      requiredSkills: requirement.requiredSkills,
      missingSkills: workerGroup.missingSkills,
      blockerTypes: ['labor'],
      orderNumbers: getTopOrderNumbers(orderGroup.runnableOrders),
      workerIds: [],
    });
  }

  if (orderGroup.blockedOrders.length > 0) {
    guidance.push({
      id: `${input.department}-blocked-work`,
      level: 'critical',
      department: input.department,
      title: `${input.department} has blocked work`,
      message: `${orderGroup.blockedOrders.length} order${
        orderGroup.blockedOrders.length === 1 ? '' : 's'
      } touching this area are blocked by ${formatBlockerTypes(orderGroup.blockerTypes)}.`,
      action: requirement.blockedAction,
      requiredSkills: requirement.requiredSkills,
      missingSkills: workerGroup.missingSkills,
      blockerTypes: orderGroup.blockerTypes,
      orderNumbers: getTopOrderNumbers(orderGroup.blockedOrders),
      workerIds: workerGroup.skilledAvailableWorkers.map((worker) => worker.id),
    });
  }

  if (guidance.length === 0) {
    guidance.push({
      id: `${input.department}-steady-state`,
      level: 'info',
      department: input.department,
      title: `${input.department} has no rule-triggered crew move`,
      message:
        'No runnable or blocked sample orders currently require a crew shift for this department.',
      action:
        'Maintain normal coverage and watch for material, QA, dependency, or shipping changes.',
      requiredSkills: requirement.requiredSkills,
      missingSkills: workerGroup.missingSkills,
      blockerTypes: [],
      orderNumbers: [],
      workerIds: workerGroup.skilledAvailableWorkers.map((worker) => worker.id),
    });
  }

  return guidance;
}

export function getDepartmentCrewRequirement(department: Department) {
  return departmentCrewRequirements[department];
}

export function getOrdersForDepartment(
  orders: ProductionOrder[],
  department: Department,
) {
  return orders.filter(
    (order) =>
      order.currentDepartment === department ||
      order.requiredDepartments.includes(department),
  );
}

export function getAvailableWorkersForDepartment(
  workers: Worker[],
  department: Department,
) {
  return workers.filter(
    (worker) =>
      worker.status === 'AVAILABLE' &&
      (worker.primaryDepartment === department ||
        worker.secondaryDepartments?.includes(department)),
  );
}

function groupOrdersForGuidance(
  orders: ProductionOrder[],
): CrewGuidanceOrderGroup {
  const runnableOrders = sortOrdersForGuidance(
    orders.filter((order) => isRunnableOrder(order)),
  );

  const blockedOrders = sortOrdersForGuidance(
    orders.filter((order) => isBlockedOrder(order)),
  );

  const blockerTypes = getUniqueBlockerTypes(blockedOrders);

  return {
    runnableOrders,
    blockedOrders,
    blockerTypes,
  };
}

function groupWorkersForGuidance(
  workers: Worker[],
  department: Department,
  requiredSkills: WorkerSkill[],
): CrewGuidanceWorkerGroup {
  const availableWorkers = getAvailableWorkersForDepartment(workers, department);

  const skilledAvailableWorkers = availableWorkers.filter((worker) =>
    worker.skills.some((skill) => requiredSkills.includes(skill)),
  );

  const coveredSkills = new Set<WorkerSkill>(
    skilledAvailableWorkers.flatMap((worker) => worker.skills),
  );

  const missingSkills = requiredSkills.filter((skill) => !coveredSkills.has(skill));

  return {
    availableWorkers,
    skilledAvailableWorkers,
    missingSkills,
  };
}

function isRunnableOrder(order: ProductionOrder) {
  if (order.status !== 'READY' && order.status !== 'IN_PROGRESS') return false;
  if (order.materialStatus === 'NOT_RECEIVED') return false;
  if (order.qaStatus === 'FAILED' || order.qaStatus === 'HOLD') return false;
  return !hasBlockingDependency(order.dependencies);
}

function isBlockedOrder(order: ProductionOrder) {
  if (order.status === 'BLOCKED') return true;
  if (order.materialStatus === 'NOT_RECEIVED') return true;
  if (order.qaStatus === 'FAILED' || order.qaStatus === 'HOLD') return true;
  return hasBlockingDependency(order.dependencies);
}

function hasBlockingDependency(dependencies: OrderDependency[]) {
  return dependencies.some(
    (dependency) =>
      dependency.required &&
      (dependency.status === 'DOWN' || dependency.status === 'UNKNOWN'),
  );
}

function getUniqueBlockerTypes(orders: ProductionOrder[]) {
  const blockerTypes = new Set<CrewGuidanceBlockerType>();

  orders.forEach((order) => {
    getBlockerTypesForOrder(order).forEach((blockerType) => {
      blockerTypes.add(blockerType);
    });
  });

  return Array.from(blockerTypes);
}

function getBlockerTypesForOrder(order: ProductionOrder[]) {
  return order;
}