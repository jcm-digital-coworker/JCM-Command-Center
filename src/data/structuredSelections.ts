import { plantAssets } from './plantAssets';
import { productionOrders } from './productionOrders';
import { workRoles } from './workRoles';
import { getAvailableCoWorkersForDepartment } from './coWorkers';
import type { Department } from '../types/machine';
import type { CoveragePerson } from '../types/coverage';

export const OTHER_DESCRIPTION_MIN = 10;
export const OTHER_DESCRIPTION_MAX = 80;

export type MaintenanceIssueCode =
  | 'WONT_START'
  | 'ALARM_OR_FAULT'
  | 'LEAK'
  | 'NOISE_OR_VIBRATION'
  | 'TOOLING_OR_FIXTURE'
  | 'QUALITY_RISK'
  | 'SAFETY_CONCERN'
  | 'NEEDS_ADJUSTMENT'
  | 'OTHER';

export type MaintenanceIssueOption = {
  code: MaintenanceIssueCode;
  label: string;
  appliesTo?: string[];
};

export const maintenanceIssueOptions: MaintenanceIssueOption[] = [
  { code: 'WONT_START', label: 'Will not start / will not run' },
  { code: 'ALARM_OR_FAULT', label: 'Alarm, fault, or control issue' },
  { code: 'LEAK', label: 'Leak / hydraulic / air / coolant issue' },
  { code: 'NOISE_OR_VIBRATION', label: 'Abnormal noise, vibration, or movement' },
  { code: 'TOOLING_OR_FIXTURE', label: 'Tooling, fixture, or workholding issue' },
  { code: 'QUALITY_RISK', label: 'Quality risk / process not holding' },
  { code: 'SAFETY_CONCERN', label: 'Safety concern' },
  { code: 'NEEDS_ADJUSTMENT', label: 'Needs adjustment / calibration / setup help' },
  { code: 'OTHER', label: 'Other' },
];

export function getCoworkerNameOptionsForDepartment(department: Department, signedInNames: string[] = []): string[] {
  const availableNames = getAvailableCoWorkersForDepartment(department, signedInNames).map((coWorker) => coWorker.name);
  return availableNames.length > 0 ? availableNames : ['No unassigned co-workers available'];
}

export function getRoleOptionsForDepartment(department: Department): string[] {
  const roleLabels = workRoles
    .filter((role) => role.appliesTo === 'ALL' || role.appliesTo.includes(department))
    .map((role) => role.label);

  return unique([defaultRoleForDepartment(department), ...roleLabels]);
}

export function getStationOptionsForDepartment(department: Department): string[] {
  const assetStations = plantAssets
    .filter((asset) => asset.ownerDepartment === department || asset.physicalArea === department)
    .map((asset) => asset.name);

  return unique([defaultStationForDepartment(department), ...assetStations]);
}

export function getAssignmentOptionsForPerson(person: CoveragePerson): string[] {
  const orderOptions = productionOrders
    .filter((order) => {
      if (order.status === 'DONE') return false;
      return order.currentDepartment === person.department || order.requiredDepartments.includes(person.department);
    })
    .map((order) => `${order.orderNumber} - ${order.assemblyPartNumber} (${order.currentDepartment})`);

  const localAssets = plantAssets
    .filter((asset) => asset.ownerDepartment === person.department && asset.status !== 'DOWN')
    .slice(0, 6)
    .map((asset) => `${asset.name} support`);

  return unique([defaultAssignmentForDepartment(person.department), ...orderOptions, ...localAssets]);
}

export function defaultRoleForDepartment(department: Department): string {
  switch (department) {
    case 'Receiving':
      return 'Receiving';
    case 'Material Handling':
      return 'Material Handler';
    case 'Fab':
      return 'Welder / Fitter';
    case 'Coating':
      return 'Coating Tech';
    case 'Assembly':
    case 'Saddles Dept':
    case 'Clamps':
    case 'Patch Clamps':
      return 'Assembler';
    case 'Shipping':
      return 'Shipping';
    case 'QA':
      return 'QA';
    case 'Maintenance':
      return 'Maintenance';
    default:
      return 'Machine Operator';
  }
}

export function defaultStationForDepartment(department: Department): string {
  switch (department) {
    case 'Receiving':
      return 'Receiving dock / staging';
    case 'Material Handling':
      return 'Material Handling queue';
    case 'Fab':
      return 'Fab work cell';
    case 'Coating':
      return 'Coating process zone';
    case 'Assembly':
      return 'Assembly cell';
    case 'Saddles Dept':
      return 'Saddles line';
    case 'Clamps':
      return 'Clamps line';
    case 'Patch Clamps':
      return 'Patch Clamps line';
    case 'Shipping':
      return 'Shipping staging';
    case 'QA':
      return 'QA inspection / hold area';
    case 'Maintenance':
      return 'Maintenance shop';
    default:
      return `${department} station`;
  }
}

export function defaultAssignmentForDepartment(department: Department): string {
  switch (department) {
    case 'Receiving':
      return 'Receiving queue support';
    case 'Material Handling':
      return 'Material movement / cutting queue support';
    case 'Fab':
      return 'Fab order support';
    case 'Coating':
      return 'Coating queue support';
    case 'Assembly':
      return 'Assembly readiness support';
    case 'Shipping':
      return 'Shipping readiness support';
    case 'QA':
      return 'QA hold / inspection support';
    case 'Maintenance':
      return 'Open maintenance requests';
    default:
      return `${department} support`;
  }
}

export function isOtherDescriptionValid(value: string) {
  const trimmed = value.trim();
  return trimmed.length >= OTHER_DESCRIPTION_MIN && trimmed.length <= OTHER_DESCRIPTION_MAX;
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
