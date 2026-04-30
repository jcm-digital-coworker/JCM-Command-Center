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
  | 'documents'
  | 'risk'
  | 'warRoomContext';

export type DepartmentFilter = 'All' | Department;

export type RoleView =
  | 'Operator'
  | 'Lead / Supervisor'
  | 'Manager'
  | 'Maintenance'
  | 'Forklift / Receiving'
  | 'QA'
  | 'operator'
  | 'lead'
  | 'supervisor'
  | 'management'
  | 'maintenance'
  | 'qa';