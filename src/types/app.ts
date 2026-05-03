import type { Department } from './machine';

export type AppTab =
  | 'workflow'
  | 'dashboard'
  | 'machines'
  | 'alerts'
  | 'simulation'
  | 'maintenance'
  | 'receiving'
  | 'coverage'
  | 'orders'
  | 'plantMap'
  | 'materialHandling'
  | 'fab'
  | 'coating'
  | 'assembly'
  | 'shipping'
  | 'qa'
  | 'sales'
  | 'engineering'
  | 'saddles'
  | 'documents'
  | 'risk'
  | 'shiftHandoff'
  | 'warRoomContext';

export type DepartmentFilter = 'All' | Department;

type CurrentRoleView =
  | 'Production'
  | 'Department Lead'
  | 'Department Supervisor'
  | 'Management'
  | 'Maintenance'
  | 'Support';

type LegacyRoleView =
  | 'Operator'
  | 'Lead / Supervisor'
  | 'Manager'
  | 'Forklift / Receiving'
  | 'QA'
  | 'operator'
  | 'lead'
  | 'supervisor'
  | 'management'
  | 'maintenance'
  | 'qa';

export type RoleView = CurrentRoleView | LegacyRoleView;
