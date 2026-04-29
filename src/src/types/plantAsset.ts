import type { Department } from './machine';

export type PlantAssetKind =
  | 'DEPARTMENT'
  | 'MACHINE'
  | 'WORK_CELL'
  | 'PROCESS_ZONE'
  | 'BUILDING'
  | 'MANUAL_EQUIPMENT'
  | 'PERSONNEL_GROUP';

export type PlantAssetStatus = 'ACTIVE' | 'WATCH' | 'DOWN' | 'UNKNOWN' | 'PLANNED';

export type PlantAsset = {
  id: string;
  name: string;
  ownerDepartment: Department;
  physicalArea: string;
  kind: PlantAssetKind;
  status: PlantAssetStatus;
  primaryFunction: string;
  feeds: string[];
  notes?: string[];
  riskFlags?: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
};
