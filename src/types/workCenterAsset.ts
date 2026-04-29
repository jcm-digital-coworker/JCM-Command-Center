import type { Department } from './machine';

export type WorkCenterAssetStatus = 'AVAILABLE' | 'ASSIGNED' | 'NEEDS_SERVICE' | 'OFFLINE';

export type WorkCenterAsset = {
  id: string;
  department: Department;
  name: string;
  assetType: 'Forklift' | 'Pallet Jack' | 'Cart' | 'Station' | 'Support Equipment';
  status: WorkCenterAssetStatus;
  assignedTo?: string;
  lastKnownState: string;
  nextAction?: string;
};
