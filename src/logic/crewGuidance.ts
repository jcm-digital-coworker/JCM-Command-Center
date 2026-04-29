import {
  getAvailableWorkersForDepartment as getModuleAvailableWorkersForDepartment,
  getCrewGuidance,
  getOrdersForDepartment as getModuleOrdersForDepartment,
} from '../modules/crewGuidance';
import type {
  CrewGuidanceBlockerType,
  CrewGuidanceItem,
  CrewGuidanceLevel,
} from '../modules/crewGuidance';
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
  level: CrewGuidanceLevel;
  action: string;
  requiredSkills: WorkerSkill[];
  missingSkills: WorkerSkill[];
  blockerTypes: CrewGuidanceBlockerType[];
};

export function getWorkersForDepartment(
  workers: Worker[],
  department: Department,
) {
  return workers.filter(
    (worker) =>
      worker.primaryDepartment === department ||
      worker.secondaryDepartments?.includes(department),
  );
}

export function getAvailableWorkersForDepartment(
  workers: Worker[],
  department: Department,
) {
  return getModuleAvailableWorkersForDepartment(workers, department);
}

export function getOrdersForDepartment(
  orders: ProductionOrder[],
  department: Department,
) {
  return getModuleOrdersForDepartment(orders, department);
}

export function getCrewGuidanceForDepartment(
  department: Department,
  orders: ProductionOrder[],
  workers: Worker[],
): CrewGuidanceRecommendation[] {
  const guidanceItems = getCrewGuidance({
    department,
    orders,
    workers,
  });

  return guidanceItems.map((item) => toRecommendation(item, workers));
}

function toRecommendation(
  item: CrewGuidanceItem,
  workers: Worker[],
): CrewGuidanceRecommendation {
  return {
    id: item.id,
    tone: toLegacyTone(item.level),
    title: item.title,
    reason: `${item.message} ${item.action}`,
    suggestedRoles: item.requiredSkills.map(formatSkill),
    availableWorkers: workers.filter((worker) => item.workerIds.includes(worker.id)),
    orderNumbers: item.orderNumbers,
    level: item.level,
    action: item.action,
    requiredSkills: item.requiredSkills,
    missingSkills: item.missingSkills,
    blockerTypes: item.blockerTypes,
  };
}

function toLegacyTone(level: CrewGuidanceLevel): CrewGuidanceTone {
  if (level === 'critical') return 'HOLD';
  if (level === 'warning') return 'WATCH';
  return 'GO';
}

function formatSkill(skill: WorkerSkill) {
  return skill
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}