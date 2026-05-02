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
  | 'documents'
  | 'risk'
  | 'warRoomContext';

export type DepartmentFilter = 'All' | Department;

export type RoleView =
  | 'Production'
  | 'Department Lead'
  | 'Department Supervisor'
  | 'Management'
  | 'Maintenance'
  | 'Support';
