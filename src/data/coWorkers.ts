import type { Department } from '../types/machine';

export type CoWorker = {
  id: string;
  name: string;
  department: Department;
  primaryRole: string;
  defaultStation: string;
  shift: 'Day' | 'Night' | 'Weekend';
  available: boolean;
};

export const coWorkers: CoWorker[] = [
  { id: 'cw-recv-supervisor', name: 'Receiving Supervisor', department: 'Receiving', primaryRole: 'Supervisor', defaultStation: 'Receiving office', shift: 'Day', available: true },
  { id: 'cw-recv-lead', name: 'Receiving Lead', department: 'Receiving', primaryRole: 'Lead', defaultStation: 'Dock / receiving desk', shift: 'Day', available: true },
  { id: 'cw-recv-driver-1', name: 'Forklift Driver 1', department: 'Receiving', primaryRole: 'Forklift Driver', defaultStation: 'Forklift 1', shift: 'Day', available: true },
  { id: 'cw-recv-driver-2', name: 'Forklift Driver 2', department: 'Receiving', primaryRole: 'Forklift Driver', defaultStation: 'Forklift 2', shift: 'Day', available: true },
  { id: 'cw-machine-operator', name: 'Machine Shop Operator', department: 'Machine Shop', primaryRole: 'Machine Operator', defaultStation: 'CNC cell', shift: 'Day', available: true },
  { id: 'cw-material-handler', name: 'Material Handling Operator', department: 'Material Handling', primaryRole: 'Material Handler', defaultStation: 'Saw / laser area', shift: 'Day', available: true },
  { id: 'cw-fab-welder', name: 'Fab Welder', department: 'Fab', primaryRole: 'Welder / Fitter', defaultStation: 'Fab work cell', shift: 'Day', available: true },
  { id: 'cw-coating-tech', name: 'Coating Tech', department: 'Coating', primaryRole: 'Coating Tech', defaultStation: 'Coating process zone', shift: 'Day', available: true },
  { id: 'cw-assembly-tech', name: 'Assembly Tech', department: 'Assembly', primaryRole: 'Assembler', defaultStation: 'Assembly cell', shift: 'Day', available: true },
  { id: 'cw-shipping-stager', name: 'Shipping Stager', department: 'Shipping', primaryRole: 'Shipping', defaultStation: 'Shipping staging', shift: 'Day', available: true },
  { id: 'cw-qa-tech', name: 'QA Inspector', department: 'QA', primaryRole: 'QA', defaultStation: 'QA inspection / hold area', shift: 'Day', available: true },
  { id: 'cw-maint-tech', name: 'Maintenance Tech', department: 'Maintenance', primaryRole: 'Maintenance', defaultStation: 'Maintenance shop', shift: 'Day', available: true },
];

export function getAvailableCoWorkersForDepartment(department: Department, signedInNames: string[] = []) {
  return coWorkers.filter(
    (coWorker) =>
      coWorker.department === department &&
      coWorker.available &&
      !signedInNames.includes(coWorker.name)
  );
}
