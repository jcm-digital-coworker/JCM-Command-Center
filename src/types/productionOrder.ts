import type { Department } from './machine';
import type { WorkerSkill } from './worker';

export type ProductionOrderStatus =
  | 'READY'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'HOLD'
  | 'DONE'
  | 'COMPLETE'
  | 'ready'
  | 'running'
  | 'blocked'
  | 'hold'
  | 'complete';

export type FlowStatus = 'runnable' | 'blocked' | 'RUNNABLE' | 'BLOCKED';

export type ProductLane =
  | 'SERVICE_SADDLE'
  | 'CLAMP'
  | 'PATCH_CLAMP'
  | 'COUPLING'
  | 'TAPPING_SLEEVE'
  | 'ENGINEERED_FITTING'
  | 'PIPE_FABRICATION'
  | 'OTHER';

export type ProductionOrderType = 'STANDARD' | 'ENGINEERED' | 'REPAIR' | 'SERVICE' | 'UNKNOWN';

export type WorkflowOrigin = 'SALES' | 'LEGACY_SHOP_FLOOR';

export type MaterialStatus =
  | 'RECEIVED'
  | 'PARTIAL'
  | 'NOT_RECEIVED'
  | 'STAGED'
  | 'MISSING'
  | 'ORDER_REQUIRED'
  | 'UNKNOWN';

export type QaStatus =
  | 'NOT_REQUIRED'
  | 'PENDING'
  | 'PASSED'
  | 'FAILED'
  | 'HOLD'
  | 'RELEASED'
  | 'UNKNOWN';

export type FlowBlockerType =
  | 'material'
  | 'upstream'
  | 'process'
  | 'quality'
  | 'labor'
  | 'machine'
  | 'unknown';

export type BlockedReason =
  | 'WAITING_ON_MATERIAL'
  | 'WAITING_ON_LASER'
  | 'WAITING_ON_PRESS'
  | 'WAITING_ON_MACHINE_SHOP'
  | 'WAITING_ON_FAB'
  | 'WAITING_ON_COATING'
  | 'WAITING_ON_ASSEMBLY'
  | 'WAITING_ON_QA'
  | 'WAITING_ON_SHIPPING'
  | 'MACHINE_DOWN'
  | 'LABOR_SHORTAGE'
  | 'ENGINEERING_HOLD'
  | 'QUALITY_HOLD'
  | 'UNKNOWN';

export type FlowBlocker = {
  type: FlowBlockerType;
  message: string;
};

export type OrderDependency = {
  id: string;
  label: string;
  department?: Department;
  required: boolean;
  status: 'READY' | 'DOWN' | 'UNKNOWN';
  blockedReason?: BlockedReason;
};

export type ProductionOrder = {
  id: string;
  orderNumber: string;
  productFamily: string;
  currentDepartment: Department;
  nextDepartment?: Department;
  status: ProductionOrderStatus;
  flowStatus: FlowStatus;
  requiredSkills: WorkerSkill[];
  blockers: FlowBlocker[];
  priority: 'normal' | 'hot' | 'critical' | 'NORMAL' | 'HOT' | 'CRITICAL';

  productLane?: ProductLane;
  orderType?: ProductionOrderType;
  workflowOrigin?: WorkflowOrigin;
  blockedReason?: BlockedReason;
  notes?: string[];

  blueprintId?: string;
  partNumber?: string;
  drawingRevision?: string;
  salesReleasedAt?: string;
  engineeringRequired?: boolean;
  engineeringStatus?: 'NOT_REQUIRED' | 'PENDING' | 'RELEASED' | 'HOLD';
  productionSupervisorAcknowledged?: boolean;
  materialStatus?: MaterialStatus;
  materialAvailableDate?: string;
  qaStatus?: QaStatus;
  projectedShipDate?: string;
  assemblyPartNumber?: string;
  customer?: string;
  quantity?: number;
  requiredDepartments?: Department[];
  dependencies?: OrderDependency[];
  lastAction?: string;
  lastActionAt?: string;
};
