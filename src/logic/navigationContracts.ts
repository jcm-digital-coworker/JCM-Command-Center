import type { AppTab } from '../types/app';

export type NavigationIntent =
  | 'OPEN_WORKFLOW'
  | 'OPEN_DASHBOARD'
  | 'OPEN_EQUIPMENT'
  | 'OPEN_EQUIPMENT_ALERTS'
  | 'OPEN_MAINTENANCE'
  | 'OPEN_RECEIVING'
  | 'OPEN_CREW_COVERAGE'
  | 'OPEN_ORDERS'
  | 'OPEN_PLANT_MAP'
  | 'OPEN_ENGINEERING'
  | 'OPEN_QA_SAFETY'
  | 'OPEN_QA_DEPARTMENT'
  | 'OPEN_DOCUMENTS'
  | 'OPEN_SHIFT_HANDOFF';

export type NavigationContract = {
  tab: AppTab;
  label: string;
};

export const navigationContracts: Record<NavigationIntent, NavigationContract> = {
  OPEN_WORKFLOW: { tab: 'workflow', label: 'Workflow' },
  OPEN_DASHBOARD: { tab: 'dashboard', label: 'Command Center' },
  OPEN_EQUIPMENT: { tab: 'machines', label: 'Equipment' },
  OPEN_EQUIPMENT_ALERTS: { tab: 'alerts', label: 'Equipment Alerts' },
  OPEN_MAINTENANCE: { tab: 'maintenance', label: 'Maintenance' },
  OPEN_RECEIVING: { tab: 'receiving', label: 'Receiving' },
  OPEN_CREW_COVERAGE: { tab: 'coverage', label: 'Crew / Coverage' },
  OPEN_ORDERS: { tab: 'orders', label: 'Orders' },
  OPEN_PLANT_MAP: { tab: 'plantMap', label: 'Plant Map' },
  OPEN_ENGINEERING: { tab: 'engineering', label: 'Engineering' },
  OPEN_QA_SAFETY: { tab: 'risk', label: 'QA / Safety' },
  OPEN_QA_DEPARTMENT: { tab: 'qa', label: 'QA Department' },
  OPEN_DOCUMENTS: { tab: 'documents', label: 'Documents' },
  OPEN_SHIFT_HANDOFF: { tab: 'shiftHandoff', label: 'Shift Handoff' },
};

export function getNavigationTab(intent: NavigationIntent): AppTab {
  return navigationContracts[intent].tab;
}
