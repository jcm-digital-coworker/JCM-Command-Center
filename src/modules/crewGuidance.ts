import { machines } from '../data/machine';
import { productionOrders } from '../data/productionOrders';
import { workers } from '../data/workers';
import type { Department, Machine } from '../types/machine';
import type {
  FlowBlockerType,
  ProductionOrder,
} from '../types/productionOrder';
import type { Worker, WorkerSkill } from '../types/worker';

export type CrewGuidanceLevel = 'info' | 'warning' | 'critical';

export type CrewGuidanceItem = {
  id: string;
  level: CrewGuidanceLevel;
  department: Department;
  title: string;
  message: string;
  action: string;
  orderNumbers: string[];
  workerIds: string[];
  requiredSkills: WorkerSkill[];
  missingSkills: WorkerSkill[];
  blockerTypes: FlowBlockerType[];
};

export type CrewGuidanceContext = {
  department: Department;
  orders?: ProductionOrder[];
  workers?: Worker[];
  machines?: Machine[];
};

type DepartmentCrewRule = {
  requiredSkills: WorkerSkill[];
  readyAction: string;
  blockedAction: string;
};

const departmentCrewRules: Record<Department, DepartmentCrewRule> = {
  Sales: {
    requiredSkills: ['leadership'],
    readyAction:
      'Clear order release, customer priority, or change-note questions before the order enters production flow.',
    blockedAction:
      'Hold production handoff until sales release details, customer requirements, or priority changes are confirmed.',
  },
  Engineering: {
    requiredSkills: ['leadership'],
    readyAction:
      'Clear blueprint, routing, revision, or production packet questions that unblock the next department.',
    blockedAction:
      'Do not push engineered work forward until drawings, routing, and revision status are released.',
  },
  Office: {
    requiredSkills: ['leadership'],
    readyAction:
      'Clear scheduling, purchasing, or office decisions that affect plant flow.',
    blockedAction:
      'Do not push held work forward until the required office decision is made.',
  },
  Receiving: {
    requiredSkills: ['receiving', 'material_handling'],
    readyAction:
      'Use receiving coverage to verify inbound material and stage it for the next department.',
    blockedAction:
      'Clear material receipt or staging issues before downstream departments add labor.',
  },
  'Machine Shop': {
    requiredSkills: ['machine_operation'],
    readyAction:
      'Assign available machine operators to runnable work with material and machine status clear.',
    blockedAction:
      'Hold operator movement until machine, material, or upstream blockers are cleared.',
  },
  'Material Handling': {
    requiredSkills: ['material_handling'],
    readyAction:
      'Move available material handlers to staging, saw, laser, press, or delivery work that keeps downstream departments fed.',
    blockedAction:
      'Use material handling coverage to clear the blocker instead of adding labor to a stopped department.',
  },
  Fab: {
    requiredSkills: ['welding', 'fitting'],
    readyAction: 'Put qualified weld/fitting labor on runnable Fab orders first.',
    blockedAction:
      'Do not assign welders into work held by missing material, upstream process, or quality blockers.',
  },
  Coating: {
    requiredSkills: ['quality_check'],
    readyAction:
      'Assign coating support to work that is released and ready for surface finish flow.',
    blockedAction:
      'Do not move coating labor onto work that is still blocked by Fab, QA, material, or process holds.',
  },
  Assembly: {
    requiredSkills: ['assembly'],
    readyAction: 'Assign assemblers to ready kits where required inputs are present.',
    blockedAction:
      'Hold assembly starts until missing parts, QA holds, or upstream blockers are cleared.',
  },
  'Saddles Dept': {
    requiredSkills: ['assembly', 'machine_operation'],
    readyAction:
      'Staff saddle work when material, machine, and assembly requirements are clear.',
    blockedAction:
      'Do not tie up saddle labor if machine, material, or upstream flow is blocking the order.',
  },
  'Patch Clamps': {
    requiredSkills: ['assembly'],
    readyAction:
      'Assign patch clamp builders only where material and shared plant flow are clear.',
    blockedAction:
      'Check material and shared upstream blockers before increasing patch clamp labor.',
  },
  Clamps: {
    requiredSkills: ['assembly'],
    readyAction:
      'Assign clamp builders to ready work that can move without shared bottlenecks.',
    blockedAction:
      'Do not overstaff clamp work while material or upstream dependencies are blocked.',
  },
  QA: {
    requiredSkills: ['quality_check'],
    readyAction:
      'Assign QA support to inspections, releases, and checks that unblock downstream flow.',
    blockedAction:
      'Treat QA holds, failed checks, or missing inspection coverage as stop conditions before Shipping or Assembly proceeds.',
  },
  Shipping: {
    requiredSkills: ['shipping', 'material_handling'],
    readyAction: 'Stage and pack released orders that are ready to ship.',
    blockedAction:
      'Do not pack blocked work until QA release and completion status are clear.',
  },
  Maintenance: {
    requiredSkills: ['maintenance'],
    readyAction:
      'Assign maintenance coverage to the issue that unlocks the most plant flow.',
    blockedAction:
      'Escalate machine-down, safety, or line-down blockers before routine work.',
  },
};

