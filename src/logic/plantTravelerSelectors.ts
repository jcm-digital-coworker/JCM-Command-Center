import type { DynamicTraveler, PlantTraveler, TravelerAction } from '../types/dynamicTraveler';

const ACTIVE_STEP_STATUSES: DynamicTraveler['stepStatus'][] = [
  'READY',
  'ACTIVE',
  'BLOCKED',
  'HOLD',
];

export function getActivePlantTravelerStep(traveler: PlantTraveler): DynamicTraveler | undefined {
  return (
    traveler.departmentSteps.find((step) => step.department === traveler.activeDepartment) ??
    traveler.departmentSteps.find((step) => ACTIVE_STEP_STATUSES.includes(step.stepStatus)) ??
    traveler.departmentSteps[0]
  );
}

export function getActivePlantTravelerActions(traveler: PlantTraveler): TravelerAction[] {
  return getActivePlantTravelerStep(traveler)?.actions ?? [];
}

export function getPlantTravelerMaterialAction(traveler: PlantTraveler): TravelerAction | undefined {
  return getActivePlantTravelerActions(traveler).find((action) => action.type === 'REQUEST_MATERIAL');
}
