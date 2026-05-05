import type { Department } from '../types/machine';

export const departmentSubStages: Partial<Record<Department, string[]>> = {
  'Fab':              ['Cutting', 'Forming', 'Welding', 'Weld Inspection'],
  'Coating':          ['Blast Prep', 'Coating', 'Curing', 'QC Check'],
  'Assembly':         ['Kitting', 'Assembly', 'Pressure Test', 'Final Clean'],
  'Machine Shop':     ['Queue', 'Setup', 'Machining', 'Inspection'],
  'QA':               ['Incoming', 'Dimensional Check', 'Cert Packet', 'Release'],
  'Receiving':        ['On Order', 'Arriving', 'Check-In', 'Ready', 'Delivered'],
  'Material Handling':['Staging', 'Cut / Prep', 'Kit Build', 'Staged for Dept'],
  'Shipping':         ['Staging', 'Packing', 'Load Check', 'Shipped'],
  'Engineering':      ['Review', 'Drawing', 'BOM Release', 'Released'],
  'Sales':            ['Quote', 'Order Entry', 'Released to Prod'],
  'Saddles Dept':     ['Setup', 'Boring', 'Tapping', 'Inspection'],
};

export function getSubStagesForDept(dept: Department): string[] {
  return departmentSubStages[dept] ?? [];
}
