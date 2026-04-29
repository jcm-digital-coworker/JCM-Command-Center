import type { WorkRole } from '../types/workRole';

export const workRoles: WorkRole[] = [
  {
    id: 'machine-operator',
    label: 'Machine Operator',
    family: 'MACHINE',
    appliesTo: ['Machine Shop', 'Material Handling'],
    defaultTab: 'dashboard',
    description: 'Machine-centered floor view for CNCs, burn tables, rollers, saws, and other equipment-driven work.',
  },
  {
    id: 'material-handler',
    label: 'Material Handler',
    family: 'MATERIAL',
    appliesTo: ['Receiving', 'Material Handling', 'Shipping'],
    defaultTab: 'receiving',
    description: 'Material movement, staging, delivery, and handoff view.',
  },
  {
    id: 'welder-fitter',
    label: 'Welder / Fitter',
    family: 'FAB',
    appliesTo: ['Fab'],
    defaultTab: 'dashboard',
    description: 'Fab cell view for industrial welders, specials, 412, 452, and 432 work.',
  },
  {
    id: 'coating-tech',
    label: 'Coating Tech',
    family: 'COATING',
    appliesTo: ['Coating'],
    defaultTab: 'plantMap',
    description: 'Process-zone view for blast, paint, plastic dip, shop coat, and passivation work.',
  },
  {
    id: 'assembler',
    label: 'Assembler',
    family: 'ASSEMBLY',
    appliesTo: ['Assembly', 'Saddles Dept', 'Clamps', 'Patch Clamps'],
    defaultTab: 'orders',
    description: 'Kit readiness, assembly status, and missing-input view.',
  },
  {
    id: 'shipping',
    label: 'Shipping',
    family: 'SHIPPING',
    appliesTo: ['Shipping'],
    defaultTab: 'orders',
    description: 'Ship-readiness and final handoff view.',
  },
  {
    id: 'receiving',
    label: 'Receiving',
    family: 'RECEIVING',
    appliesTo: ['Receiving'],
    defaultTab: 'receiving',
    description: 'Inbound material, partial receipt, staging, and delivery queue view.',
  },
  {
    id: 'qa',
    label: 'QA',
    family: 'QA',
    appliesTo: ['QA'],
    defaultTab: 'risk',
    description: 'Testing, inspection, compliance, and hold visibility.',
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
    id: 'lead-supervisor',
    label: 'Lead / Supervisor',
    family: 'SUPERVISION',
    appliesTo: 'ALL',
    defaultTab: 'coverage',
    description: 'Coverage, blockers, escalation, and next-action command view.',
  },
  {
    id: 'manager',
    label: 'Manager',
    family: 'SUPERVISION',
    appliesTo: 'ALL',
    defaultTab: 'coverage',
    description: 'Plant-level status, flow, risk, and readiness overview.',
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
