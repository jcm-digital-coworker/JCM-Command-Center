import type { Department } from './machine';

export type ReceivingOrderStatus =
  | 'ORDERED'
  | 'ARRIVING_TODAY'
  | 'CHECKED_IN'
  | 'CLAIMED_FOR_DELIVERY'
  | 'DELIVERED'
  | 'PROBLEM_HOLD';

export type ReceivingOrderPriority = 'NORMAL' | 'HOT' | 'CRITICAL';

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

export type ReceivingGateStatus = 'QUEUED' | 'VERIFY_REQUIRED' | 'READY_FOR_CLAIM' | 'IN_TRANSIT' | 'HOLD' | 'COMPLETE';
export type ReceivingExceptionType = 'DAMAGE' | 'MISSING_PAPERWORK' | 'WRONG_ITEM' | 'SHORT_QTY' | 'OTHER';
export type ReceivingLaneType = 'PRODUCTION' | 'LOGISTICS' | 'SUPPORT';

export type ReceivingPressureSummary = {
  total: number;
  arriving: number;
  ready: number;
  claimed: number;
  holds: number;
  critical: number;
};
