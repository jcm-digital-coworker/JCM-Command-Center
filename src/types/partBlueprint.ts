import type { Department } from './machine';

export type BlueprintOperation = {
  department: Department;
  operation: string;
  instructions: string[];
  requiredChecks: string[];
  handoffTo?: Department;
};

export type PartBlueprint = {
  id: string;
  partNumber: string;
  revision: string;
  description: string;
  drawingTitle: string;
  materials: string[];
  routing: BlueprintOperation[];
  qaRequirements: string[];
  safetyNotes: string[];
  shippingNotes: string[];
};
