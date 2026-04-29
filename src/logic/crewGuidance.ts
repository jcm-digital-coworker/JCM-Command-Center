import type { Department } from '../types/machine';
import type { ProductionOrder } from '../types/productionOrder';
import type { Worker, WorkerSkill } from '../types/worker';

export type CrewGuidanceTone = 'GO' | 'WATCH' | 'HOLD';

export type CrewGuidanceRecommendation = {
  id: string;
  tone: CrewGuidanceTone;
  title: string;
  reason: string;
  suggestedRoles: string[];
  availableWorkers: Worker[];
  orderNumbers: string[];
};

type DepartmentCrewRule = {
  skills: WorkerSkill[];
  actionRole: string;
  runnableAction: string;
  blockedAction: string;
};

const crewRules: Record<Department, DepartmentCrewRule> = {
  Receiving: {
    skills: ['RECEIVING', 'MATERIAL_HANDLING'],
    actionRole: 'receiver / material handler',
    runnableAction: 'Stage material for orders with received or partial material status.',
    blockedAction: 'Focus on orders blocked by material before assigning extra labor downstream.',
  },
  'Material Handling': {
    skills: ['MATERIAL_HANDLING', 'MACHINE_OPERATION'],
    actionRole: 'material handler / equipment operator',
    runnableAction: 'Feed runnable orders through laser, press, saw, roll, or staging work.',
    blockedAction: 'Do not overstaff hard-blocked equipment. Use crew to clear staging or alternate lanes.',
  },
  'Machine Shop': {
    skills: ['MACHINE_OPERATION'],
    actionRole: 'machine operator',
    runnableAction: 'Staff runnable machine work only after material and required dependencies are ready.',
    blockedAction: 'Hold machine labor if the blocker is upstream material or engineering.',
  },
  Fab: {
    skills: ['FAB_WELDING', 'FAB_FITTING'],
    actionRole: 'welder / fitter',
    runnableAction: 'Put skilled fab labor on runnable work cells with the nearest ship dates.',
    blockedAction: 'Avoid sending welders to orders held by engineering, QA, or missing material.',
  },
  Coating: {
    skills: ['COATING'],
    actionRole: 'coating tech',
    runnableAction: 'Assign coating techs to orders that are ready for blast, paint, dip, passivation, or cure flow.',
    blockedAction: 'Do not staff coating heavily when orders are still blocked upstream.',
  },
  Assembly: {
    skills: ['ASSEMBLY'],
    actionRole: 'assembler',
    runnableAction: 'Build ready kits first. Assembly labor is best used where all inputs are present.',
    blockedAction: 'Do not start partial kits unless the missing input is already being cleared.',
  },
  'Saddles Dept': {
    skills: ['ASSEMBLY'],
    actionRole: 'saddle assembler',
    runnableAction: 'Staff saddle work when laser, press-building, and material readiness are clear.',
    blockedAction: 'Avoid tying up labor if saddle work is blocked by laser or press-building dependencies.',
  },
  'Patch Clamps': {
    skills: ['ASSEMBLY', 'FAB_WELDING'],
    actionRole: 'patch clamp builder',
    runnableAction: 'Use this bypass lane when Material Handling is constrained and patch clamp orders are ready.',
    blockedAction: 'Check material status first. Patch clamps are useful only when the needed inputs are present.',
  },
  Clamps: {
    skills: ['ASSEMBLY'],
    actionRole: 'clamp assembler',
    runnableAction: 'Staff clamp work when shared laser and press-building dependencies are clear.',
    blockedAction: 'Avoid overstaffing clamps if the blocker is Material Handling or missing inputs.',
  },
  QA: {
    skills: ['QA_INSPECTION'],
    actionRole: 'QA inspector',
    runnableAction: 'Clear pending QA checks that protect Shipping from bad exits.',
    blockedAction: 'Prioritize holds and failures before routine pending checks.',
  },
  Shipping: {
    skills: ['SHIPPING', 'MATERIAL_HANDLING'],
    actionRole: 'shipping / staging co-worker',
    runnableAction: 'Stage ship-ready orders and chase near-ready orders held by QA or missing completion.',
    blockedAction: 'Do not pack work that lacks QA release or completion confirmation.',
  },
  Maintenance: {
    skills: ['MAINTENANCE'],
    actionRole: 'maintenance co-worker',
    runnableAction: 'Assign maintenance to plant blockers that unlock the most orders.',
    blockedAction: 'Escalate safety or line-down issues before routine work.',
  },
  Office: {
    skills: ['LEADERSHIP'],
    actionRole: 'office / engineering support',
    runnableAction: 'Clear engineered-order questions, holds, and missing specification decisions.',
    blockedAction: 'Do not push engineered work forward without the required review.',
  },
};

