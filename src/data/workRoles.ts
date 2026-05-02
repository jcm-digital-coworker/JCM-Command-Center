import type { WorkRole } from '../types/workRole';

export const workRoles: WorkRole[] = [
  {
    id: 'production',
    label: 'Production',
    family: 'MACHINE',
    appliesTo: ['Machine Shop', 'Material Handling', 'Fab', 'Coating', 'Assembly', 'Saddles Dept', 'Clamps', 'Patch Clamps', 'Shipping'],
    defaultTab: 'workflow',
    description: 'Production co-worker floor view for orders, blockers, handoffs, and station work.',
  },
  {
    id: 'department-lead',
    label: 'Department Lead',
    family: 'SUPERVISION',
    appliesTo: 'ALL',
    defaultTab: 'coverage',
    description: 'Department-level coverage, blockers, escalation, and next-action command view.',
  },
  {
    id: 'department-supervisor',
    label: 'Department Supervisor',
    family: 'SUPERVISION',
    appliesTo: 'ALL',
    defaultTab: 'coverage',
    description: 'Supervisor view for plant flow, people, blockers, and department coordination.',
  },
  {
    id: 'management',
    label: 'Management',
    family: 'SUPERVISION',
    appliesTo: 'ALL',
    defaultTab: 'dashboard',
    description: 'Plant-level status, flow, risk, and readiness overview.',
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    family: 'MAINTENANCE',
    appliesTo: 'ALL',
    defaultTab: 'maintenance',
    description: 'Asset, area, and work-cell service requests across the plant.',
  },
  {
    id: 'support',
    label: 'Support',
    family: 'MATERIAL',
    appliesTo: ['Receiving', 'Material Handling', 'Shipping', 'QA', 'Engineering', 'Sales'],
    defaultTab: 'receiving',
    description: 'Support co-worker view for receiving, material, QA, release, and handoff friction.',
  },

  // Legacy labels stay here as compatibility aliases while older internals are migrated.
  {
    id: 'machine-operator',
    label: 'Operator',
    family: 'MACHINE',
    appliesTo: ['Machine Shop', 'Material Handling'],
    defaultTab: 'workflow',
    description: 'Legacy alias for Production.',
  },
  {
    id: 'lead-supervisor',
    label: 'Lead / Supervisor',
    family: 'SUPERVISION',
    appliesTo: 'ALL',
    defaultTab: 'coverage',
    description: 'Legacy alias for Department Lead / Department Supervisor.',
  },
  {
    id: 'manager',
    label: 'Manager',
    family: 'SUPERVISION',
    appliesTo: 'ALL',
    defaultTab: 'dashboard',
    description: 'Legacy alias for Management.',
  },
  {
    id: 'receiving-legacy',
    label: 'Forklift / Receiving',
    family: 'MATERIAL',
    appliesTo: ['Receiving'],
    defaultTab: 'receiving',
    description: 'Legacy alias for Support.',
  },
  {
    id: 'qa-legacy',
    label: 'QA',
    family: 'MATERIAL',
    appliesTo: ['QA'],
    defaultTab: 'risk',
    description: 'Legacy alias for Support.',
  },
];

export function getWorkRole(label: string) {
  return workRoles.find((role) => role.label === label);
}

export function isSupervisorRole(label: string) {
  const role = getWorkRole(label);
  return role?.family === 'SUPERVISION';
}

export function isMaintenanceRole(label: string) {
  const role = getWorkRole(label);
  return role?.family === 'MAINTENANCE';
}

export function isMaterialRole(label: string) {
  const role = getWorkRole(label);
  return role?.family === 'MATERIAL' || role?.family === 'RECEIVING';
}
