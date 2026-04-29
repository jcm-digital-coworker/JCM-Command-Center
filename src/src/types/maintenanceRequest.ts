export type MaintenanceRequestPriority = 'NORMAL' | 'URGENT' | 'LINE_DOWN' | 'SAFETY' | 'MACHINE_DOWN';

export type MaintenanceRequestStatus =
  | 'NEW'
  | 'CLAIMED'
  | 'IN_PROGRESS'
  | 'COMPLETED';

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
}
