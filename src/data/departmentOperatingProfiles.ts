import type { Department } from '../types/machine';

export type DepartmentTruthStrength = 'STRONG' | 'PARTIAL' | 'PLACEHOLDER';

export type DepartmentOperatingProfile = {
  department: Department;
  resourceLabel: string;
  openForSignal: string;
  truthStrength: DepartmentTruthStrength;
  operatingSummary: string;
};

export const departmentOperatingProfiles: Record<Department, DepartmentOperatingProfile> = {
  Sales: {
    department: 'Sales',
    resourceLabel: 'Order release / customer signal',
    openForSignal: 'order release readiness, hot-order changes, and customer signal handoff.',
    truthStrength: 'PARTIAL',
    operatingSummary: 'Owns customer-facing order signals before production commits to the floor.',
  },
  Engineering: {
    department: 'Engineering',
    resourceLabel: 'Blueprint / routing gate',
    openForSignal: 'blueprint blockers, routing release, and engineered-order review.',
    truthStrength: 'PARTIAL',
    operatingSummary: 'Owns drawing, routing, and engineered-order readiness before work reaches production.',
  },
  Office: {
    department: 'Office',
    resourceLabel: 'Admin / purchasing / planning',
    openForSignal: 'purchasing requests, approvals, scheduling visibility, and plant communication.',
    truthStrength: 'PLACEHOLDER',
    operatingSummary: 'Shared administrative hub for purchasing, scheduling, approvals, and plant visibility.',
  },
  Receiving: {
    department: 'Receiving',
    resourceLabel: 'Material intake / staging',
    openForSignal: 'material arrival, staging truth, and downstream delivery needs.',
    truthStrength: 'PARTIAL',
    operatingSummary: 'Receives, verifies, stages, and delivers material to the correct downstream work centers.',
  },
  'Machine Shop': {
    department: 'Machine Shop',
    resourceLabel: 'Size-specific CNC / machining flow',
    openForSignal: 'machine-capability fit, setup-sensitive work, and tooling or maintenance blockers.',
    truthStrength: 'STRONG',
    operatingSummary: 'Machines components based on size, type, material, setup constraints, and machine capability.',
  },
  'Material Handling': {
    department: 'Material Handling',
    resourceLabel: 'Cut / form / roll / press flow',
    openForSignal: 'cut lists, burn/roll/press bottlenecks, and downstream material shortages.',
    truthStrength: 'STRONG',
    operatingSummary: 'Production department for cutting, burning, rolling, staging, press work, and downstream material readiness.',
  },
  Fab: {
    department: 'Fab',
    resourceLabel: 'Weld lanes / product fabrication',
    openForSignal: 'weld queue pressure, fixture needs, lane handoff, and quality holds.',
    truthStrength: 'PARTIAL',
    operatingSummary: 'Welds and fabricates product-specific assemblies through known lanes, with more lane truth still being confirmed.',
  },
  Coating: {
    department: 'Coating',
    resourceLabel: 'Prep / paint / plastic dip / passivation',
    openForSignal: 'finish blockers, prep status, process-zone readiness, and passivation/coating questions.',
    truthStrength: 'STRONG',
    operatingSummary: 'Handles surface prep, paint, shop coat, plastic coating, and passivation processes with some sub-lane questions still open.',
  },
  Assembly: {
    department: 'Assembly',
    resourceLabel: 'Product-lane assembly / kit readiness',
    openForSignal: 'missing components, build queue readiness, and product-lane handoffs.',
    truthStrength: 'PARTIAL',
    operatingSummary: 'Builds downstream products from machined, handled, welded, coated, or staged components by product lane.',
  },
  'Saddles Dept': {
    department: 'Saddles Dept',
    resourceLabel: 'Service saddle build lane',
    openForSignal: 'service saddle batch progress, LV4500 work, gauge checks, and saddle-specific flow.',
    truthStrength: 'STRONG',
    operatingSummary: 'Dedicated service saddle department using saddle-specific workflows, LV4500 resources, gauges, and batch flow.',
  },
  'Patch Clamps': {
    department: 'Patch Clamps',
    resourceLabel: 'Patch clamp product lane',
    openForSignal: 'patch clamp queue, material readiness, and unresolved product-lane setup.',
    truthStrength: 'PLACEHOLDER',
    operatingSummary: 'Patch clamp production lane. Ownership and timing still need confirmation before route certainty increases.',
  },
  Clamps: {
    department: 'Clamps',
    resourceLabel: 'Clamp product lane',
    openForSignal: 'clamp queue, material readiness, and product-lane blockers.',
    truthStrength: 'PLACEHOLDER',
    operatingSummary: 'Clamp product lane. Ownership, timing, and handoff details still need confirmation.',
  },
  QA: {
    department: 'QA',
    resourceLabel: 'Validation / hold layer',
    openForSignal: 'quality holds, inspection status, compliance checks, and release blockers.',
    truthStrength: 'STRONG',
    operatingSummary: 'Conditional quality layer for holds, inspections, compliance checks, engineered orders, returns, and assigned cases.',
  },
  Shipping: {
    department: 'Shipping',
    resourceLabel: 'Outbound lanes / ship readiness',
    openForSignal: 'hot shipments, staging, packing status, and dock readiness.',
    truthStrength: 'PARTIAL',
    operatingSummary: 'Final plant funnel for outbound staging, packing, hot shipment visibility, and dock readiness.',
  },
  Maintenance: {
    department: 'Maintenance',
    resourceLabel: 'Reliability / repair flow',
    openForSignal: 'open work orders, downtime impact, assignments, and repair closeout.',
    truthStrength: 'STRONG',
    operatingSummary: 'Stand-alone reliability and repair flow for requests, downtime, repeat offenders, assignments, and closeout notes.',
  },
};

export function getDepartmentOperatingProfile(department: Department): DepartmentOperatingProfile {
  return departmentOperatingProfiles[department];
}
