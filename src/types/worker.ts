import type { Department } from './machine';

export type WorkerAvailability = 'available' | 'assigned' | 'unavailable';

export type WorkerRole =
  | 'operator'
  | 'lead'
  | 'supervisor'
  | 'material_handler'
  | 'receiver'
  | 'welder'
  | 'fitter'
  | 'assembler'
  | 'shipping'
  | 'maintenance'
  | 'qa_support';

export type WorkerSkill =
  | 'receiving'
  | 'material_handling'
  | 'machine_operation'
  | 'welding'
  | 'fitting'
  | 'assembly'
  | 'shipping'
  | 'maintenance'
  | 'quality_check'
  | 'leadership';

export type Worker = {
  id: string;
  name: string;
  homeDepartment: Department;
  currentDepartment: Department;
  availability: WorkerAvailability;
  roles: WorkerRole[];
  skills: WorkerSkill[];
};