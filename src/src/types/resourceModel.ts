export type ResourceCategory =
  | 'MACHINES'
  | 'EQUIPMENT'
  | 'WORK_CELLS'
  | 'PROCESS_ZONES'
  | 'ASSEMBLY_CELLS'
  | 'FLOW_LANES'
  | 'MATERIAL_FLOW'
  | 'VALIDATION_LAYER'
  | 'SUPPORT';

export type WorkCenterResourceModel = {
  department: string;
  category: ResourceCategory;
  displayLabel: string;
  commandQuestion: string;
};