export function getCrewGuidanceForDepartment(
  department: Department,
  context: Omit<CrewGuidanceContext, 'department'> = {},
): CrewGuidanceItem[] {
  return getCrewGuidance({
    department,
    orders: context.orders ?? productionOrders,
    workers: context.workers ?? workers,
    machines: context.machines ?? machines,
  });
}

export function getCrewGuidance({
  department,
  orders = productionOrders,
  workers: crew = workers,
  machines: plantMachines = machines,
}: CrewGuidanceContext): CrewGuidanceItem[] {
  const rule = departmentCrewRules[department];
  const departmentOrders = getOrdersForDepartment(orders, department);
  const availableWorkers = getAvailableWorkersForDepartment(crew, department);
  const matchedWorkers = getMatchedWorkers(availableWorkers, rule.requiredSkills);
  const missingSkills = getMissingSkills(rule.requiredSkills, matchedWorkers);
  const runnableOrders = departmentOrders.filter(isRunnableOrder);
  const blockedOrders = departmentOrders.filter(isBlockedOrder);
  const departmentMachines = plantMachines.filter(
    (machine) => machine.department === department,
  );
  const machineBlockers = getMachineBlockerTypes(departmentMachines);
  const blockerTypes = getBlockerTypes(blockedOrders, machineBlockers);

  const guidance: CrewGuidanceItem[] = [];

  if (blockedOrders.length > 0 || machineBlockers.length > 0) {
    guidance.push({
      id: `${toId(department)}-critical-blockers`,
      level: 'critical',
      department,
      title: `${department} has blocking conditions`,
      message: getCriticalMessage(blockedOrders.length, machineBlockers),
      action: rule.blockedAction,
      orderNumbers: getOrderNumbers(blockedOrders),
      workerIds: matchedWorkers.map((worker) => worker.id),
      requiredSkills: rule.requiredSkills,
      missingSkills,
      blockerTypes,
    });
  }

  if (runnableOrders.length > 0 && matchedWorkers.length === 0) {
    guidance.push({
      id: `${toId(department)}-role-mismatch`,
      level: 'warning',
      department,
      title: `${department} has runnable work without matched crew`,
      message: `Runnable work exists, but available crew does not cover ${formatSkills(
        rule.requiredSkills,
      )}.`,
      action:
        'Reassign qualified help or wait until a matching worker is available before moving the job.',
      orderNumbers: getOrderNumbers(runnableOrders),
      workerIds: availableWorkers.map((worker) => worker.id),
      requiredSkills: rule.requiredSkills,
      missingSkills,
      blockerTypes: ['labor'],
    });
  }

  if (runnableOrders.length > 0 && matchedWorkers.length > 0) {
    guidance.push({
      id: `${toId(department)}-runnable-with-crew`,
      level: 'info',
      department,
      title: `${department} has runnable work with matched crew`,
      message: `${runnableOrders.length} active order${
        runnableOrders.length === 1 ? '' : 's'
      } can move with available role fit.`,
      action: rule.readyAction,
      orderNumbers: getOrderNumbers(runnableOrders),
      workerIds: matchedWorkers.map((worker) => worker.id),
      requiredSkills: rule.requiredSkills,
      missingSkills: [],
      blockerTypes: [],
    });
  }

  if (guidance.length === 0) {
    guidance.push({
      id: `${toId(department)}-steady-state`,
      level: 'info',
      department,
      title: `${department} has no crew move triggered`,
      message:
        'No current order, worker, or flow condition requires a crew guidance action.',
      action: 'Maintain normal coverage and monitor for new blockers.',
      orderNumbers: [],
      workerIds: matchedWorkers.map((worker) => worker.id),
      requiredSkills: rule.requiredSkills,
      missingSkills,
      blockerTypes: [],
    });
  }

  return guidance;
}

