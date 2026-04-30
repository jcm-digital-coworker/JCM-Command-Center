import type { Department } from './machine';

export type BlueprintOperation = {
  department: Department;
  stationId?: string;
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
  drawingUrl?: string;
  materials: string[];
  routing: BlueprintOperation[];
  qaRequirements: string[];
  safetyNotes: string[];
  shippingNotes: string[];
};

export type StationPacket = {
  orderNumber: string;
  partNumber: string;
  revision: string;
  description: string;
  department: Department;
  status: 'READY' | 'WATCH' | 'BLOCKED' | 'MISSING_BLUEPRINT';
  priority: string;
  rightNow: string;
  operation?: string;
  instructions: string[];
  requiredChecks: string[];
  blockers: string[];
  materials: string[];
  qaRequirements: string[];
  safetyNotes: string[];
  nextHandoff?: Department;
  nextAction: string;
};
