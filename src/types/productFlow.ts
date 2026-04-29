import type { Department } from './machine';
import type { ProductLane } from './productionOrder';

export type FlowDependency = {
  name: string;
  kind: 'MATERIAL' | 'MACHINE' | 'BUILDING' | 'WORK_CELL' | 'PROCESS_ZONE' | 'QA' | 'SHIPPING';
  required: boolean;
};

export type ProductFlow = {
  lane: ProductLane;
  label: string;
  departments: Department[];
  dependencies: FlowDependency[];
  bypassCapability: boolean;
  commandNote: string;
};
