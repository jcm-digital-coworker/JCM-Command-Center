export type MaintenanceRequestPriority = 'NORMAL' | 'URGENT' | 'LINE_DOWN' | 'SAFETY' | 'MACHINE_DOWN';

export type MaintenanceRequestStatus =
  | 'NEW'
  | 'CLAIMED'
  | 'IN_PROGRESS'
  | 'WAITING_ON_PARTS'
  | 'WAITING_ON_VENDOR'
  | 'WAITING_ON_PRODUCTION_WINDOW'
  | 'COMPLETED';

export type MaintenanceErpSyncStatus = 'NOT_READY' | 'READY_TO_EXPORT' | 'EXPORTED' | 'SYNCED';

export interface MaintenanceRequest {
  id: string;
  machineId: string; // Legacy field. Now means selected asset / area / machine id.
  machineName: string; // Legacy field. Now means selected asset / area / machine name.
  department: string;

  priority: MaintenanceRequestPriority;
  problem: string;
  submittedBy: string;
  submittedAt: string;

  status: MaintenanceRequestStatus;
  claimedBy?: string;
  claimedAt?: string;

  completedBy?: string;
  completedAt?: string;
  workDone?: string;
  partsUsed?: string;
  photos?: string[]; // base64 data URLs

  // Epicor / CMMS staging fields. These keep the floor app ready for ERP handoff without becoming the ERP.
  epicorAssetId?: string;
  epicorWorkOrderId?: string;
  costCenter?: string;
  failureCode?: string;
  rootCauseCode?: string;
  downtimeMinutes?: number;
  laborHours?: number;
  technicianNotes?: string;
  partsNeeded?: string;
  pmType?: 'CALENDAR' | 'RUNTIME' | 'CYCLE' | 'CONDITION';
  erpSyncStatus?: MaintenanceErpSyncStatus;
}
