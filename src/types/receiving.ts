import type { Department } from './machine';

export type ReceivingOrderStatus =
  | 'ORDERED'
  | 'ARRIVING_TODAY'
  | 'CHECKED_IN'
  | 'CLAIMED_FOR_DELIVERY'
  | 'DELIVERED'
  | 'PROBLEM_HOLD';

export type ReceivingOrderPriority = 'NORMAL' | 'HOT' | 'CRITICAL';

export type ReceivingGateStatus =
  | 'NOT_ARRIVED'
  | 'ARRIVING_TODAY'
  | 'INSPECTION_NEEDED'
  | 'READY_TO_STAGE'
  | 'CLAIMED_FOR_DELIVERY'
  | 'STAGED_OR_DELIVERED'
  | 'EXCEPTION_HOLD';

export type ReceivingExceptionType =
  | 'SHORTAGE'
  | 'DAMAGE'
  | 'WRONG_MATERIAL'
  | 'MISSING_PAPERWORK'
  | 'VENDOR_ISSUE'
  | 'ENGINEERING_REVIEW';

export type ReceivingLaneType =
  | 'PRODUCTION_ORDER_MATERIAL'
  | 'MAINTENANCE_PART'
  | 'TOOLING'
  | 'CONSUMABLE'
  | 'UNKNOWN_REVIEW';

export type ReceivingOrder = {
  id: string;
  itemName: string;
  description: string;
  quantity: string;
  orderedBy: string;
  requesterDepartment: Department;
  destinationDepartment: Department;
  destinationDetail: string;
  expectedDate: string;
  supplier: string;
  poOrReceiver: string;
  priority: ReceivingOrderPriority;
  status: ReceivingOrderStatus;
  receiverCheckedBy?: string;
  receiverCheckedAt?: string;
  receiverNotes?: string;
  claimedBy?: string;
  claimedAt?: string;
  deliveredBy?: string;
  deliveredAt?: string;
  deliveryNotes?: string;
  notificationLog: ReceivingNotification[];
};

export type ReceivingNotification = {
  id: string;
  at: string;
  audience: string;
  message: string;
};

export type ReceivingOrderDraft = {
  itemName: string;
  description: string;
  quantity: string;
  orderedBy: string;
  requesterDepartment: Department;
  destinationDepartment: Department;
  destinationDetail: string;
  expectedDate: string;
  supplier: string;
  poOrReceiver: string;
  priority: ReceivingOrderPriority;
};

export type ReceivingPressureSummary = {
  open: number;
  notArrived: number;
  arrivingToday: number;
  inspectionNeeded: number;
  readyToStage: number;
  claimedForDelivery: number;
  stagedOrDelivered: number;
  exceptionHolds: number;
  hotOrCritical: number;
  oldestOpenAgeHours: number | null;
};
