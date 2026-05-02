import type { AppTab, RoleView } from '../types/app';

export type NavigationGroupId = 'command' | 'production' | 'workflow' | 'support';

export type NavigationItem = {
  id: AppTab;
  label: string;
  roles: RoleView[] | 'all';
  description: string;
};

export type NavigationGroup = {
  id: NavigationGroupId;
  label: string;
  description: string;
  items: NavigationItem[];
};

const managerRoles: RoleView[] = ['Manager', 'Lead / Supervisor', 'management', 'lead', 'supervisor'];
const operatorRoles: RoleView[] = ['Operator', 'operator'];
const maintenanceRoles: RoleView[] = ['Maintenance', 'maintenance'];
const receivingRoles: RoleView[] = ['Forklift / Receiving'];
const qaRoles: RoleView[] = ['QA', 'qa'];

export const navigationGroups: NavigationGroup[] = [
  {
    id: 'command',
    label: 'Command',
    description: 'Plant status, critical decisions, and executive action.',
    items: [
      { id: 'dashboard', label: 'Command Center', roles: 'all', description: 'Plant-wide status and quick actions.' },
      { id: 'alerts', label: 'Equipment Alerts', roles: [...managerRoles, ...maintenanceRoles], description: 'Active equipment alarms and offline signals.' },
      { id: 'risk', label: 'QA / Safety', roles: [...managerRoles, ...qaRoles, ...maintenanceRoles], description: 'Quality, safety, and risk signals.' },
    ],
  },
  {
    id: 'production',
    label: 'Production',
    description: 'Where work is being made.',
    items: [
      { id: 'orders', label: 'Orders', roles: [...managerRoles, ...operatorRoles, ...receivingRoles, ...qaRoles], description: 'Order status, readiness, and release signals.' },
      { id: 'plantMap', label: 'Plant Map', roles: [...managerRoles, ...operatorRoles, ...maintenanceRoles], description: 'Department and work-center overview.' },
      { id: 'machines', label: 'Equipment', roles: [...managerRoles, ...operatorRoles, ...maintenanceRoles], description: 'Equipment status and machine detail cards.' },
      { id: 'fab', label: 'Fab', roles: [...managerRoles, ...operatorRoles], description: 'Fabrication department view.' },
      { id: 'coating', label: 'Coating', roles: [...managerRoles, ...operatorRoles], description: 'Coating department view.' },
      { id: 'assembly', label: 'Assembly', roles: [...managerRoles, ...operatorRoles], description: 'Assembly department view.' },
      { id: 'shipping', label: 'Shipping', roles: [...managerRoles, ...operatorRoles, ...receivingRoles], description: 'Outbound readiness and shipping focus.' },
    ],
  },
  {
    id: 'workflow',
    label: 'Workflow',
    description: 'How work moves through blockers, labor, and handoffs.',
    items: [
      { id: 'workflow', label: 'My Workflow', roles: 'all', description: 'Role-specific work queue and current priorities.' },
      { id: 'coverage', label: 'Crew / Coverage', roles: [...managerRoles, ...operatorRoles, ...receivingRoles, ...qaRoles], description: 'Crew availability and coverage gaps.' },
      { id: 'receiving', label: 'Receiving', roles: [...managerRoles, ...receivingRoles, ...operatorRoles], description: 'Material intake, staging, and request flow.' },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    description: 'Systems that clear problems and keep production moving.',
    items: [
      { id: 'maintenance', label: 'Maintenance', roles: [...managerRoles, ...maintenanceRoles], description: 'Maintenance requests, tasks, and analytics.' },
      { id: 'qa', label: 'QA', roles: [...managerRoles, ...qaRoles], description: 'QA department focus.' },
      { id: 'engineering', label: 'Engineering', roles: [...managerRoles], description: 'Engineering release and routing support.' },
      { id: 'sales', label: 'Sales', roles: [...managerRoles], description: 'Sales and customer order signal.' },
      { id: 'materialHandling', label: 'Material Handling', roles: [...managerRoles, ...receivingRoles], description: 'Material movement and cut-form flow.' },
      { id: 'documents', label: 'Documents', roles: 'all', description: 'Procedures, standards, and references.' },
      { id: 'simulation', label: 'Simulation', roles: [...managerRoles, ...maintenanceRoles], description: 'Read-only equipment simulation.' },
    ],
  },
];

export function canRoleAccessTab(roleView: RoleView, tab: AppTab): boolean {
  if (tab === 'warRoomContext') return true;
  return navigationGroups.some((group) =>
    group.items.some((item) => item.id === tab && canRoleAccessItem(roleView, item)),
  );
}

export function getVisibleNavigationGroups(roleView: RoleView): NavigationGroup[] {
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canRoleAccessItem(roleView, item)),
    }))
    .filter((group) => group.items.length > 0);
}

export function getHomeTabForRole(roleView: RoleView): AppTab {
  if (roleView === 'Operator' || roleView === 'operator') return 'workflow';
  if (roleView === 'Maintenance' || roleView === 'maintenance') return 'maintenance';
  if (roleView === 'Forklift / Receiving') return 'receiving';
  if (roleView === 'QA' || roleView === 'qa') return 'risk';
  return 'dashboard';
}

function canRoleAccessItem(roleView: RoleView, item: NavigationItem): boolean {
  return item.roles === 'all' || item.roles.includes(roleView);
}
