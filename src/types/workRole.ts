import type { Department } from './machine';
import type { AppTab } from './app';

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
  defaultTab: AppTab;
  description: string;
};
