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
    resourceLabel: 'CNC / size-specific machining',
    openForSignal: 'machine-capability fit, size/material routing, push pin vs threaded, and tooling or maintenance blockers.',
    truthStrength: 'STRONG',
    operatingSummary: 'Turns raw RFWN spigots into 440/449-series spigots, machines flanges and plugs, and grooves flat plate from Material Handling. Resource routing is size- and material-specific.',
  },
  'Material Handling': {
    department: 'Material Handling',
    resourceLabel: 'Burn / laser / roll / press / saw',
    openForSignal: 'burn table capacity, roller availability, press building blockers, and laser table status.',
    truthStrength: 'STRONG',
    operatingSummary: 'Production department: plasma and laser cutting, rolling, sawing pipe and bar stock, press work, press brake, and large-diameter coupling expansion. Feeds Machine Shop, Fab, and Couplings. Press Building is a separate structure within this department.',
  },
  Fab: {
    department: 'Fab',
    resourceLabel: 'Multi-lane weld / fabrication',
    openForSignal: 'lane assignment, carbon vs stainless, body/outlet size, industrial vs standard, and upstream component readiness.',
    truthStrength: 'PARTIAL',
    operatingSummary: 'Multi-lane fabrication department. Lanes include 412 Fab (carbon, ≤12" outlet), 432 Fab (stainless small), 452 (stainless large), Special Fab / Large Body, Specialized Welding, and West Wing (industrial). All lanes fed by Machine Shop and Material Handling; all output goes to Coating.',
  },
  Coating: {
    department: 'Coating',
    resourceLabel: 'Prep / enamel / plastic dip / shop coat / passivation',
    openForSignal: 'Wheelabrator status, booth availability, oven/dip readiness, passivation queue, and cure or hold states.',
    truthStrength: 'STRONG',
    operatingSummary: 'Handles Wheelabrator media blast, one- and two-man media booths, enamel spray booths, plastic dip (pizza oven + fluidized bed), continuous shop coat line, large-part paint booth, and passivation. Shared supervisor with Shipping.',
  },
  Assembly: {
    department: 'Assembly',
    resourceLabel: 'Lane-matched assembly / product-line build',
    openForSignal: 'Fab lane match, component readiness, coupling or product-line path, and QA release status.',
    truthStrength: 'PARTIAL',
    operatingSummary: 'Assembly is lane-matched to Fab: 412, 432, 452, Special, and Couplings assembly lanes. Saddles, Clamps, and Patch Clamps have integrated assembly inside their own departments and do not route through shared Assembly.',
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
    resourceLabel: 'Patch clamp stand-alone department',
    openForSignal: 'patch clamp queue, material readiness, and upstream Press Building dependency.',
    truthStrength: 'PARTIAL',
    operatingSummary: 'Stand-alone product-line department for patch clamp build and assembly. Does not route through shared Assembly. Material sourcing, coating path, and resource details still being confirmed.',
  },
  Clamps: {
    department: 'Clamps',
    resourceLabel: 'Clamp integrated build / assembly',
    openForSignal: 'clamp build queue, Press Building shear readiness, and coating sequence.',
    truthStrength: 'PARTIAL',
    operatingSummary: 'Standalone product-line department with integrated build and assembly. Material is sheared in the Press Building (Material Handling). Coating timing relative to assembly needs confirmation.',
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
