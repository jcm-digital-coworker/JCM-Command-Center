import type { WorkCenterResourceModel } from '../types/resourceModel';

export const workCenterResources: WorkCenterResourceModel[] = [
  { department: 'Receiving', category: 'MATERIAL_FLOW', displayLabel: 'Material Flow', commandQuestion: 'What arrived, what is partial, and what must be staged next?' },
  { department: 'Machine Shop', category: 'MACHINES', displayLabel: 'Machines', commandQuestion: 'Which machines are running, blocked, risky, or ready for the next order?' },
  { department: 'Material Handling', category: 'EQUIPMENT', displayLabel: 'Equipment', commandQuestion: 'Which cutting, rolling, saw, laser, or press resource is constraining flow?' },
  { department: 'Fab', category: 'WORK_CELLS', displayLabel: 'Work Cells', commandQuestion: 'Which fab cell owns the work, and is the work matched to the right skill/material lane?' },
  { department: 'Coating', category: 'PROCESS_ZONES', displayLabel: 'Process Zones', commandQuestion: 'Which blast, paint, dip, cure, or passivation process is blocking finish flow?' },
  { department: 'Assembly', category: 'ASSEMBLY_CELLS', displayLabel: 'Assembly Cells', commandQuestion: 'Which assemblies are kitted, missing parts, blocked, or ready for QA/shipping?' },
  { department: 'Saddles Dept', category: 'ASSEMBLY_CELLS', displayLabel: 'Saddle Line', commandQuestion: 'Are saddle orders fed by receiving, laser, press, and ready to ship?' },
  { department: 'Clamps', category: 'ASSEMBLY_CELLS', displayLabel: 'Clamp Line', commandQuestion: 'Are clamp orders fed by receiving, laser, press, and ready to ship?' },
  { department: 'Patch Clamps', category: 'FLOW_LANES', displayLabel: 'Patch Clamp Lane', commandQuestion: 'What patch clamp work can keep moving when Material Handling is constrained?' },
  { department: 'QA', category: 'VALIDATION_LAYER', displayLabel: 'Validation Layer', commandQuestion: 'What is passed, held, failed, or waiting on inspection/compliance?' },
  { department: 'Shipping', category: 'FLOW_LANES', displayLabel: 'Shipping Lanes', commandQuestion: 'What is ship-ready, staged, missing paperwork, or blocked upstream?' },
  { department: 'Maintenance', category: 'SUPPORT', displayLabel: 'Service Response', commandQuestion: 'Which asset, area, work cell, or process zone needs service next?' },
  { department: 'Office', category: 'SUPPORT', displayLabel: 'Office Support', commandQuestion: 'Which orders need engineering, sales, purchasing, or CI support?' },
];

export function getResourceModel(department: string) {
  return workCenterResources.find((item) => item.department === department);
}
