import type { Department } from './machine';

export type RoleFamily =
  | 'MACHINE'
  | 'MATERIAL'
  | 'FAB'
  | 'COATING'
  | 'ASSEMBLY'
  | 'SHIPPING'
  | 'RECEIVING'
  | 'QA'
  | 'MAINTENANCE'
  | 'SUPERVISION'
  | 'OFFICE';

export type WorkRole = {
  id: string;
  label: string;
  family: RoleFamily;
  appliesTo: Department[] | 'ALL';
  defaultTab: 'dashboard' | 'machines' | 'maintenance' | 'receiving' | 'coverage' | 'orders' | 'plantMap' | 'flow' | 'risk';
  description: string;
};
