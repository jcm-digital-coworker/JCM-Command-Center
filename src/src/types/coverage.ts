import type { Department } from './machine';

export type CoverageStatus = 'AVAILABLE' | 'ASSIGNED' | 'BREAK' | 'OFFLINE';
export type ShiftName = 'Day' | 'Night' | 'Weekend';

export type CoveragePerson = {
  id: string;
  name: string;
  department: Department;
  role: string;
  station: string;
  shift: ShiftName;
  status: CoverageStatus;
  signedInAt?: string;
  assignedTo?: string;
  skillTags: string[];
};

export type CoverageDraft = {
  name: string;
  department: Department;
  role: string;
  station: string;
  shift: ShiftName;
};
