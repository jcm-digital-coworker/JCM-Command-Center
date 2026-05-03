import type { WorkCenterResourceModel } from '../types/resourceModel';

export const workCenterResources: WorkCenterResourceModel[] = [
  { department: 'Sales', category: 'SUPPORT', displayLabel: 'Order Release', commandQuestion: 'Which customer signals, hot-order changes, or release details need production visibility?' },
  { department: 'Engineering', category: 'VALIDATION_LAYER', displayLabel: 'Blueprint / Routing Gate', commandQuestion: 'Which drawings, revisions, routes, or engineered-order packets are blocking production release?' },
  { department: 'Receiving', category: 'MATERIAL_FLOW', displayLabel: 'Material Flow', commandQuestion: 'What arrived, what is partial, and what must be staged or delivered next?' },
  { department: 'Machine Shop', category: 'MACHINES', displayLabel: 'Machines', commandQuestion: 'Which machines are running, blocked, risky, or ready for the next order?' },
  { department: 'Material Handling', category: 'EQUIPMENT', displayLabel: 'Equipment', commandQuestion: 'Which cutting, rolling, saw, laser, or press resource is constraining flow?' },
  { department: 'Fab', category: 'WORK_CELLS', displayLabel: 'Work Cells', commandQuestion: 'Which fab lane owns the work, and is the work matched to the right skill, material, and handoff?' },
  { department: 'Coating', category: 'PROCESS_ZONES', displayLabel: 'Process Zones', commandQuestion: 'Which blast, paint, dip, cure, or passivation process is blocking finish flow?' },
  { department: 'Assembly', category: 'ASSEMBLY_CELLS', displayLabel: 'Assembly Cells', commandQuestion: 'Which assemblies are kitted, missing parts, blocked, or ready for QA/shipping?' },
  { department: 'Saddles Dept', category: 'ASSEMBLY_CELLS', displayLabel: 'Saddle Line', commandQuestion: 'Are saddle orders fed by Receiving, Coating, and strap dependencies, and are they ready for the next saddle-specific step?' },
  { department: 'Clamps', category: 'ASSEMBLY_CELLS', displayLabel: 'Clamp Line', commandQuestion: 'Which clamp orders are ready, blocked, or still waiting on confirmed material, coating, or assembly-route truth?' },
  { department: 'Patch Clamps', category: 'FLOW_LANES', displayLabel: 'Patch Clamp Lane', commandQuestion: 'Which patch clamp orders are ready, blocked, or still waiting on confirmed product-lane ownership?' },
  { department: 'QA', category: 'VALIDATION_LAYER', displayLabel: 'Validation Layer', commandQuestion: 'What is passed, held, failed, or waiting on inspection/compliance?' },
  { department: 'Shipping', category: 'FLOW_LANES', displayLabel: 'Shipping Lanes', commandQuestion: 'What is ship-ready, staged, missing paperwork, or blocked upstream?' },
  { department: 'Maintenance', category: 'SUPPORT', displayLabel: 'Service Response', commandQuestion: 'Which asset, area, work cell, or process zone needs service next?' },
  { department: 'Office', category: 'SUPPORT', displayLabel: 'Office Support', commandQuestion: 'Which orders need purchasing, scheduling, administrative, or management support?' },
];

export function getResourceModel(department: string) {
  return workCenterResources.find((item) => item.department === department);
}
