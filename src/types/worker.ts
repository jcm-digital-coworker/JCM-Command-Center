import type { Department } from './machine';

export type WorkerSkill =
  | 'MATERIAL_HANDLING'
  | 'RECEIVING'
  | 'MACHINE_OPERATION'
  | 'FAB_WELDING'
  | 'FAB_FITTING'
  | 'COATING'
  | 'ASSEMBLY'
  | 'SHIPPING'
  | 'QA_INSPECTION'
  | 'MAINTENANCE'
  | 'LEADERSHIP';

export type WorkerStatus = 'AVAILABLE' | 'ASSIGNED' | 'BREAK' | 'OFFLINE';

export type Worker = {
  id: string;
  name: string;
  role: string;
  primaryDepartment: Department;
  secondaryDepartments?: Department[];
  skills: WorkerSkill[];
  status: WorkerStatus;
  assignedOrderNumber?: string;
};
