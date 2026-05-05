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

const productionRoles: RoleView[] = ['Production'];
const departmentLeadershipRoles: RoleView[] = ['Department Lead', 'Department Supervisor'];
const managementRoles: RoleView[] = ['Management'];
const maintenanceRoles: RoleView[] = ['Maintenance'];
const supportRoles: RoleView[] = ['Support'];
const plantLeadershipRoles: RoleView[] = [...departmentLeadershipRoles, ...managementRoles];
const supportAndLeadershipRoles: RoleView[] = [...supportRoles, ...plantLeadershipRoles];

const legacyRoleMap: Record<string, RoleView> = {
  Operator: 'Production',
  operator: 'Production',
  'Lead / Supervisor': 'Department Lead',
  lead: 'Department Lead',
  supervisor: 'Department Supervisor',
  Manager: 'Management',
  management: 'Management',
  Maintenance: 'Maintenance',
  maintenance: 'Maintenance',
  'Forklift / Receiving': 'Support',
  QA: 'Support',
  qa: 'Support',
};

export const navigationGroups: NavigationGroup[] = [
  {
    id: 'command',
    label: 'Command',
    description: 'Plant status, critical decisions, and leadership action.',
    items: [
      { id: 'dashboard', label: 'Command Center', roles: 'all', description: 'Plant-wide status and quick actions.' },
      { id: 'kanban', label: 'War Board', roles: [...plantLeadershipRoles], description: 'Plant-wide kanban: all orders across departments in one view. Sorted by urgency.' },
      { id: 'alerts', label: 'Equipment Alerts', roles: [...plantLeadershipRoles, ...maintenanceRoles], description: 'Active equipment alarms and offline signals.' },
      { id: 'risk', label: 'QA / Safety', roles: [...supportAndLeadershipRoles, ...maintenanceRoles], description: 'Quality, safety, and risk signals.' },
    ],
  },
  {
    id: 'production',
    label: 'Departments',
    description: 'All plant departments — floor, support, and office.',
    items: [
      { id: 'orders', label: 'Orders', roles: [...plantLeadershipRoles, ...productionRoles, ...supportRoles], description: 'Order status, readiness, and release signals.' },
      { id: 'plantMap', label: 'Plant Map', roles: [...plantLeadershipRoles, ...productionRoles, ...maintenanceRoles, ...supportRoles], description: 'Department and work-center overview.' },
      { id: 'machines', label: 'Equipment', roles: [...plantLeadershipRoles, ...productionRoles, ...maintenanceRoles], description: 'Equipment status and machine detail cards.' },
      { id: 'sales', label: 'Sales', roles: [...managementRoles, ...supportRoles, ...plantLeadershipRoles], description: 'Sales and customer order signal.' },
      { id: 'engineering', label: 'Engineering', roles: [...plantLeadershipRoles, ...supportRoles], description: 'Engineering release and routing support.' },
      { id: 'receiving', label: 'Receiving', roles: [...plantLeadershipRoles, ...supportRoles, ...productionRoles], description: 'Material intake, staging, and request flow.' },
      { id: 'materialHandling', label: 'Material Handling', roles: [...plantLeadershipRoles, ...supportRoles], description: 'Material movement and cut-form flow.' },
      { id: 'fab', label: 'Fab', roles: [...plantLeadershipRoles, ...productionRoles], description: 'Fabrication department view.' },
      { id: 'coating', label: 'Coating', roles: [...plantLeadershipRoles, ...productionRoles], description: 'Coating department view.' },
      { id: 'assembly', label: 'Assembly', roles: [...plantLeadershipRoles, ...productionRoles], description: 'Assembly department view.' },
      { id: 'saddles', label: 'Saddles', roles: [...plantLeadershipRoles, ...productionRoles], description: 'Saddles cell - LV4500 service saddle production.' },
      { id: 'qa', label: 'QA', roles: [...plantLeadershipRoles, ...supportRoles], description: 'QA department focus.' },
      { id: 'shipping', label: 'Shipping', roles: [...plantLeadershipRoles, ...productionRoles, ...supportRoles], description: 'Outbound readiness and shipping focus.' },
    ],
  },
  {
    id: 'workflow',
    label: 'Workflow',
    description: 'How work moves through blockers, labor, and handoffs.',
    items: [
      { id: 'workflow', label: 'My Workflow', roles: 'all', description: 'Role-specific work queue and current priorities.' },
      { id: 'coverage', label: 'Crew / Coverage', roles: [...plantLeadershipRoles, ...productionRoles, ...supportRoles], description: 'Crew availability and coverage gaps.' },
      { id: 'shiftHandoff', label: 'Shift Handoff', roles: [...plantLeadershipRoles], description: 'End-of-shift snapshot: crew, orders, maintenance. Copy as text for incoming lead.' },
    ],
  },
  {
    id: 'support',
    label: 'Tools',
    description: 'Systems that clear problems and keep production moving.',
    items: [
      { id: 'maintenance', label: 'Maintenance', roles: [...plantLeadershipRoles, ...maintenanceRoles], description: 'Maintenance requests, tasks, and analytics.' },
      { id: 'documents', label: 'Documents', roles: 'all', description: 'Procedures, standards, and references.' },
      { id: 'simulation', label: 'Simulation', roles: [...plantLeadershipRoles, ...maintenanceRoles], description: 'Read-only equipment simulation.' },
    ],
  },
];

export function canRoleAccessTab(roleView: RoleView, tab: AppTab): boolean {
  if (tab === 'warRoomContext') return true;
  const normalizedRole = normalizeRoleView(roleView);
  return navigationGroups.some((group) =>
    group.items.some((item) => item.id === tab && canRoleAccessItem(normalizedRole, item)),
  );
}

export function getVisibleNavigationGroups(roleView: RoleView): NavigationGroup[] {
  const normalizedRole = normalizeRoleView(roleView);
  return navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => canRoleAccessItem(normalizedRole, item)),
    }))
    .filter((group) => group.items.length > 0);
}

export function getHomeTabForRole(roleView: RoleView): AppTab {
  const normalizedRole = normalizeRoleView(roleView);
  if (normalizedRole === 'Production') return 'workflow';
  if (normalizedRole === 'Maintenance') return 'maintenance';
  if (normalizedRole === 'Support') return 'receiving';
  return 'dashboard';
}

export function normalizeRoleView(roleView: RoleView): RoleView {
  return legacyRoleMap[roleView] ?? roleView;
}

function canRoleAccessItem(roleView: RoleView, item: NavigationItem): boolean {
  return item.roles === 'all' || item.roles.includes(roleView);
}
