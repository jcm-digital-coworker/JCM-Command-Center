import type { Department } from '../../types/machine';
import type { FlowBlockerType, ProductionOrder } from '../../types/productionOrder';
import type { Worker, WorkerSkill } from '../../types/worker';

export type CrewGuidanceLevel = 'info' | 'warning' | 'critical';

export type CrewGuidanceBlockerType = FlowBlockerType;

export type CrewGuidanceItem = {
  id: string;
  level: CrewGuidanceLevel;
  department: Department;
  title: string;
  message: string;
  action: string;
  requiredSkills: WorkerSkill[];
  missingSkills: WorkerSkill[];
  blockerTypes: CrewGuidanceBlockerType[];
  orderNumbers: string[];
  workerIds: string[];
};

export type CrewGuidanceInput = {
  department: Department;
  orders: ProductionOrder[];
  workers: Worker[];
};

export type DepartmentCrewRequirement = {
  requiredSkills: WorkerSkill[];
  actionRole: string;
  readyAction: string;
  blockedAction: string;
};

export type CrewGuidanceOrderGroup = {
  runnableOrders: ProductionOrder[];
  blockedOrders: ProductionOrder[];
  blockerTypes: CrewGuidanceBlockerType[];
};

export type CrewGuidanceWorkerGroup = {
  availableWorkers: Worker[];
  skilledAvailableWorkers: Worker[];
  missingSkills: WorkerSkill[];
};

export type BlockedReasonMap = Record<string, CrewGuidanceBlockerType>;