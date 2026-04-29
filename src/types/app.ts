export type AppTab =
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

export type RoleView =
  | 'operator'
  | 'lead'
  | 'supervisor'
  | 'management'
  | 'maintenance'
  | 'qa';