export function getOrdersForDepartment(
  orders: ProductionOrder[],
  department: Department,
): ProductionOrder[] {
  return orders.filter(
    (order) =>
      order.currentDepartment === department || order.nextDepartment === department,
  );
}

export function getAvailableWorkersForDepartment(
  crew: Worker[],
  department: Department,
): Worker[] {
  return crew.filter(
    (worker) =>
      worker.availability === 'available' &&
      (worker.currentDepartment === department ||
        worker.homeDepartment === department),
  );
}

function getMatchedWorkers(
  availableWorkers: Worker[],
  requiredSkills: WorkerSkill[],
): Worker[] {
  return availableWorkers.filter((worker) =>
    requiredSkills.some((skill) => worker.skills.includes(skill)),
  );
}

function getMissingSkills(
  requiredSkills: WorkerSkill[],
  matchedWorkers: Worker[],
): WorkerSkill[] {
  const coveredSkills = new Set(
    matchedWorkers.flatMap((worker) => worker.skills),
  );

  return requiredSkills.filter((skill) => !coveredSkills.has(skill));
}

function isRunnableOrder(order: ProductionOrder): boolean {
  return order.flowStatus === 'runnable' && order.status !== 'complete';
}

function isBlockedOrder(order: ProductionOrder): boolean {
  return order.flowStatus === 'blocked' || order.blockers.length > 0;
}

function getBlockerTypes(
  blockedOrders: ProductionOrder[],
  machineBlockers: FlowBlockerType[],
): FlowBlockerType[] {
  const blockerTypes = new Set<FlowBlockerType>();

  blockedOrders.forEach((order) => {
    order.blockers.forEach((blocker) => blockerTypes.add(blocker.type));
  });

  machineBlockers.forEach((blocker) => blockerTypes.add(blocker));

  return Array.from(blockerTypes);
}

function getMachineBlockerTypes(departmentMachines: Machine[]): FlowBlockerType[] {
  const blockerTypes = new Set<FlowBlockerType>();

  departmentMachines.forEach((machine) => {
    if (
      machine.state === 'ALARM' ||
      machine.state === 'OFFLINE' ||
      machine.simulationStatus === 'BLOCKED'
    ) {
      blockerTypes.add('machine');
    }
  });

  return Array.from(blockerTypes);
}

function getCriticalMessage(
  blockedOrderCount: number,
  machineBlockers: FlowBlockerType[],
): string {
  const orderText =
    blockedOrderCount === 0
      ? 'No blocked orders are listed'
      : `${blockedOrderCount} order${
          blockedOrderCount === 1 ? '' : 's'
        } are blocked`;

  const machineText =
    machineBlockers.length === 0
      ? 'no machine blocker is active'
      : 'machine status is blocking flow';

  return `${orderText}, and ${machineText}.`;
}

function getOrderNumbers(orders: ProductionOrder[]): string[] {
  return orders.map((order) => order.orderNumber);
}

function formatSkills(skills: WorkerSkill[]): string {
  return skills.map(formatSkill).join(', ');
}

function formatSkill(skill: WorkerSkill): string {
  return skill
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}