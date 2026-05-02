import type { Department } from './machine';
import type { ProductionOrder, FlowBlocker, MaterialStatus, QaStatus } from './productionOrder';

export type TravelerStepStatus = 'NOT_READY' | 'READY' | 'ACTIVE' | 'BLOCKED' | 'DONE' | 'HOLD';

export type TravelerResourceType =
  | 'MACHINE'
  | 'WORK_CELL'
  | 'PROCESS_ZONE'
  | 'STATION'
  | 'INSPECTION'
  | 'STAGING'
  | 'DOCK'
  | 'SUPPORT';

export type TravelerResourceStatus = 'AVAILABLE' | 'BUSY' | 'DOWN' | 'UNKNOWN';

export type TravelerCapability =
  | 'large-turning'
  | 'turning'
  | 'small-turning'
  | 'milling'
  | 'coupling'
  | 'service-saddle'
  | 'tapping-sleeve'
  | 'repair-fitting'
  | 'restrainer'
  | 'pipe-fabrication'
  | 'engineered-fitting'
  | 'fabrication'
  | 'welding'
  | 'coating-prep'
  | 'powder-coat'
  | 'assembly'
  | 'inspection'
  | 'receiving'
  | 'shipping'
  | 'material-staging';

export type TravelerResource = {
  id: string;
  label: string;
  department: Department;
  type: TravelerResourceType;
  status: TravelerResourceStatus;
  capabilities: TravelerCapability[];
  notes?: string[];
};

export type TravelerActionType =
  | 'OPEN_DETAIL'
  | 'OPEN_DEPARTMENT_TRAVELER'
  | 'OPEN_PLANT_TRAVELER'
  | 'REQUEST_MATERIAL'
  | 'REPORT_ISSUE'
  | 'REPORT_RESOURCE_MISMATCH'
  | 'MARK_READY_FOR_HANDOFF'
  | 'SEND_TO_NEXT_DEPARTMENT'
  | 'OPEN_FULL_ORDER';

export type TravelerAction = {
  type: TravelerActionType;
  label: string;
  enabled: boolean;
  reason?: string;
};

export type DynamicTraveler = {
  id: string;
  order: ProductionOrder;
  department: Department;
  stepStatus: TravelerStepStatus;
  currentInstruction: string;
  nextHandoff?: Department | 'Complete';
  capableResources: TravelerResource[];
  bestResource?: TravelerResource;
  blockers: FlowBlocker[];
  materialStatus: MaterialStatus;
  qaStatus: QaStatus;
  actions: TravelerAction[];
  priorityScore: number;
  visualSignal: 'READY' | 'BLOCKED' | 'WATCH' | 'HOLD' | 'DONE';
};

export type PlantTravelerStatus = 'NOT_RELEASED' | 'READY' | 'ACTIVE' | 'BLOCKED' | 'HOLD' | 'COMPLETE';

export type PlantTraveler = {
  id: string;
  order: ProductionOrder;
  route: Department[];
  departmentSteps: DynamicTraveler[];
  activeDepartment?: Department;
  nextDepartment?: Department | 'Complete';
  overallStatus: PlantTravelerStatus;
  completionPercent: number;
  completedStepCount: number;
  totalStepCount: number;
  blockers: FlowBlocker[];
  currentInstruction: string;
};
