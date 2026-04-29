import type { Department } from './machine';

export type OrderType = 'STANDARD' | 'EXPEDITE' | 'ENGINEERED';

export type ProductFamily =
  | 'REPAIR_FITTING'
  | 'COUPLING'
  | 'SERVICE_SADDLE'
  | 'TAPPING_SLEEVE'
  | 'RESTRAINER'
  | 'PIPE_FABRICATION'
  | 'ENGINEERED_FITTING';

export type ProductLane =
  | 'SERVICE_SADDLE'
  | 'CLAMP'
  | 'PATCH_CLAMP'
  | 'COUPLING'
  | 'TAPPING_SLEEVE'
  | 'ENGINEERED_FITTING'
  | 'PIPE_FABRICATION'
  | 'OTHER';

export type MaterialStatus = 'NOT_RECEIVED' | 'PARTIAL' | 'RECEIVED';

export type OrderStatus = 'WAITING' | 'READY' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';

export type QaStatus = 'NOT_REQUIRED' | 'PENDING' | 'PASSED' | 'FAILED' | 'HOLD';

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

export type DependencyStatus = 'AVAILABLE' | 'DOWN' | 'UNKNOWN';

export type OrderDependency = {
  name: string;
  type: 'DEPARTMENT' | 'MACHINE' | 'WORK_CELL' | 'PERSON' | 'BUILDING' | 'PROCESS_ZONE';
  status: DependencyStatus;
  required: boolean;
};

export type ProductionOrder = {
  orderNumber: string;
  orderType: OrderType;
  customer: string;
  quantity: number;
  projectedShipDate: string;
  assemblyPartNumber: string;
  componentPartNumbers?: string[];
  productFamily: ProductFamily;
  productLane?: ProductLane;
  materialStatus: MaterialStatus;
  status: OrderStatus;
  currentDepartment: Department;
  requiredDepartments: Department[];
  dependencies: OrderDependency[];
  blockedReason?: BlockedReason;
  qaStatus: QaStatus;
  notes?: string[];
};