export function getWorkersForDepartment(workers: Worker[], department: Department) {
  return workers.filter((worker) =>
    worker.primaryDepartment === department || worker.secondaryDepartments?.includes(department),
  );
}

export function getAvailableWorkersForDepartment(workers: Worker[], department: Department) {
  return getWorkersForDepartment(workers, department).filter((worker) => worker.status === 'AVAILABLE');
}

export function getOrdersForDepartment(orders: ProductionOrder[], department: Department) {
  return orders.filter((order) => order.currentDepartment === department || order.requiredDepartments.includes(department));
}

export function getCrewGuidanceForDepartment(
  department: Department,
  orders: ProductionOrder[],
  workers: Worker[],
): CrewGuidanceRecommendation[] {
  const rule = crewRules[department];
  const departmentOrders = getOrdersForDepartment(orders, department);
  const available = getAvailableWorkersForDepartment(workers, department);
  const skilledAvailable = available.filter((worker) => worker.skills.some((skill) => rule.skills.includes(skill)));
  const runnable = sortOrdersForGuidance(
    departmentOrders.filter((order) => order.status === 'READY' || order.status === 'IN_PROGRESS'),
  );
  const blocked = sortOrdersForGuidance(departmentOrders.filter((order) => order.status === 'BLOCKED'));
  const recommendations: CrewGuidanceRecommendation[] = [];

  if (runnable.length > 0 && skilledAvailable.length > 0) {
    recommendations.push({
      id: `${department}-runnable`,
      tone: 'GO',
      title: `Use ${Math.min(skilledAvailable.length, Math.max(1, runnable.length))} available ${rule.actionRole}`,
      reason: `${runnable.length} order${runnable.length === 1 ? '' : 's'} can move here now. ${rule.runnableAction}`,
      suggestedRoles: [rule.actionRole],
      availableWorkers: skilledAvailable,
      orderNumbers: runnable.slice(0, 3).map((order) => order.orderNumber),
    });
  }

  if (runnable.length > 0 && skilledAvailable.length === 0) {
    recommendations.push({
      id: `${department}-no-crew`,
      tone: 'WATCH',
      title: `Runnable work exists, but no available ${rule.actionRole} is shown`,
      reason: 'Flow is ready, but crew availability is the likely constraint. Check nearby secondary-department coverage before calling the order blocked.',
      suggestedRoles: [rule.actionRole],
      availableWorkers: [],
      orderNumbers: runnable.slice(0, 3).map((order) => order.orderNumber),
    });
  }

  if (blocked.length > 0) {
    recommendations.push({
      id: `${department}-blocked`,
      tone: 'HOLD',
      title: `Do not overstaff ${department} until blockers are cleared`,
      reason: `${blocked.length} order${blocked.length === 1 ? '' : 's'} touching this area are blocked. ${rule.blockedAction}`,
      suggestedRoles: [rule.actionRole],
      availableWorkers: skilledAvailable,
      orderNumbers: blocked.slice(0, 3).map((order) => order.orderNumber),
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: `${department}-steady`,
      tone: 'WATCH',
      title: `No major crew move recommended for ${department}`,
      reason: 'No runnable or blocked sample orders currently demand a crew shift here. Keep normal coverage and watch for new material, QA, or shipping signals.',
      suggestedRoles: [rule.actionRole],
      availableWorkers: skilledAvailable,
      orderNumbers: [],
    });
  }

  return recommendations;
}

function sortOrdersForGuidance(orders: ProductionOrder[]) {
  return [...orders].sort((a, b) => {
    const priorityDiff = orderPriorityRank(a) - orderPriorityRank(b);
    if (priorityDiff !== 0) return priorityDiff;
    return a.projectedShipDate.localeCompare(b.projectedShipDate);
  });
}

function orderPriorityRank(order: ProductionOrder) {
  if (order.orderType === 'EXPEDITE') return 0;
  if (order.orderType === 'ENGINEERED') return 1;
  return 2;
}
